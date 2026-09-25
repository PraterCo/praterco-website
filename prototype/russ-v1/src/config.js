import path from 'node:path';

function required(name, env) {
  const value = env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export function loadConfig(env = process.env) {
  const localHttp = env.RUSS_LOCAL_HTTP === 'true';
  const key = Buffer.from(required('RUSS_ENCRYPTION_KEY', env), 'base64');
  if (key.length !== 32) throw new Error('RUSS_ENCRYPTION_KEY must decode to exactly 32 bytes');
  const sessionSecret = required('RUSS_SESSION_SECRET', env);
  if (sessionSecret.length < 32) throw new Error('RUSS_SESSION_SECRET must be at least 32 characters');

  let accounts;
  try {
    accounts = JSON.parse(required('RUSS_ACCOUNTS', env));
  } catch {
    throw new Error('RUSS_ACCOUNTS must be valid JSON');
  }
  if (!Array.isArray(accounts) || accounts.length === 0) throw new Error('RUSS_ACCOUNTS must contain at least one account');

  return {
    host: env.RUSS_HOST || '127.0.0.1',
    port: Number(env.RUSS_PORT || 4177),
    localHttp,
    secureCookies: !localHttp,
    dataDir: path.resolve(env.RUSS_DATA_DIR || './data'),
    encryptionKey: key,
    sessionSecret,
    accounts,
    russellPhone: required('RUSSELL_PHONE', env),
    sessionHours: Math.min(Number(env.RUSS_SESSION_HOURS || 168), 168),
    retentionDays: Math.min(Number(env.RUSS_RETENTION_DAYS || 90), 90),
    backupDays: Math.min(Number(env.RUSS_BACKUP_DAYS || 7), 30)
  };
}
