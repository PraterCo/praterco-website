import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BEHAVIOR_VERSION, buildUnderstanding, directionAfterConfirmation, nextTurn } from './provider.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const loginAttempts = new Map();
const DEVELOPMENT_NOTICE = 'development-retention-v1';
const HANDOFF_NOTICE = 'handoff-context-v1';
const ROLE_SETS = {
  participant: new Set(['participant']),
  reviewer: new Set(['reviewer', 'administrator']),
  russell: new Set(['russell', 'administrator']),
  administrator: new Set(['administrator'])
};

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function cookies(header = '') {
  return Object.fromEntries(header.split(';').map((part) => part.trim().split('=').map(decodeURIComponent)).filter((pair) => pair.length === 2));
}

function securityHeaders(config) {
  return {
    'Cache-Control': 'no-store',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-Robots-Tag': 'noindex, nofollow, noarchive'
  };
}

function send(res, status, body, headers = {}) {
  const isObject = typeof body !== 'string' && !Buffer.isBuffer(body);
  const payload = isObject ? JSON.stringify(body) : body;
  res.writeHead(status, { 'Content-Type': isObject ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8', ...headers });
  res.end(payload);
}

async function readJson(req) {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.startsWith('application/json')) throw new HttpError(415, 'Use application/json.');
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 16384) throw new HttpError(413, 'Request is too large.');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new HttpError(400, 'The request could not be read.'); }
}

function sessionFor(req, store) {
  return store.getSession(cookies(req.headers.cookie).russ_session);
}

function requireSession(req, store, role = null) {
  const session = sessionFor(req, store);
  if (!session) throw new HttpError(401, 'Sign in is required.');
  if (role && !ROLE_SETS[role].has(session.user.role)) throw new HttpError(403, 'You do not have access to this area.');
  return session;
}

function requireCsrf(req, session) {
  if (!session || req.headers['x-csrf-token'] !== session.csrf) throw new HttpError(403, 'Your session could not be verified. Refresh and try again.');
}

function clientKey(req) { return req.socket.remoteAddress || 'unknown'; }

function checkLoginLimit(req) {
  const key = clientKey(req);
  const state = loginAttempts.get(key) || { count: 0, since: Date.now() };
  if (Date.now() - state.since > 15 * 60000) { state.count = 0; state.since = Date.now(); }
  if (state.count >= 8) throw new HttpError(429, 'Too many sign-in attempts. Wait and try again.');
  state.count += 1;
  loginAttempts.set(key, state);
}

function clearLoginLimit(req) { loginAttempts.delete(clientKey(req)); }

function originAllowed(req, config) {
  const origin = req.headers.origin;
  if (!origin) return true;
  const protocol = config.localHttp ? 'http' : 'https';
  const host = req.headers.host;
  return origin === `${protocol}://${host}`;
}

function publicConversation(conversation) {
  return {
    id: conversation.id, status: conversation.status, createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt, expiresAt: conversation.expiresAt,
    messages: conversation.messages.map(({ id, role, content, kind, correctionOf, sequence, createdAt }) => ({ id, role, content, kind, correctionOf, sequence, createdAt })),
    understanding: conversation.understanding
  };
}

function activeParticipantMessages(messages) {
  const superseded = new Set(messages.map((message) => message.correctionOf).filter(Boolean));
  return messages.filter((message) => message.role === 'participant' && !superseded.has(message.id));
}

export function createHandler({ config, store }) {
  return async function handler(req, res) {
    Object.entries(securityHeaders(config)).forEach(([key, value]) => res.setHeader(key, value));
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const method = req.method || 'GET';

    try {
      if (method === 'GET' && url.pathname === '/robots.txt') return send(res, 200, 'User-agent: *\nDisallow: /\n');

      if (method === 'POST' && url.pathname === '/api/login') {
        if (!originAllowed(req, config)) throw new HttpError(403, 'Sign-in request was rejected.');
        checkLoginLimit(req);
        const body = await readJson(req);
        const user = store.authenticate(body.email || '', body.password || '');
        if (!user) {
          store.audit(null, 'authentication.failed', 'user', null, 'denied');
          throw new HttpError(401, 'Email or password is incorrect.');
        }
        clearLoginLimit(req);
        const session = store.createSession(user);
        const secure = config.secureCookies ? '; Secure' : '';
        res.setHeader('Set-Cookie', `russ_session=${encodeURIComponent(session.token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${config.sessionHours * 3600}${secure}`);
        return send(res, 200, { user, csrf: session.csrf });
      }

      if (method === 'GET' && url.pathname === '/api/session') {
        const session = requireSession(req, store);
        return send(res, 200, { user: session.user, csrf: session.csrf, developmentNoticeVersion: DEVELOPMENT_NOTICE, handoffNoticeVersion: HANDOFF_NOTICE, russellPhone: config.russellPhone });
      }

      if (method === 'POST' && url.pathname === '/api/logout') {
        const session = requireSession(req, store);
        requireCsrf(req, session);
        store.deleteSession(cookies(req.headers.cookie).russ_session);
        res.setHeader('Set-Cookie', 'russ_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
        return send(res, 200, { ok: true });
      }

      if (method === 'GET' && url.pathname === '/api/conversations') {
        const session = requireSession(req, store, 'participant');
        return send(res, 200, { conversations: store.listConversations(session.user.id) });
      }

      if (method === 'POST' && url.pathname === '/api/conversations') {
        const session = requireSession(req, store, 'participant');
        requireCsrf(req, session);
        const body = await readJson(req);
        if (body.developmentConsent !== true || body.noticeVersion !== DEVELOPMENT_NOTICE) throw new HttpError(400, 'Affirmative development-retention consent is required.');
        const conversation = store.createConversation(session.user.id, BEHAVIOR_VERSION, DEVELOPMENT_NOTICE);
        const turn = nextTurn([]);
        store.addMessage(conversation.id, 'russ', turn.text, turn.kind);
        return send(res, 201, { conversation: publicConversation(store.getConversation(conversation.id, session.user.id)), quickReplies: turn.quickReplies });
      }

      const conversationMatch = url.pathname.match(/^\/api\/conversations\/([0-9a-f-]+)$/);
      if (conversationMatch && method === 'GET') {
        const session = requireSession(req, store, 'participant');
        const conversation = store.getConversation(conversationMatch[1], session.user.id);
        if (!conversation) throw new HttpError(404, 'Conversation was not found.');
        const turn = nextTurn(conversation.messages);
        return send(res, 200, { conversation: publicConversation(conversation), quickReplies: turn.kind === 'question' ? turn.quickReplies : [] });
      }

      if (conversationMatch && method === 'DELETE') {
        const session = requireSession(req, store, 'participant');
        requireCsrf(req, session);
        if (!store.deleteConversation(conversationMatch[1], session.user.id, session.user.id)) throw new HttpError(404, 'Conversation was not found.');
        return send(res, 200, { deleted: true });
      }

      const messageMatch = url.pathname.match(/^\/api\/conversations\/([0-9a-f-]+)\/messages$/);
      if (messageMatch && method === 'POST') {
        const session = requireSession(req, store, 'participant');
        requireCsrf(req, session);
        const body = await readJson(req);
        const content = String(body.content || '').trim();
        if (!content || content.length > 2000) throw new HttpError(400, 'Enter a message between 1 and 2,000 characters.');
        const conversation = store.getConversation(messageMatch[1], session.user.id);
        if (!conversation) throw new HttpError(404, 'Conversation was not found.');
        if (conversation.understanding?.state === 'pending') throw new HttpError(409, 'Confirm or correct the current understanding first.');
        store.addMessage(conversation.id, 'participant', content);
        const updated = store.getConversation(conversation.id, session.user.id);
        const turn = nextTurn(updated.messages);
        let understanding = null;
        if (turn.kind === 'understanding') {
          if (turn.text) store.addMessage(conversation.id, 'russ', turn.text, 'acknowledgement');
          const active = activeParticipantMessages(store.getConversation(conversation.id, session.user.id).messages);
          understanding = store.saveUnderstanding(conversation.id, buildUnderstanding(active), active.at(-1).sequence);
        } else {
          store.addMessage(conversation.id, 'russ', turn.text, turn.kind);
        }
        return send(res, 200, { conversation: publicConversation(store.getConversation(conversation.id, session.user.id)), quickReplies: turn.quickReplies || [], understanding });
      }

      const understandingMatch = url.pathname.match(/^\/api\/conversations\/([0-9a-f-]+)\/understanding$/);
      if (understandingMatch && method === 'POST') {
        const session = requireSession(req, store, 'participant');
        requireCsrf(req, session);
        const body = await readJson(req);
        const conversation = store.getConversation(understandingMatch[1], session.user.id);
        if (!conversation?.understanding || conversation.understanding.state !== 'pending') throw new HttpError(409, 'There is no understanding awaiting review.');
        if (body.action === 'confirm') {
          store.setUnderstandingState(conversation.understanding.id, 'confirmed');
          const direction = directionAfterConfirmation();
          store.addMessage(conversation.id, 'russ', direction.text, 'direction');
        } else if (body.action === 'correct') {
          const correction = String(body.correction || '').trim();
          if (!correction || correction.length > 1000) throw new HttpError(400, 'Enter a correction between 1 and 1,000 characters.');
          store.setUnderstandingState(conversation.understanding.id, 'corrected');
          const latestParticipant = activeParticipantMessages(conversation.messages).at(-1);
          store.addMessage(conversation.id, 'participant', correction, 'correction', latestParticipant?.id || null);
          const revised = store.getConversation(conversation.id, session.user.id);
          const active = activeParticipantMessages(revised.messages);
          store.addMessage(conversation.id, 'russ', 'Thank you for correcting that. I will use what you just told me.', 'acknowledgement');
          store.saveUnderstanding(conversation.id, buildUnderstanding(active), active.at(-1).sequence);
        } else throw new HttpError(400, 'Choose confirm or correct.');
        return send(res, 200, { conversation: publicConversation(store.getConversation(conversation.id, session.user.id)) });
      }

      const handoffMatch = url.pathname.match(/^\/api\/conversations\/([0-9a-f-]+)\/handoff$/);
      if (handoffMatch && method === 'POST') {
        const session = requireSession(req, store, 'participant');
        requireCsrf(req, session);
        const body = await readJson(req);
        const conversation = store.getConversation(handoffMatch[1], session.user.id);
        if (!conversation) throw new HttpError(404, 'Conversation was not found.');
        if (conversation.status === 'handoff-ready') throw new HttpError(409, 'This conversation has already been shared with Russell.');
        if (body.consent !== true || body.noticeVersion !== HANDOFF_NOTICE) throw new HttpError(400, 'Conversation sharing requires a separate affirmative choice.');
        if (!conversation.understanding || conversation.understanding.state !== 'confirmed') throw new HttpError(409, 'Confirm the conversation understanding before sharing it.');
        if (!['call', 'text', 'contact'].includes(body.channel)) throw new HttpError(400, 'Choose an available continuation method.');
        let contact = null;
        if (body.channel === 'contact') {
          const name = String(body.contact?.name || '').trim();
          const replyTo = String(body.contact?.replyTo || '').trim();
          if (!name || !replyTo || name.length > 120 || replyTo.length > 200) throw new HttpError(400, 'Name and a phone number or email are required.');
          contact = { name, replyTo };
        }
        const participantMessages = activeParticipantMessages(conversation.messages);
        const summary = buildUnderstanding(participantMessages);
        const handoff = store.createHandoff(conversation, session.user.id, body.channel, HANDOFF_NOTICE, contact, summary);
        return send(res, 201, { handoff });
      }

      if (method === 'GET' && url.pathname === '/api/russell/handoffs') {
        requireSession(req, store, 'russell');
        return send(res, 200, { handoffs: store.listHandoffs() });
      }

      const russellHandoffMatch = url.pathname.match(/^\/api\/russell\/handoffs\/([0-9a-f-]+)$/);
      if (russellHandoffMatch && method === 'GET') {
        const session = requireSession(req, store, 'russell');
        const handoff = store.getHandoff(russellHandoffMatch[1], session.user.id);
        if (!handoff) throw new HttpError(404, 'Handoff was not found.');
        return send(res, 200, { handoff });
      }

      if (method === 'GET' && url.pathname === '/api/review/conversations') {
        const session = requireSession(req, store, 'reviewer');
        store.audit(session.user.id, 'review.list', 'conversation', null, 'success');
        return send(res, 200, { note: 'Reviewer access is purpose-bound. Use synthetic scenarios for automated evaluation.', conversations: [] });
      }

      if (method === 'GET' && url.pathname === '/api/review/evaluations') {
        const session = requireSession(req, store, 'reviewer');
        return send(res, 200, { evaluations: store.listEvaluations(session.user.id) });
      }

      if (method === 'POST' && url.pathname === '/api/review/evaluations') {
        const session = requireSession(req, store, 'reviewer');
        requireCsrf(req, session);
        const body = await readJson(req);
        const outcome = String(body.outcome || '');
        const scenarioVersion = String(body.scenarioVersion || '').trim();
        const prototypeVersion = String(body.prototypeVersion || '').trim();
        if (!['pass', 'fail', 'needs-revision'].includes(outcome) || !scenarioVersion || !prototypeVersion) throw new HttpError(400, 'Scenario version, prototype version, and a valid outcome are required.');
        const rubric = body.rubric;
        if (!rubric || typeof rubric !== 'object' || Array.isArray(rubric)) throw new HttpError(400, 'A structured rubric is required.');
        return send(res, 201, { evaluation: store.createEvaluation(session.user.id, { scenarioVersion, prototypeVersion, outcome, rubric, defectReference: String(body.defectReference || '').slice(0, 200) }) });
      }

      if (method === 'POST' && url.pathname === '/api/admin/retention/run') {
        const session = requireSession(req, store, 'administrator');
        requireCsrf(req, session);
        const expired = store.expireData();
        store.audit(session.user.id, 'retention.run', 'system', null, 'success');
        return send(res, 200, { expired });
      }

      const staticFiles = {
        '/': ['index.html', 'text/html; charset=utf-8'],
        '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
        '/styles.css': ['styles.css', 'text/css; charset=utf-8']
      };
      if (method === 'GET' && staticFiles[url.pathname]) {
        const [filename, type] = staticFiles[url.pathname];
        res.setHeader('Content-Type', type);
        res.writeHead(200);
        return fs.createReadStream(path.join(publicDir, filename)).pipe(res);
      }

      throw new HttpError(404, 'Not found.');
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500;
      if (status === 500) store.audit(null, 'request.failed', 'system', null, 'error');
      return send(res, status, { error: status === 500 ? 'Russ is unavailable right now. Your message was not sent. Please try again.' : error.message });
    }
  };
}
