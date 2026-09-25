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
  assert.match(html, /class="skip-link"/);
});

test('layout includes narrow viewport, visible focus, and reduced motion rules', () => {
  assert.match(css, /min-width:\s*320px/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(css, /font-size:\s*\d+(\.\d+)?vw/);
});
