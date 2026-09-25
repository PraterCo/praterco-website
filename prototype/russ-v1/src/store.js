import fs from 'node:fs';
import path from 'node:path';
import { randomBytes, randomUUID } from 'node:crypto';
import { backup, DatabaseSync } from 'node:sqlite';
import { decryptJson, encryptJson, hashPassword, hashToken, verifyPassword } from './crypto.js';

const now = () => new Date().toISOString();
const addDays = (date, days) => new Date(date.getTime() + days * 86400000).toISOString();

export class Store {
  constructor(config, databasePath = path.join(config.dataDir, 'russ-private.sqlite')) {
    this.config = config;
    fs.mkdirSync(path.dirname(databasePath), { recursive: true, mode: 0o700 });
    this.db = new DatabaseSync(databasePath);
    this.db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=3000;');
    this.migrate();
    this.syncAccounts(config.accounts);
    this.dummyPassword = hashPassword('not-a-real-account-password', 'fixed-dummy-salt');
  }

  migrate() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, role TEXT NOT NULL,
        password_salt TEXT NOT NULL, password_hash TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        csrf_token TEXT NOT NULL, expires_at TEXT NOT NULL, created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status TEXT NOT NULL, provider_version TEXT NOT NULL, created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL, expires_at TEXT NOT NULL, consent_notice_version TEXT NOT NULL,
        development_consent TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sequence INTEGER NOT NULL, role TEXT NOT NULL, content TEXT NOT NULL, kind TEXT NOT NULL,
        correction_of TEXT REFERENCES messages(id), created_at TEXT NOT NULL,
        UNIQUE(conversation_id, sequence)
      );
      CREATE TABLE IF NOT EXISTS understandings (
        id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        source_sequence INTEGER NOT NULL, content TEXT NOT NULL, state TEXT NOT NULL, created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS handoffs (
        id TEXT PRIMARY KEY, conversation_id TEXT UNIQUE NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        participant_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, channel TEXT NOT NULL,
        consent_notice_version TEXT NOT NULL, consented_at TEXT NOT NULL, package TEXT NOT NULL,
        contact TEXT, status TEXT NOT NULL, created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS audit_events (
        id TEXT PRIMARY KEY, actor_id TEXT, action TEXT NOT NULL, subject_type TEXT NOT NULL,
        subject_id TEXT, outcome TEXT NOT NULL, created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS evaluation_records (
        id TEXT PRIMARY KEY, scenario_version TEXT NOT NULL, reviewer_id TEXT NOT NULL REFERENCES users(id),
        prototype_version TEXT NOT NULL, outcome TEXT NOT NULL, rubric TEXT NOT NULL,
        defect_reference TEXT, created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS conversations_owner_idx ON conversations(owner_id, updated_at);
      CREATE INDEX IF NOT EXISTS conversations_expiry_idx ON conversations(expires_at);
      CREATE INDEX IF NOT EXISTS handoffs_status_idx ON handoffs(status, created_at);
    `);
  }

  syncAccounts(accounts) {
    const allowedRoles = new Set(['participant', 'russell', 'reviewer', 'administrator']);
    const select = this.db.prepare('SELECT id, password_salt, password_hash, role FROM users WHERE email = ?');
    const insert = this.db.prepare('INSERT INTO users (id,email,role,password_salt,password_hash) VALUES (?,?,?,?,?)');
    const update = this.db.prepare('UPDATE users SET role=?,password_salt=?,password_hash=?,active=1 WHERE id=?');
    for (const account of accounts) {
      const email = String(account.email || '').trim().toLowerCase();
      const password = String(account.password || '');
      if (!email || password.length < 12 || !allowedRoles.has(account.role)) throw new Error('Every RUSS_ACCOUNTS entry needs a valid email, 12+ character password, and allowed role');
      const existing = select.get(email);
      if (existing && existing.role === account.role && verifyPassword(password, existing.password_salt, existing.password_hash)) continue;
      const credentials = hashPassword(password);
      if (existing) update.run(account.role, credentials.salt, credentials.hash, existing.id);
      else insert.run(randomUUID(), email, account.role, credentials.salt, credentials.hash);
    }
  }

  authenticate(email, password) {
    const user = this.db.prepare('SELECT * FROM users WHERE email=? AND active=1').get(String(email).trim().toLowerCase());
    if (!user) {
      verifyPassword(String(password), this.dummyPassword.salt, this.dummyPassword.hash);
      return null;
    }
    if (!verifyPassword(String(password), user.password_salt, user.password_hash)) return null;
    return { id: user.id, email: user.email, role: user.role };
  }

  createSession(user) {
    const token = randomBytes(32).toString('base64url');
    const csrf = randomBytes(24).toString('base64url');
    const expiresAt = new Date(Date.now() + this.config.sessionHours * 3600000).toISOString();
    this.db.prepare('INSERT INTO sessions VALUES (?,?,?,?,?)').run(hashToken(token, this.config.sessionSecret), user.id, csrf, expiresAt, now());
    this.audit(user.id, 'session.created', 'session', null, 'success');
    return { token, csrf, expiresAt };
  }

  getSession(token) {
    if (!token) return null;
    const row = this.db.prepare(`SELECT s.token_hash,s.csrf_token,s.expires_at,u.id,u.email,u.role
      FROM sessions s JOIN users u ON u.id=s.user_id
      WHERE s.token_hash=? AND s.expires_at>? AND u.active=1`).get(hashToken(token, this.config.sessionSecret), now());
    return row ? { tokenHash: row.token_hash, csrf: row.csrf_token, expiresAt: row.expires_at, user: { id: row.id, email: row.email, role: row.role } } : null;
  }

  deleteSession(token) {
    if (token) this.db.prepare('DELETE FROM sessions WHERE token_hash=?').run(hashToken(token, this.config.sessionSecret));
  }

  audit(actorId, action, subjectType, subjectId, outcome) {
    this.db.prepare('INSERT INTO audit_events VALUES (?,?,?,?,?,?,?)').run(randomUUID(), actorId, action, subjectType, subjectId, outcome, now());
  }

  createConversation(ownerId, providerVersion, noticeVersion) {
    const id = randomUUID();
    const createdAt = now();
    const consent = encryptJson({ affirmative: true, noticeVersion, purposes: ['continuity', 'authorized private review', 'responsible conversation improvement'], timestamp: createdAt }, this.config.encryptionKey, `${id}:development-consent`);
    this.db.prepare(`INSERT INTO conversations VALUES (?,?,?,?,?,?,?,?,?)`).run(
      id, ownerId, 'active', providerVersion, createdAt, createdAt,
      addDays(new Date(), this.config.retentionDays), noticeVersion, consent
    );
    this.audit(ownerId, 'conversation.created', 'conversation', id, 'success');
    return this.getConversation(id, ownerId);
  }

  listConversations(ownerId) {
    return this.db.prepare('SELECT id,status,provider_version,created_at,updated_at,expires_at FROM conversations WHERE owner_id=? ORDER BY updated_at DESC').all(ownerId);
  }

  getConversation(id, ownerId = null) {
    const row = ownerId
      ? this.db.prepare('SELECT * FROM conversations WHERE id=? AND owner_id=?').get(id, ownerId)
      : this.db.prepare('SELECT * FROM conversations WHERE id=?').get(id);
    if (!row) return null;
    const messageRows = this.db.prepare('SELECT * FROM messages WHERE conversation_id=? ORDER BY sequence').all(id);
    const messages = messageRows.map((message) => ({
      id: message.id, role: message.role, sequence: message.sequence, kind: message.kind,
      correctionOf: message.correction_of, createdAt: message.created_at,
      content: decryptJson(message.content, this.config.encryptionKey, `${message.id}:message`).content
    }));
    const understandingRow = this.db.prepare('SELECT * FROM understandings WHERE conversation_id=? ORDER BY created_at DESC LIMIT 1').get(id);
    const understanding = understandingRow ? {
      id: understandingRow.id, state: understandingRow.state, sourceSequence: understandingRow.source_sequence,
      content: decryptJson(understandingRow.content, this.config.encryptionKey, `${understandingRow.id}:understanding`).content
    } : null;
    return { id: row.id, ownerId: row.owner_id, status: row.status, providerVersion: row.provider_version, createdAt: row.created_at, updatedAt: row.updated_at, expiresAt: row.expires_at, messages, understanding };
  }

  addMessage(conversationId, role, content, kind = 'message', correctionOf = null) {
    const id = randomUUID();
    const sequence = this.db.prepare('SELECT COALESCE(MAX(sequence),0)+1 AS next FROM messages WHERE conversation_id=?').get(conversationId).next;
    const encrypted = encryptJson({ content }, this.config.encryptionKey, `${id}:message`);
    const timestamp = now();
    this.db.prepare('INSERT INTO messages VALUES (?,?,?,?,?,?,?,?)').run(id, conversationId, sequence, role, encrypted, kind, correctionOf, timestamp);
    this.db.prepare('UPDATE conversations SET updated_at=? WHERE id=?').run(timestamp, conversationId);
    return { id, role, content, kind, correctionOf, sequence, createdAt: timestamp };
  }

  saveUnderstanding(conversationId, content, sourceSequence, state = 'pending') {
    const id = randomUUID();
    this.db.prepare('INSERT INTO understandings VALUES (?,?,?,?,?,?)').run(id, conversationId, sourceSequence, encryptJson({ content }, this.config.encryptionKey, `${id}:understanding`), state, now());
    return { id, content, sourceSequence, state };
  }

  setUnderstandingState(id, state) {
    this.db.prepare('UPDATE understandings SET state=? WHERE id=?').run(state, id);
  }

  createHandoff(conversation, participantId, channel, noticeVersion, contact, summary) {
    const id = randomUUID();
    const consentedAt = now();
    const packageValue = {
      conversationId: conversation.id,
      providerVersion: conversation.providerVersion,
      messages: conversation.messages,
      understanding: conversation.understanding,
      summary: { content: summary, sourceThroughSequence: conversation.messages.at(-1)?.sequence || 0 },
      consent: { affirmative: true, recipient: 'Russell Prater', purpose: 'continue the conversation with its context intact', noticeVersion, timestamp: consentedAt }
    };
    this.db.prepare('INSERT INTO handoffs VALUES (?,?,?,?,?,?,?,?,?,?)').run(
      id, conversation.id, participantId, channel, noticeVersion, consentedAt,
      encryptJson(packageValue, this.config.encryptionKey, `${id}:package`),
      contact ? encryptJson(contact, this.config.encryptionKey, `${id}:contact`) : null,
      'ready', consentedAt
    );
    this.db.prepare('UPDATE conversations SET status=? WHERE id=?').run('handoff-ready', conversation.id);
    this.audit(participantId, 'handoff.consented', 'handoff', id, 'success');
    return { id, status: 'ready', channel, consentedAt };
  }

  listHandoffs() {
    return this.db.prepare('SELECT id,conversation_id,channel,status,consented_at,created_at FROM handoffs ORDER BY created_at DESC').all();
  }

  getHandoff(id, actorId) {
    const row = this.db.prepare('SELECT * FROM handoffs WHERE id=?').get(id);
    if (!row) return null;
    this.audit(actorId, 'handoff.read', 'handoff', id, 'success');
    return {
      id: row.id, channel: row.channel, status: row.status, consentedAt: row.consented_at,
      package: decryptJson(row.package, this.config.encryptionKey, `${id}:package`),
      contact: row.contact ? decryptJson(row.contact, this.config.encryptionKey, `${id}:contact`) : null
    };
  }

  createEvaluation(actorId, value) {
    const id = randomUUID();
    const timestamp = now();
    this.db.prepare('INSERT INTO evaluation_records VALUES (?,?,?,?,?,?,?,?)').run(
      id, value.scenarioVersion, actorId, value.prototypeVersion, value.outcome,
      encryptJson(value.rubric, this.config.encryptionKey, `${id}:evaluation`),
      value.defectReference || null, timestamp
    );
    this.audit(actorId, 'evaluation.created', 'evaluation', id, 'success');
    return { id, scenarioVersion: value.scenarioVersion, prototypeVersion: value.prototypeVersion, outcome: value.outcome, defectReference: value.defectReference || null, createdAt: timestamp };
  }

  listEvaluations(actorId) {
    const rows = this.db.prepare('SELECT * FROM evaluation_records ORDER BY created_at DESC').all();
    this.audit(actorId, 'evaluation.list', 'evaluation', null, 'success');
    return rows.map((row) => ({
      id: row.id, scenarioVersion: row.scenario_version, prototypeVersion: row.prototype_version,
      outcome: row.outcome, rubric: decryptJson(row.rubric, this.config.encryptionKey, `${row.id}:evaluation`),
      defectReference: row.defect_reference, createdAt: row.created_at
    }));
  }

  deleteConversation(id, actorId, ownerId = null) {
    const row = ownerId ? this.db.prepare('SELECT id FROM conversations WHERE id=? AND owner_id=?').get(id, ownerId) : this.db.prepare('SELECT id FROM conversations WHERE id=?').get(id);
    if (!row) return false;
    this.db.prepare('DELETE FROM conversations WHERE id=?').run(id);
    this.audit(actorId, 'conversation.deleted', 'conversation', id, 'success');
    return true;
  }

  expireData(reference = new Date()) {
    const expired = this.db.prepare('SELECT id FROM conversations WHERE expires_at<=?').all(reference.toISOString());
    this.db.exec('BEGIN IMMEDIATE');
    try {
      for (const row of expired) {
        this.db.prepare('DELETE FROM conversations WHERE id=?').run(row.id);
        this.audit(null, 'retention.expired', 'conversation', row.id, 'success');
      }
      this.db.prepare('DELETE FROM sessions WHERE expires_at<=?').run(reference.toISOString());
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
    return expired.length;
  }

  async createBackup(reference = new Date()) {
    const backupDir = path.join(this.config.dataDir, 'backups');
    fs.mkdirSync(backupDir, { recursive: true, mode: 0o700 });
    const destination = path.join(backupDir, `russ-${reference.toISOString().replaceAll(':', '-')}.sqlite`);
    await backup(this.db, destination);
    fs.chmodSync(destination, 0o600);
    const check = new DatabaseSync(destination, { readOnly: true });
    const integrity = check.prepare('PRAGMA integrity_check').get().integrity_check;
    check.close();
    if (integrity !== 'ok') {
      fs.rmSync(destination, { force: true });
      throw new Error('Backup integrity check failed');
    }
    const cutoff = reference.getTime() - this.config.backupDays * 86400000;
    for (const entry of fs.readdirSync(backupDir, { withFileTypes: true })) {
      const file = path.join(backupDir, entry.name);
      if (entry.isFile() && fs.statSync(file).mtimeMs < cutoff) fs.rmSync(file, { force: true });
    }
    this.audit(null, 'backup.created', 'system', null, 'success');
    return destination;
  }

  close() { this.db.close(); }
}
