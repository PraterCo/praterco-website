import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../public/styles.css', import.meta.url), 'utf8');

test('interactive controls have labels and live status regions', () => {
  for (const id of ['email', 'password', 'messageInput', 'correctionInput', 'contactName', 'contactReply']) {
    assert.match(html, new RegExp(`<label[^>]+for="${id}"`));
  }
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /role="alert"/);
  assert.match(html, /role="status"/);
  assert.match(html, /class="skip-link"/);
});

test('dynamic states expose focus targets, busy state, and visible recovery actions', () => {
  for (const id of ['recoveryTitle', 'resumeTitle', 'understandingTitle', 'handoffHeading']) {
    assert.match(html, new RegExp(`id="${id}"[^>]*tabindex="-1"`));
  }
  assert.match(html, /id="conversationView"[^>]*aria-busy="false"/);
  assert.match(html, /id="retryButton"/);
  assert.match(html, /id="recoveryBackButton"/);
  assert.match(html, /Call Russell/);
  assert.match(html, /Text Russell/);
  assert.match(html, /Ask Russell to contact me/);
});

test('approved Prater character is a visible foundation', () => {
  assert.match(html, /class="russ-portrait[^\"]*"[^>]*src="\/prater-logo\.png"/);
  assert.match(html, /alt="Russ, Prater’s digital guide"/);
});

test('layout includes narrow viewport, visible focus, and reduced motion rules', () => {
  assert.match(css, /min-width:\s*320px/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /quick-replies button\s*\{[^}]*min-height:\s*44px/s);
  assert.doesNotMatch(css, /font-size:\s*\d+(\.\d+)?vw/);
});
