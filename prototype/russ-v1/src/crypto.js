import { createCipheriv, createDecipheriv, createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function hashToken(token, secret) {
  return createHmac('sha256', secret).update(token).digest('hex');
}

export function hashPassword(password, salt = randomBytes(16).toString('base64url')) {
  return { salt, hash: scryptSync(password, salt, 64).toString('base64url') };
}

export function verifyPassword(password, salt, expected) {
  const actual = scryptSync(password, salt, 64);
  const target = Buffer.from(expected, 'base64url');
  return target.length === actual.length && timingSafeEqual(target, actual);
}

export function encryptJson(value, key, context) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(Buffer.from(context));
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  return JSON.stringify({ v: 1, iv: iv.toString('base64url'), tag: cipher.getAuthTag().toString('base64url'), ciphertext: ciphertext.toString('base64url') });
}

export function decryptJson(payload, key, context) {
  const data = JSON.parse(payload);
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(data.iv, 'base64url'));
  decipher.setAAD(Buffer.from(context));
  decipher.setAuthTag(Buffer.from(data.tag, 'base64url'));
  const plaintext = Buffer.concat([decipher.update(Buffer.from(data.ciphertext, 'base64url')), decipher.final()]);
  return JSON.parse(plaintext.toString('utf8'));
}
