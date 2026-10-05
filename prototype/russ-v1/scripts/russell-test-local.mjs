import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { createHandler } from '../src/app.js';
import { Store } from '../src/store.js';

const password = `Russ-${randomBytes(12).toString('base64url')}`;
const email = 'russell-test@local.invalid';
const phone = process.env.RUSSELL_PHONE || '+15550000000';
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'russell-private-test-'));

const config = {
  host: '127.0.0.1',
  port: Number(process.env.RUSS_PORT || 4177),
  localHttp: true,
  secureCookies: false,
  dataDir,
  encryptionKey: randomBytes(32),
  sessionSecret: randomBytes(48).toString('base64url'),
  accounts: [
    { email, password, role: 'participant' },
    { email: 'russell-review@local.invalid', password: `Review-${randomBytes(12).toString('base64url')}`, role: 'russell' }
  ],
  russellPhone: phone,
  sessionHours: 8,
  retentionDays: 90,
  backupDays: 1
};

const store = new Store(config);
store.expireData();
const server = http.createServer(createHandler({ config, store }));

server.listen(config.port, config.host, () => {
  process.stdout.write('\nPRIVATE RUSSELL TEST — LOCALHOST ONLY\n');
  process.stdout.write('------------------------------------\n');
  process.stdout.write(`Open: http://127.0.0.1:${config.port}\n`);
  process.stdout.write(`Email: ${email}\n`);
  process.stdout.write(`Password: ${password}\n\n`);
  process.stdout.write('This server is bound only to 127.0.0.1 and is not reachable from another device.\n');
  process.stdout.write('Use synthetic/personal test scenarios only; do not enter real client data.\n');
  if (!process.env.RUSSELL_PHONE) {
    process.stdout.write('Call/Text links use the placeholder +15550000000. To test those links, restart with RUSSELL_PHONE set to the desired E.164 number.\n');
  }
  process.stdout.write('Press Ctrl+C when finished. Test data is deleted on shutdown.\n\n');
});

function shutdown() {
  server.close(() => {
    store.close();
    fs.rmSync(dataDir, { recursive: true, force: true });
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
