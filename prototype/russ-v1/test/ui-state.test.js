import test from 'node:test';
import assert from 'node:assert/strict';
import { draftAfterRequest } from '../public/ui-state.js';

test('draft typed after send begins survives successful completion', () => {
  assert.equal(draftAfterRequest({
    submittedDraft: 'First thought',
    currentDraft: 'Second thought typed while sending',
    explicitContent: null,
    succeeded: true
  }), 'Second thought typed while sending');
});

test('submitted draft clears on success only when no newer draft exists', () => {
  assert.equal(draftAfterRequest({
    submittedDraft: 'First thought',
    currentDraft: 'First thought',
    explicitContent: null,
    succeeded: true
  }), '');
});

test('newer draft survives failed request', () => {
  assert.equal(draftAfterRequest({
    submittedDraft: 'First thought',
    currentDraft: 'Second thought typed while sending',
    explicitContent: null,
    succeeded: false
  }), 'Second thought typed while sending');
});

test('failed quick reply remains recoverable without overwriting a newer draft', () => {
  assert.equal(draftAfterRequest({
    submittedDraft: '',
    currentDraft: 'A new typed thought',
    explicitContent: 'Timing is open',
    succeeded: false
  }), 'A new typed thought');
  assert.equal(draftAfterRequest({
    submittedDraft: '',
    currentDraft: '',
    explicitContent: 'Timing is open',
    succeeded: false
  }), 'Timing is open');
});
