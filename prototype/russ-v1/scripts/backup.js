import { loadConfig } from '../src/config.js';
import { Store } from '../src/store.js';

const config = loadConfig();
const store = new Store(config);

try {
  const destination = await store.createBackup();
  process.stdout.write(`Verified local backup created at ${destination}\n`);
} finally {
  store.close();
}
