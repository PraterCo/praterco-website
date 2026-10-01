import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { createHandler } from '../src/app.js';
import { Store } from '../src/store.js';
import { BEHAVIOR_VERSION, emptyWorkingState } from '../src/provider.js';

const accounts = [
  { email: 'seller@example.test', password: 'synthetic-seller-pass', role: 'participant' },
  { email: 'other@example.test', password: 'synthetic-other-pass', role: 'participant' },
  { email: 'russell@example.test', password: 'synthetic-russell-pass', role: 'russell' },
  { email: 'reviewer@example.test', password: 'synthetic-reviewer-pass', role: 'reviewer' },
  { email: 'admin@example.test', password: 'synthetic-admin-pass', role: 'administrator' }
];

async function fixture(t) {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'russ-test-'));
  const config = {
    host: '127.0.0.1', port: 0, localHttp: true, secureCookies: false, dataDir,
    encryptionKey: Buffer.alloc(32, 7), sessionSecret: 'synthetic-session-secret-at-least-32-characters',
    accounts, russellPhone: '+15550000000', sessionHours: 1, retentionDays: 90, backupDays: 7
  };
  const store = new Store(config);
  const server = http.createServer(createHandler({ config, store }));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    store.close();
    fs.rmSync(dataDir, { recursive: true, force: true });
  });
  return { base, store, dataDir };
}

async function login(base, email, password) {
  const response = await fetch(`${base}/api/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base },
    body: JSON.stringify({ email, password })
  });
  assert.equal(response.status, 200);
  const session = await response.json();
  return { cookie: response.headers.get('set-cookie').split(';')[0], csrf: session.csrf, user: session.user };
}

async function request(base, session, pathName, method = 'GET', body) {
  return fetch(`${base}${pathName}`, {
    method,
    headers: { Cookie: session?.cookie || '', ...(session?.csrf ? { 'X-CSRF-Token': session.csrf } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
}

async function createConversation(base, session) {
  const response = await request(base, session, '/api/conversations', 'POST', { developmentConsent: true, noticeVersion: 'development-retention-v1' });
  assert.equal(response.status, 201);
  return (await response.json()).conversation;
}

async function createConfirmedConversation(base, session) {
  const conversation = await createConversation(base, session);
  let response = await request(base, session, `/api/conversations/${conversation.id}/messages`, 'POST', { content: 'We need more space, but keeping the move affordable matters.' });
  assert.equal(response.status, 200);
  let data = await response.json();
  assert.equal(data.conversation.understanding.needsResponse, true);
  response = await request(base, session, `/api/conversations/${conversation.id}/understanding`, 'POST', { action: 'confirm' });
  assert.equal(response.status, 200);
  data = await response.json();
  assert.equal(data.conversation.understanding, null);
  return conversation.id;
}

function allKeys(value, keys = []) {
  if (!value || typeof value !== 'object') return keys;
  if (Array.isArray(value)) { for (const item of value) allKeys(item, keys); return keys; }
  for (const [key, child] of Object.entries(value)) { keys.push(key); allKeys(child, keys); }
  return keys;
}

test('private routes require authentication and use restrictive headers', async (t) => {
  const { base } = await fixture(t);
  const response = await fetch(`${base}/api/conversations`);
  assert.equal(response.status, 401);
  const body = await response.json();
  assert.equal(body.error.kind, 'authentication');
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow, noarchive');
  assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'none'/);
});

test('development consent and CSRF remain affirmative gates', async (t) => {
  const { base } = await fixture(t);
  const session = await login(base, 'seller@example.test', 'synthetic-seller-pass');
  let response = await request(base, { ...session, csrf: 'wrong' }, '/api/conversations', 'POST', { developmentConsent: true, noticeVersion: 'development-retention-v1' });
  assert.equal(response.status, 403);
  response = await request(base, session, '/api/conversations', 'POST', { developmentConsent: false, noticeVersion: 'development-retention-v1' });
  assert.equal(response.status, 400);
});

test('F-022 and F-029 immediate human requests bypass discovery and confirmation', async (t) => {
  const { base } = await fixture(t);
  const session = await login(base, 'seller@example.test', 'synthetic-seller-pass');
  for (const content of ['I just want to talk to Russell.', 'Call me.']) {
    const conversation = await createConversation(base, session);
    const response = await request(base, session, `/api/conversations/${conversation.id}/messages`, 'POST', { content });
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.controls.humanAvailable, true);
    assert.ok(['choices', 'contact'].includes(data.controls.openHuman));
    assert.equal(data.conversation.understanding, null);
    assert.match(data.conversation.messages.at(-1).content, /Russell now|contact you/i);
  }
});

test('participant response schema excludes private classification and provenance', async (t) => {
  const { base } = await fixture(t);
  const session = await login(base, 'seller@example.test', 'synthetic-seller-pass');
  const conversation = await createConversation(base, session);
  let response = await request(base, session, `/api/conversations/${conversation.id}/messages`, 'POST', { content: 'Actually, next spring.' });
  const data = await response.json();
  const keys = new Set(allKeys(data));
  for (const forbidden of ['kind', 'correctionOf', 'sequence', 'sourceSequence', 'providerVersion', 'workingState', 'behaviorVersion', 'id']) {
    if (forbidden === 'id') {
      assert.equal(Object.hasOwn(data.conversation.understanding || {}, 'id'), false);
      continue;
    }
    assert.equal(keys.has(forbidden), false, `participant payload leaked ${forbidden}`);
  }
  assert.deepEqual(Object.keys(data.conversation.messages[0]).sort(), ['content', 'role']);
});

test('F-024 independent call/text needs no transfer and contact-only request shares no context', async (t) => {
  const { base } = await fixture(t);
  const seller = await login(base, 'seller@example.test', 'synthetic-seller-pass');
  const conversation = await createConversation(base, seller);
  let response = await request(base, seller, `/api/conversations/${conversation.id}/handoff`, 'POST', {
    channel: 'contact', shareContext: false, consent: false,
    contact: { name: 'Synthetic Seller', replyTo: 'seller@example.test' }
  });
  assert.equal(response.status, 201);
  const created = await response.json();
  assert.equal(created.continuation.contextShared, false);
  const russell = await login(base, 'russell@example.test', 'synthetic-russell-pass');
  response = await request(base, russell, '/api/russell/handoffs');
  const list = await response.json();
  response = await request(base, russell, `/api/russell/handoffs/${list.handoffs[0].id}`);
  const detail = await response.json();
  assert.equal(detail.handoff.package.contextShared, false);
  assert.deepEqual(detail.handoff.package.messages, []);
  assert.equal(detail.handoff.package.summary, null);
});

test('F-023 context handoff requires separate consent and preserves ordered context', async (t) => {
  const { base } = await fixture(t);
  const seller = await login(base, 'seller@example.test', 'synthetic-seller-pass');
  const id = await createConfirmedConversation(base, seller);
  let response = await request(base, seller, `/api/conversations/${id}/handoff`, 'POST', { channel: 'call', shareContext: true, consent: false, noticeVersion: 'handoff-context-v2' });
  assert.equal(response.status, 400);
  response = await request(base, seller, `/api/conversations/${id}/handoff`, 'POST', { channel: 'call', shareContext: true, consent: true, noticeVersion: 'handoff-context-v2' });
  assert.equal(response.status, 201);
  const russell = await login(base, 'russell@example.test', 'synthetic-russell-pass');
  const listResponse = await request(base, russell, '/api/russell/handoffs');
  const list = await listResponse.json();
  const detailResponse = await request(base, russell, `/api/russell/handoffs/${list.handoffs[0].id}`);
  const detail = await detailResponse.json();
  assert.equal(detail.handoff.package.contextShared, true);
  assert.ok(detail.handoff.package.messages.length >= 4);
  assert.ok(detail.handoff.package.summary.sourceThroughSequence > 0);
  assert.equal(detail.handoff.package.consent.affirmative, true);
  assert.doesNotMatch(JSON.stringify(detail.handoff.package.messages), /\"kind\"|\"id\"|\"providerVersion\"/);
});

test('F-018 and F-025 resume is neutral and offers control without replaying sensitivity', async (t) => {
  const { base } = await fixture(t);
  const seller = await login(base, 'seller@example.test', 'synthetic-seller-pass');
  const conversation = await createConversation(base, seller);
  await request(base, seller, `/api/conversations/${conversation.id}/messages`, 'POST', { content: 'My husband died three weeks ago and I may need to move.' });
  const response = await request(base, seller, `/api/conversations/${conversation.id}`);
  const data = await response.json();
  assert.equal(data.conversation.resume.required, true);
  assert.match(data.conversation.resume.text, /continue|correct|change the topic|new conversation/i);
  assert.doesNotMatch(data.conversation.resume.text, /husband|died|three weeks/i);
});

test('natural correction updates private memory while public summary omits provenance', async (t) => {
  const { base, store } = await fixture(t);
  const seller = await login(base, 'seller@example.test', 'synthetic-seller-pass');
  const conversation = await createConversation(base, seller);
  await request(base, seller, `/api/conversations/${conversation.id}/messages`, 'POST', { content: 'We may sell this spring.' });
  const response = await request(base, seller, `/api/conversations/${conversation.id}/messages`, 'POST', { content: 'No, next spring.' });
  const data = await response.json();
  assert.match(data.conversation.understanding.text, /next spring/i);
  assert.doesNotMatch(data.conversation.understanding.text, /current timing is this spring/i);
  const privateConversation = store.getConversation(conversation.id, seller.user.id);
  assert.equal(privateConversation.workingState.facts.timeline.value, 'next spring');
  assert.equal(privateConversation.workingState.corrections.at(-1).superseded, 'this spring');
});

test('F-026 service failure is distinct from authentication failure and session remains valid', async (t) => {
  const { base, store } = await fixture(t);
  const seller = await login(base, 'seller@example.test', 'synthetic-seller-pass');
  const original = store.listConversations.bind(store);
  store.listConversations = () => { throw new Error('synthetic persistence failure'); };
  let response = await request(base, seller, '/api/conversations');
  assert.equal(response.status, 500);
  let data = await response.json();
  assert.deepEqual(data.error, { kind: 'service', message: 'Russ could not complete that request. Your conversation and draft are still here.', retryable: true });
  store.listConversations = original;
  response = await request(base, seller, '/api/session');
  assert.equal(response.status, 200);
  data = await response.json();
  assert.equal(data.user.email, 'seller@example.test');
});

test('roles and conversation owners remain isolated', async (t) => {
  const { base } = await fixture(t);
  const seller = await login(base, 'seller@example.test', 'synthetic-seller-pass');
  const other = await login(base, 'other@example.test', 'synthetic-other-pass');
  const reviewer = await login(base, 'reviewer@example.test', 'synthetic-reviewer-pass');
  const conversation = await createConversation(base, seller);
  let response = await request(base, other, `/api/conversations/${conversation.id}`);
  assert.equal(response.status, 404);
  response = await request(base, reviewer, '/api/russell/handoffs');
  assert.equal(response.status, 403);
  response = await request(base, seller, '/api/review/evaluations');
  assert.equal(response.status, 403);
});

test('raw content and private working state are encrypted at rest, then expire together', async (t) => {
  const { base, store, dataDir } = await fixture(t);
  const seller = await login(base, 'seller@example.test', 'synthetic-seller-pass');
  const conversation = await createConversation(base, seller);
  const phrase = 'synthetic private family situation';
  await request(base, seller, `/api/conversations/${conversation.id}/messages`, 'POST', { content: phrase });
  const databaseBytes = fs.readFileSync(path.join(dataDir, 'russ-private.sqlite')).toString('latin1');
  assert.equal(databaseBytes.includes(phrase), false);
  assert.equal(databaseBytes.includes('questionPreference'), false);
  store.db.prepare('UPDATE conversations SET expires_at=? WHERE id=?').run('2000-01-01T00:00:00.000Z', conversation.id);
  assert.equal(store.expireData(new Date()), 1);
  assert.equal(store.getConversation(conversation.id, seller.user.id), null);
});

test('participant can delete retained conversation early', async (t) => {
  const { base } = await fixture(t);
  const seller = await login(base, 'seller@example.test', 'synthetic-seller-pass');
  const conversation = await createConversation(base, seller);
  let response = await request(base, seller, `/api/conversations/${conversation.id}`, 'DELETE');
  assert.equal(response.status, 200);
  response = await request(base, seller, `/api/conversations/${conversation.id}`);
  assert.equal(response.status, 404);
});

test('evaluation outcomes align to canonical labels', async (t) => {
  const { base } = await fixture(t);
  const reviewer = await login(base, 'reviewer@example.test', 'synthetic-reviewer-pass');
  for (const outcome of ['PASS', 'CONCERN', 'FAIL', 'NOT APPLICABLE']) {
    const response = await request(base, reviewer, '/api/review/evaluations', 'POST', {
      scenarioVersion: 'private-seller-1.0.0', prototypeVersion: 'test', outcome,
      rubric: { listened: outcome }
    });
    assert.equal(response.status, 201);
  }
  const invalid = await request(base, reviewer, '/api/review/evaluations', 'POST', {
    scenarioVersion: 'private-seller-1.0.0', prototypeVersion: 'test', outcome: 'needs-revision', rubric: {}
  });
  assert.equal(invalid.status, 400);
});

test('manual backup is integrity-checked and readable', async (t) => {
  const { store } = await fixture(t);
  const destination = await store.createBackup(new Date('2026-09-28T17:00:00.000Z'));
  assert.equal(fs.existsSync(destination), true);
  assert.ok(fs.statSync(destination).size > 0);
});


test('F-018 stale timeline is verified before use after resume', async (t) => {
  const { base, store } = await fixture(t);
  const seller = await login(base, 'seller@example.test', 'synthetic-seller-pass');
  const conversation = await createConversation(base, seller);
  const state = emptyWorkingState();
  state.facts.timeline = { value: 'june', updatedAt: '2026-05-15T12:00:00.000Z', status: 'current' };
  state.updatedAt = '2026-05-15T12:00:00.000Z';
  store.saveWorkingState(conversation.id, BEHAVIOR_VERSION, state);

  const response = await request(base, seller, `/api/conversations/${conversation.id}/messages`, 'POST', { content: "I'm back." });
  assert.equal(response.status, 200);
  const data = await response.json();
  const latest = data.conversation.messages.at(-1).content;
  assert.match(latest, /earlier timing may no longer be current|does that plan still fit/i);
  assert.doesNotMatch(latest, /selling in june|since.*june/i);
});

test('F-029 uses a provided phone number without requiring it again or sharing context', async (t) => {
  const { base } = await fixture(t);
  const seller = await login(base, 'seller@example.test', 'synthetic-seller-pass');
  const conversation = await createConversation(base, seller);

  let response = await request(base, seller, `/api/conversations/${conversation.id}/messages`, 'POST', { content: '555-0100. Call me about selling.' });
  assert.equal(response.status, 200);
  let data = await response.json();
  assert.equal(data.controls.openHuman, 'contact');
  assert.equal(data.controls.contactReplyTo, '555-0100');
  assert.equal(data.conversation.understanding, null);

  response = await request(base, seller, `/api/conversations/${conversation.id}/handoff`, 'POST', {
    channel: 'contact',
    shareContext: false,
    consent: false,
    contact: { replyTo: data.controls.contactReplyTo }
  });
  assert.equal(response.status, 201);
  data = await response.json();
  assert.equal(data.continuation.contextShared, false);

  const russell = await login(base, 'russell@example.test', 'synthetic-russell-pass');
  response = await request(base, russell, '/api/russell/handoffs');
  const list = await response.json();
  response = await request(base, russell, `/api/russell/handoffs/${list.handoffs[0].id}`);
  const detail = await response.json();
  assert.equal(detail.handoff.contact.replyTo, '555-0100');
  assert.equal(detail.handoff.contact.name, undefined);
  assert.equal(detail.handoff.package.contextShared, false);
  assert.deepEqual(detail.handoff.package.messages, []);
  assert.equal(detail.handoff.package.summary, null);
});
