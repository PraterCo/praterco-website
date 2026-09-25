import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { createHandler } from '../src/app.js';
import { Store } from '../src/store.js';

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

async function completeConversation(base, session) {
  let response = await request(base, session, '/api/conversations', 'POST', { developmentConsent: true, noticeVersion: 'development-retention-v1' });
  assert.equal(response.status, 201);
  let data = await response.json();
  const id = data.conversation.id;
  for (const content of ['We may relocate this summer.', 'Within three months.', 'A calm process matters most.']) {
    response = await request(base, session, `/api/conversations/${id}/messages`, 'POST', { content });
    assert.equal(response.status, 200);
    data = await response.json();
  }
  assert.equal(data.conversation.understanding.state, 'pending');
  response = await request(base, session, `/api/conversations/${id}/understanding`, 'POST', { action: 'confirm' });
  assert.equal(response.status, 200);
  return id;
}

test('private routes require authentication and send restrictive headers', async (t) => {
  const { base } = await fixture(t);
  const response = await fetch(`${base}/api/conversations`);
  assert.equal(response.status, 401);
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow, noarchive');
  assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'none'/);
});

test('development consent and CSRF are affirmative gates', async (t) => {
  const { base } = await fixture(t);
  const session = await login(base, 'seller@example.test', 'synthetic-seller-pass');
  let response = await request(base, { ...session, csrf: 'wrong' }, '/api/conversations', 'POST', { developmentConsent: true, noticeVersion: 'development-retention-v1' });
  assert.equal(response.status, 403);
  response = await request(base, session, '/api/conversations', 'POST', { developmentConsent: false, noticeVersion: 'development-retention-v1' });
  assert.equal(response.status, 400);
});

test('synthetic seller flow persists, corrects understanding, and resumes', async (t) => {
  const { base, store } = await fixture(t);
  const session = await login(base, 'seller@example.test', 'synthetic-seller-pass');
  const id = await completeConversation(base, session);
  const before = store.getConversation(id, session.user.id);
  const latestParticipant = before.messages.filter((message) => message.role === 'participant').at(-1);
  store.saveUnderstanding(id, 'Old understanding', latestParticipant.sequence, 'pending');
  let response = await request(base, session, `/api/conversations/${id}/understanding`, 'POST', { action: 'correct', correction: 'Actually, protecting our timing matters most.' });
  assert.equal(response.status, 200);
  let data = await response.json();
  assert.equal(data.conversation.understanding.state, 'pending');
  assert.match(data.conversation.understanding.content, /protecting our timing/i);
  response = await request(base, session, `/api/conversations/${id}`);
  data = await response.json();
  assert.ok(data.conversation.messages.length >= 8);
});

test('handoff needs separate consent and Russell receives ordered context plus summary', async (t) => {
  const { base } = await fixture(t);
  const seller = await login(base, 'seller@example.test', 'synthetic-seller-pass');
  const id = await completeConversation(base, seller);
  let response = await request(base, seller, `/api/conversations/${id}/handoff`, 'POST', { channel: 'contact', consent: false, noticeVersion: 'handoff-context-v1' });
  assert.equal(response.status, 400);
  response = await request(base, seller, `/api/conversations/${id}/handoff`, 'POST', {
    channel: 'contact', consent: true, noticeVersion: 'handoff-context-v1',
    contact: { name: 'Synthetic Seller', replyTo: 'seller@example.test' }
  });
  assert.equal(response.status, 201);
  const created = await response.json();
  const russell = await login(base, 'russell@example.test', 'synthetic-russell-pass');
  response = await request(base, russell, `/api/russell/handoffs/${created.handoff.id}`);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.ok(data.handoff.package.messages.length >= 8);
  assert.ok(data.handoff.package.summary.sourceThroughSequence > 0);
  assert.equal(data.handoff.contact.name, 'Synthetic Seller');
});

test('roles and conversation owners are isolated', async (t) => {
  const { base } = await fixture(t);
  const seller = await login(base, 'seller@example.test', 'synthetic-seller-pass');
  const other = await login(base, 'other@example.test', 'synthetic-other-pass');
  const reviewer = await login(base, 'reviewer@example.test', 'synthetic-reviewer-pass');
  const id = await completeConversation(base, seller);
  let response = await request(base, other, `/api/conversations/${id}`);
  assert.equal(response.status, 404);
  response = await request(base, reviewer, '/api/russell/handoffs');
  assert.equal(response.status, 403);
  response = await request(base, seller, '/api/review/conversations');
  assert.equal(response.status, 403);
});

test('raw content is encrypted at rest and expiry deletes related records', async (t) => {
  const { base, store, dataDir } = await fixture(t);
  const seller = await login(base, 'seller@example.test', 'synthetic-seller-pass');
  const response = await request(base, seller, '/api/conversations', 'POST', { developmentConsent: true, noticeVersion: 'development-retention-v1' });
  const data = await response.json();
  const secretPhrase = 'synthetic private family situation';
  await request(base, seller, `/api/conversations/${data.conversation.id}/messages`, 'POST', { content: secretPhrase });
  const databaseBytes = fs.readFileSync(path.join(dataDir, 'russ-private.sqlite')).toString('latin1');
  assert.equal(databaseBytes.includes(secretPhrase), false);
  store.db.prepare('UPDATE conversations SET expires_at=? WHERE id=?').run('2000-01-01T00:00:00.000Z', data.conversation.id);
  assert.equal(store.expireData(new Date()), 1);
  assert.equal(store.getConversation(data.conversation.id, seller.user.id), null);
});

test('participant can delete retained conversation early', async (t) => {
  const { base } = await fixture(t);
  const seller = await login(base, 'seller@example.test', 'synthetic-seller-pass');
  const id = await completeConversation(base, seller);
  let response = await request(base, seller, `/api/conversations/${id}`, 'DELETE');
  assert.equal(response.status, 200);
  response = await request(base, seller, `/api/conversations/${id}`);
  assert.equal(response.status, 404);
});

test('review evaluation evidence is role-protected and avoids raw transcript duplication', async (t) => {
  const { base } = await fixture(t);
  const reviewer = await login(base, 'reviewer@example.test', 'synthetic-reviewer-pass');
  let response = await request(base, reviewer, '/api/review/evaluations', 'POST', {
    scenarioVersion: 'synthetic-seller-1', prototypeVersion: 'test', outcome: 'needs-revision',
    rubric: { acknowledgment: true, clarity: true, pressure: false }, defectReference: 'TEST-1'
  });
  assert.equal(response.status, 201);
  response = await request(base, reviewer, '/api/review/evaluations');
  const data = await response.json();
  assert.equal(data.evaluations[0].rubric.acknowledgment, true);
  assert.equal(JSON.stringify(data).includes('conversation text'), false);
});

test('manual backup is integrity-checked and readable', async (t) => {
  const { store } = await fixture(t);
  const destination = await store.createBackup(new Date('2026-09-25T17:00:00.000Z'));
  assert.equal(fs.existsSync(destination), true);
  assert.ok(fs.statSync(destination).size > 0);
});
