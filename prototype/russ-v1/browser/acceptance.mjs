import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';
import { createHandler } from '../src/app.js';
import { Store } from '../src/store.js';

const accounts = [
  { email: 'seller@example.test', password: 'synthetic-seller-pass', role: 'participant' },
  { email: 'russell@example.test', password: 'synthetic-russell-pass', role: 'russell' }
];

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'russ-browser-'));
const config = {
  host: '127.0.0.1', port: 0, localHttp: true, secureCookies: false, dataDir,
  encryptionKey: Buffer.alloc(32, 9), sessionSecret: 'synthetic-browser-secret-at-least-32-characters',
  accounts, russellPhone: '+15550000000', sessionHours: 1, retentionDays: 90, backupDays: 7
};
const store = new Store(config);
const server = http.createServer(createHandler({ config, store }));
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });

const results = [];
async function acceptance(name, fn) {
  try {
    await fn();
    results.push({ name, status: 'PASS' });
    process.stdout.write(`PASS ${name}\n`);
  } catch (error) {
    results.push({ name, status: 'FAIL', error: error.stack || String(error) });
    process.stderr.write(`FAIL ${name}\n${error.stack || error}\n`);
  }
}

async function participantPage(viewport = { width: 1280, height: 900 }) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await page.goto(base);
  await page.locator('#email').fill('seller@example.test');
  await page.locator('#password').fill('synthetic-seller-pass');
  await page.locator('#loginForm button[type="submit"]').click();
  await page.locator('#participantView').waitFor({ state: 'visible' });
  return { context, page };
}

async function startConversation(page) {
  await page.locator('#developmentConsent').check();
  await page.locator('#consentStartButton').click();
  await page.locator('#conversationView').waitFor({ state: 'visible' });
}

async function assertNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    body: document.body.scrollWidth - document.body.clientWidth
  }));
  assert.ok(overflow.document <= 1, `document overflow ${overflow.document}px`);
  assert.ok(overflow.body <= 1, `body overflow ${overflow.body}px`);
}

for (const viewport of [
  { name: '320px', width: 320, height: 720 },
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 1000 }
]) {
  await acceptance(`${viewport.name} layout has no application-caused horizontal overflow`, async () => {
    const { context, page } = await participantPage({ width: viewport.width, height: viewport.height });
    await assertNoHorizontalOverflow(page);
    await startConversation(page);
    await assertNoHorizontalOverflow(page);
    await page.locator('#contactRussellButton').click();
    await assertNoHorizontalOverflow(page);
    await context.close();
  });
}

await acceptance('200% browser page scale retains usable rendered state without horizontal overflow', async () => {
  const { context, page } = await participantPage({ width: 640, height: 900 });
  await startConversation(page);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 });
  await assertNoHorizontalOverflow(page);
  assert.equal(await page.locator('#messageInput').isVisible(), true);
  assert.equal(await page.locator('#contactRussellButton').isVisible(), true);
  await context.close();
});

await acceptance('keyboard-only critical journey preserves logical focus', async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(base);

  let reachedEmail = false;
  for (let i = 0; i < 5; i += 1) {
    await page.keyboard.press('Tab');
    if (await page.evaluate(() => document.activeElement?.id === 'email')) { reachedEmail = true; break; }
  }
  assert.equal(reachedEmail, true, 'email must be reachable by keyboard');
  await page.keyboard.type('seller@example.test');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'password');
  await page.keyboard.type('synthetic-seller-pass');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await page.locator('#participantView').waitFor({ state: 'visible' });

  await page.locator('#developmentConsent').focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'consentStartButton');
  await page.keyboard.press('Enter');
  await page.locator('#messageInput').waitFor({ state: 'visible' });
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'messageInput');

  await page.keyboard.type('Should I sell?');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await page.locator('#messageInput').waitFor({ state: 'visible' });
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'messageInput');
  await context.close();
});

await acceptance('reduced motion preference suppresses conversation animation', async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(base);
  const duration = await page.evaluate(() => {
    const probe = document.createElement('article');
    probe.className = 'message message-russ';
    document.body.append(probe);
    const value = getComputedStyle(probe).animationDuration;
    probe.remove();
    return value;
  });
  const seconds = duration.endsWith('ms') ? Number.parseFloat(duration) / 1000 : Number.parseFloat(duration);
  assert.ok(Number.isFinite(seconds) && seconds <= 0.00002, `unexpected animation duration ${duration}`);
  await context.close();
});

await acceptance('retention consent and contact-only handoff remain independent', async () => {
  const { context, page } = await participantPage({ width: 390, height: 844 });

  assert.equal(await page.locator('#humanActions').isVisible(), true);
  await page.locator('#contactRussellButton').click();
  await page.locator('#preContactPanel').waitFor({ state: 'visible' });
  await page.locator('#preContactReply').fill('seller@example.test');
  await page.locator('#preContactSubmit').click();
  await page.waitForFunction(() => document.querySelector('#preContactStatus')?.textContent?.includes('No Russ conversation was started or shared'));
  assert.match(await page.locator('#preContactStatus').innerText(), /No Russ conversation was started or shared/i);

  await page.locator('#preContactClose').click();
  await startConversation(page);
  await page.locator('#contactRussellButton').click();
  await page.locator('#contactReply').fill('seller@example.test');
  await page.locator('#continueButton').click();
  await page.waitForFunction(() => /conversation was not shared.*keep talking/i.test(document.querySelector('#handoffStatus')?.textContent || ''));
  assert.match(await page.locator('#handoffStatus').innerText(), /conversation was not shared.*keep talking/i);
  assert.equal(await page.locator('#composer').isVisible(), true);
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'handoffStatus');
  await context.close();
});

await acceptance('new draft typed during an in-flight send survives success', async () => {
  const { context, page } = await participantPage();
  await startConversation(page);

  let delayed = false;
  await page.route('**/api/conversations/*/messages', async (route) => {
    if (delayed) return route.continue();
    delayed = true;
    await new Promise((resolve) => setTimeout(resolve, 350));
    await route.continue();
  });

  await page.locator('#messageInput').fill('First thought');
  await page.locator('#composer button[type="submit"]').click({ noWaitAfter: true });
  await page.waitForTimeout(75);
  await page.locator('#messageInput').fill('Second thought typed while sending');
  await page.waitForResponse((response) => response.url().includes('/messages') && response.request().method() === 'POST');
  await page.waitForTimeout(50);
  assert.equal(await page.locator('#messageInput').inputValue(), 'Second thought typed while sending');
  await context.close();
});

await acceptance('failed send preserves draft and exposes visible recovery with focus', async () => {
  const { context, page } = await participantPage();
  await startConversation(page);
  await page.route('**/api/conversations/*/messages', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: { kind: 'service', message: 'Russ could not complete that request. Your conversation and draft are still here.', retryable: true } })
    });
  });
  await page.locator('#messageInput').fill('Keep this draft');
  await page.locator('#composer button[type="submit"]').click();
  await page.locator('#recoveryPanel').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#messageInput').inputValue(), 'Keep this draft');
  await page.waitForFunction(() => document.activeElement?.id === 'recoveryTitle');
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'recoveryTitle');
  assert.equal(await page.locator('#retryButton').isVisible(), true);
  await context.close();
});

await acceptance('Russell-side recoverable failure is visible and focusable', async () => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.route('**/api/russell/handoffs', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: { kind: 'service', message: 'The private review service could not load requests.', retryable: true } })
    });
  });
  await page.goto(base);
  await page.locator('#email').fill('russell@example.test');
  await page.locator('#password').fill('synthetic-russell-pass');
  await page.locator('#loginForm button[type="submit"]').click();
  await page.locator('#russellRecoveryPanel').waitFor({ state: 'visible' });
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'russellRecoveryTitle');
  assert.equal(await page.locator('#russellRetryButton').isVisible(), true);
  await context.close();
});

await browser.close();
await new Promise((resolve) => server.close(resolve));
store.close();
fs.rmSync(dataDir, { recursive: true, force: true });

const failed = results.filter((item) => item.status === 'FAIL');
process.stdout.write(`\nBrowser acceptance: ${results.length - failed.length}/${results.length} PASS\n`);
if (failed.length) process.exitCode = 1;
