import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BEHAVIOR_VERSION, buildUnderstanding, directionAfterConfirmation, emptyWorkingState, initialTurn, MODES, selectNextMove } from './provider.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const repoAssetsDir = path.resolve(root, '..', '..', 'assets');
const loginAttempts = new Map();
const DEVELOPMENT_NOTICE = 'development-retention-v1';
const HANDOFF_NOTICE = 'handoff-context-v2';
const ROLE_SETS = {
  participant: new Set(['participant']), reviewer: new Set(['reviewer', 'administrator']),
  russell: new Set(['russell', 'administrator']), administrator: new Set(['administrator'])
};

class HttpError extends Error {
  constructor(status, message, kind = null) { super(message); this.status = status; this.kind = kind; }
}

function cookies(header = '') {
  return Object.fromEntries(header.split(';').map((part) => part.trim().split('=').map(decodeURIComponent)).filter((pair) => pair.length === 2));
}

function securityHeaders() {
  return {
    'Cache-Control': 'no-store',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
    'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Resource-Policy': 'same-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY', 'X-Robots-Tag': 'noindex, nofollow, noarchive'
  };
}

function send(res, status, body, headers = {}) {
  const isObject = typeof body !== 'string' && !Buffer.isBuffer(body);
  const payload = isObject ? JSON.stringify(body) : body;
  res.writeHead(status, { 'Content-Type': isObject ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8', ...headers });
  res.end(payload);
}

async function readJson(req) {
  if (!(req.headers['content-type'] || '').startsWith('application/json')) throw new HttpError(415, 'Use application/json.', 'validation');
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 16384) throw new HttpError(413, 'Request is too large.', 'validation');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new HttpError(400, 'The request could not be read.', 'validation'); }
}

function sessionFor(req, store) { return store.getSession(cookies(req.headers.cookie).russ_session); }

function requireSession(req, store, role = null) {
  const session = sessionFor(req, store);
  if (!session) throw new HttpError(401, 'Your private session has ended. Sign in again to continue.', 'authentication');
  if (role && !ROLE_SETS[role].has(session.user.role)) throw new HttpError(403, 'You do not have access to this area.', 'authorization');
  return session;
}

function requireCsrf(req, session) {
  if (!session || req.headers['x-csrf-token'] !== session.csrf) throw new HttpError(403, 'Your session could not be verified. Refresh and try again.', 'authorization');
}

function clientKey(req) { return req.socket.remoteAddress || 'unknown'; }
function checkLoginLimit(req) {
  const key = clientKey(req);
  const state = loginAttempts.get(key) || { count: 0, since: Date.now() };
  if (Date.now() - state.since > 15 * 60000) { state.count = 0; state.since = Date.now(); }
  if (state.count >= 8) throw new HttpError(429, 'Too many sign-in attempts. Wait and try again.', 'authentication');
  state.count += 1;
  loginAttempts.set(key, state);
}
function clearLoginLimit(req) { loginAttempts.delete(clientKey(req)); }
function originAllowed(req, config) {
  const origin = req.headers.origin;
  if (!origin) return true;
  return origin === `${config.localHttp ? 'http' : 'https'}://${req.headers.host}`;
}

function visitorConversation(conversation, { returning = false } = {}) {
  const pendingUnderstanding = conversation.understanding?.state === 'pending'
    ? { text: conversation.understanding.content, needsResponse: true }
    : null;
  return {
    id: conversation.id,
    state: conversation.status === 'handoff-ready' ? 'shared' : 'active',
    retentionThrough: conversation.expiresAt,
    messages: conversation.messages.map(({ role, content }) => ({ role: role === 'participant' ? 'participant' : 'russ', content })),
    understanding: pendingUnderstanding,
    resume: returning && conversation.messages.length > 1 ? {
      required: true,
      text: 'Welcome back. Your private conversation is still here. Continue where you left off, correct something, change the topic, or start a new conversation.'
    } : null
  };
}

function visitorControls(turn = {}) {
  return {
    quickReplies: turn.quickReplies || [],
    humanAvailable: true,
    openHuman: turn.mode === MODES.HUMAN ? (turn.contactRequested ? 'contact' : 'choices') : null,
    focus: turn.understanding ? 'understanding' : turn.mode === MODES.HUMAN ? 'human' : 'composer'
  };
}

function activeParticipantMessages(messages) {
  const superseded = new Set(messages.map((message) => message.correctionOf).filter(Boolean));
  return messages.filter((message) => message.role === 'participant' && !superseded.has(message.id));
}

export function createHandler({ config, store }) {
  return async function handler(req, res) {
    Object.entries(securityHeaders()).forEach(([key, value]) => res.setHeader(key, value));
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const method = req.method || 'GET';
    try {
      if (method === 'GET' && url.pathname === '/robots.txt') return send(res, 200, 'User-agent: *\nDisallow: /\n');

      if (method === 'POST' && url.pathname === '/api/login') {
        if (!originAllowed(req, config)) throw new HttpError(403, 'Sign-in request was rejected.', 'authentication');
        checkLoginLimit(req);
        const body = await readJson(req);
        const user = store.authenticate(body.email || '', body.password || '');
        if (!user) {
          store.audit(null, 'authentication.failed', 'user', null, 'denied');
          throw new HttpError(401, 'Email or password is incorrect.', 'authentication');
        }
        clearLoginLimit(req);
        const session = store.createSession(user);
        res.setHeader('Set-Cookie', `russ_session=${encodeURIComponent(session.token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${config.sessionHours * 3600}${config.secureCookies ? '; Secure' : ''}`);
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
        const conversations = store.listConversations(session.user.id).map((item) => ({ id: item.id, state: item.status === 'handoff-ready' ? 'shared' : 'active', lastActiveAt: item.updated_at }));
        return send(res, 200, { conversations });
      }

      if (method === 'POST' && url.pathname === '/api/conversations') {
        const session = requireSession(req, store, 'participant');
        requireCsrf(req, session);
        const body = await readJson(req);
        if (body.developmentConsent !== true || body.noticeVersion !== DEVELOPMENT_NOTICE) throw new HttpError(400, 'Choose the private-review retention option before starting.', 'validation');
        const conversation = store.createConversation(session.user.id, BEHAVIOR_VERSION, DEVELOPMENT_NOTICE);
        store.saveWorkingState(conversation.id, BEHAVIOR_VERSION, emptyWorkingState());
        const turn = initialTurn();
        store.addMessage(conversation.id, 'russ', turn.text, turn.mode);
        return send(res, 201, { conversation: visitorConversation(store.getConversation(conversation.id, session.user.id)), controls: visitorControls(turn) });
      }

      const conversationMatch = url.pathname.match(/^\/api\/conversations\/([0-9a-f-]+)$/);
      if (conversationMatch && method === 'GET') {
        const session = requireSession(req, store, 'participant');
        const conversation = store.getConversation(conversationMatch[1], session.user.id);
        if (!conversation) throw new HttpError(404, 'That conversation is no longer available.', 'data');
        return send(res, 200, { conversation: visitorConversation(conversation, { returning: true }), controls: visitorControls() });
      }

      if (conversationMatch && method === 'DELETE') {
        const session = requireSession(req, store, 'participant');
        requireCsrf(req, session);
        if (!store.deleteConversation(conversationMatch[1], session.user.id, session.user.id)) throw new HttpError(404, 'That conversation is no longer available.', 'data');
        return send(res, 200, { deleted: true });
      }

      const messageMatch = url.pathname.match(/^\/api\/conversations\/([0-9a-f-]+)\/messages$/);
      if (messageMatch && method === 'POST') {
        const session = requireSession(req, store, 'participant');
        requireCsrf(req, session);
        const body = await readJson(req);
        const content = String(body.content || '').trim();
        if (!content || content.length > 2000) throw new HttpError(400, 'Enter a message between 1 and 2,000 characters.', 'validation');
        const conversation = store.getConversation(messageMatch[1], session.user.id);
        if (!conversation) throw new HttpError(404, 'That conversation is no longer available.', 'data');

        const provisional = selectNextMove({ text: content, previousState: conversation.workingState || emptyWorkingState(), messages: conversation.messages });
        let correctionOf = null;
        if (provisional.isCorrection) {
          correctionOf = activeParticipantMessages(conversation.messages).at(-1)?.id || null;
        }
        store.addMessage(conversation.id, 'participant', content, 'participant', correctionOf);
        store.saveWorkingState(conversation.id, BEHAVIOR_VERSION, provisional.state);

        if (provisional.understanding && conversation.understanding?.state === 'pending') store.setUnderstandingState(conversation.understanding.id, 'corrected');
        if (provisional.text) store.addMessage(conversation.id, 'russ', provisional.text, provisional.mode);
        if (provisional.understanding) {
          const refreshed = store.getConversation(conversation.id, session.user.id);
          store.saveUnderstanding(conversation.id, provisional.understanding, refreshed.messages.at(-1).sequence);
        }
        const result = store.getConversation(conversation.id, session.user.id);
        return send(res, 200, { conversation: visitorConversation(result), controls: visitorControls(provisional) });
      }

      const understandingMatch = url.pathname.match(/^\/api\/conversations\/([0-9a-f-]+)\/understanding$/);
      if (understandingMatch && method === 'POST') {
        const session = requireSession(req, store, 'participant');
        requireCsrf(req, session);
        const body = await readJson(req);
        const conversation = store.getConversation(understandingMatch[1], session.user.id);
        if (!conversation?.understanding || conversation.understanding.state !== 'pending') throw new HttpError(409, 'There is no understanding awaiting review.', 'data');
        let turn;
        if (body.action === 'confirm') {
          store.setUnderstandingState(conversation.understanding.id, 'confirmed');
          turn = directionAfterConfirmation(conversation.workingState || emptyWorkingState());
          store.addMessage(conversation.id, 'russ', turn.text, turn.mode);
        } else if (body.action === 'correct') {
          const correction = String(body.correction || '').trim();
          if (!correction || correction.length > 1000) throw new HttpError(400, 'Enter a correction between 1 and 1,000 characters.', 'validation');
          store.setUnderstandingState(conversation.understanding.id, 'corrected');
          const move = selectNextMove({ text: `Actually, ${correction}`, previousState: conversation.workingState || emptyWorkingState(), messages: conversation.messages });
          const latest = activeParticipantMessages(conversation.messages).at(-1);
          store.addMessage(conversation.id, 'participant', correction, 'correction', latest?.id || null);
          store.saveWorkingState(conversation.id, BEHAVIOR_VERSION, move.state);
          store.addMessage(conversation.id, 'russ', move.text, move.mode);
          const refreshed = store.getConversation(conversation.id, session.user.id);
          store.saveUnderstanding(conversation.id, move.understanding || buildUnderstanding(move.state), refreshed.messages.at(-1).sequence);
          turn = move;
        } else throw new HttpError(400, 'Choose confirm or correct.', 'validation');
        return send(res, 200, { conversation: visitorConversation(store.getConversation(conversation.id, session.user.id)), controls: visitorControls(turn) });
      }

      const handoffMatch = url.pathname.match(/^\/api\/conversations\/([0-9a-f-]+)\/handoff$/);
      if (handoffMatch && method === 'POST') {
        const session = requireSession(req, store, 'participant');
        requireCsrf(req, session);
        const body = await readJson(req);
        const conversation = store.getConversation(handoffMatch[1], session.user.id);
        if (!conversation) throw new HttpError(404, 'That conversation is no longer available.', 'data');
        if (conversation.status === 'handoff-ready') throw new HttpError(409, 'This continuation request is already available to Russell.', 'data');
        if (!['call', 'text', 'contact'].includes(body.channel)) throw new HttpError(400, 'Choose an available continuation method.', 'validation');
        const shareContext = body.shareContext === true;
        if (shareContext && (body.consent !== true || body.noticeVersion !== HANDOFF_NOTICE)) throw new HttpError(400, 'Sharing the conversation requires a separate affirmative choice.', 'validation');
        let contact = null;
        if (body.channel === 'contact') {
          const name = String(body.contact?.name || '').trim();
          const replyTo = String(body.contact?.replyTo || '').trim();
          if (!name || !replyTo || name.length > 120 || replyTo.length > 200) throw new HttpError(400, 'Name and a phone number or email are required for the contact request.', 'validation');
          contact = { name, replyTo };
        }
        const summary = shareContext ? buildUnderstanding(conversation.workingState || emptyWorkingState()).replace(/ Is that.+$/, '') : null;
        const handoff = store.createHandoff(conversation, session.user.id, body.channel, HANDOFF_NOTICE, contact, summary, shareContext);
        return send(res, 201, { continuation: { state: 'ready', channel: handoff.channel, contextShared: handoff.contextShared } });
      }

      if (method === 'GET' && url.pathname === '/api/russell/handoffs') {
        requireSession(req, store, 'russell');
        const handoffs = store.listHandoffs().map((item) => ({ id: item.id, channel: item.channel, state: item.status, receivedAt: item.consented_at }));
        return send(res, 200, { handoffs });
      }

      const russellHandoffMatch = url.pathname.match(/^\/api\/russell\/handoffs\/([0-9a-f-]+)$/);
      if (russellHandoffMatch && method === 'GET') {
        const session = requireSession(req, store, 'russell');
        const handoff = store.getHandoff(russellHandoffMatch[1], session.user.id);
        if (!handoff) throw new HttpError(404, 'Continuation request was not found.', 'data');
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
        const outcome = String(body.outcome || '').toUpperCase();
        const scenarioVersion = String(body.scenarioVersion || '').trim();
        const prototypeVersion = String(body.prototypeVersion || '').trim();
        if (!['PASS', 'CONCERN', 'FAIL', 'NOT APPLICABLE'].includes(outcome) || !scenarioVersion || !prototypeVersion) throw new HttpError(400, 'Scenario version, prototype version, and a valid outcome are required.', 'validation');
        if (!body.rubric || typeof body.rubric !== 'object' || Array.isArray(body.rubric)) throw new HttpError(400, 'A structured rubric is required.', 'validation');
        return send(res, 201, { evaluation: store.createEvaluation(session.user.id, { scenarioVersion, prototypeVersion, outcome, rubric: body.rubric, defectReference: String(body.defectReference || '').slice(0, 200) }) });
      }

      if (method === 'POST' && url.pathname === '/api/admin/retention/run') {
        const session = requireSession(req, store, 'administrator');
        requireCsrf(req, session);
        const expired = store.expireData();
        store.audit(session.user.id, 'retention.run', 'system', null, 'success');
        return send(res, 200, { expired });
      }

      const staticFiles = {
        '/': [path.join(publicDir, 'index.html'), 'text/html; charset=utf-8'],
        '/app.js': [path.join(publicDir, 'app.js'), 'text/javascript; charset=utf-8'],
        '/styles.css': [path.join(publicDir, 'styles.css'), 'text/css; charset=utf-8'],
        '/prater-logo.png': [path.join(repoAssetsDir, 'prater-logo.png'), 'image/png']
      };
      if (method === 'GET' && staticFiles[url.pathname]) {
        const [filename, type] = staticFiles[url.pathname];
        res.setHeader('Content-Type', type);
        res.writeHead(200);
        return fs.createReadStream(filename).pipe(res);
      }
      throw new HttpError(404, 'Not found.', 'data');
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500;
      if (status === 500) store.audit(null, 'request.failed', 'system', null, 'error');
      const kind = error instanceof HttpError ? error.kind || (status === 401 ? 'authentication' : 'request') : 'service';
      const message = status === 500 ? 'Russ could not complete that request. Your conversation and draft are still here.' : error.message;
      return send(res, status, { error: { kind, message, retryable: status >= 500 || status === 429 } });
    }
  };
}
