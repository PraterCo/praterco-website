import http from 'node:http';
import { loadConfig } from './config.js';
import { createHandler } from './app.js';
import { Store } from './store.js';

const config = loadConfig();
const store = new Store(config);
store.expireData();

const server = http.createServer(createHandler({ config, store }));
const retentionTimer = setInterval(() => store.expireData(), 24 * 60 * 60 * 1000);
retentionTimer.unref();

server.listen(config.port, config.host, () => {
  process.stdout.write(`Private Russ prototype listening on ${config.localHttp ? 'http' : 'https'}://${config.host}:${config.port}\n`);
});

function shutdown() {
  clearInterval(retentionTimer);
  server.close(() => { store.close(); process.exit(0); });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
