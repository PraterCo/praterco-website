const $ = (selector) => document.querySelector(selector);
const state = { session: null, conversation: null, pendingResume: null, lastAction: null, russellLastAction: null };

class ApiError extends Error {
  constructor(status, detail) {
    super(detail?.message || 'The request could not be completed.');
    this.status = status;
    this.kind = detail?.kind || (status === 401 ? 'authentication' : 'service');
    this.retryable = detail?.retryable ?? status >= 500;
  }
}

async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(state.session?.csrf ? { 'X-CSRF-Token': state.session.csrf } : {}),
        ...options.headers
      }
    });
  } catch {
    throw new ApiError(0, { kind: 'service', message: 'The private service could not be reached. Your draft is still here.', retryable: true });
  }
  const type = response.headers.get('content-type') || '';
  const data = type.includes('application/json') ? await response.json().catch(() => ({})) : {};
  if (!response.ok) throw new ApiError(response.status, data.error || { kind: 'service', message: 'The service returned an unreadable response.', retryable: response.status >= 500 });
  return data;
}

function showOnly(view) {
  for (const element of [$('#loginView'), $('#participantView'), $('#russellView'), $('#reviewerView')]) element.hidden = element !== view;
}
function setText(selector, message = '') { $(selector).textContent = message; }
function formatDate(value) { return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value)); }
function setBusy(value, message = '') {
  $('#conversationView').setAttribute('aria-busy', String(value));
  for (const button of $('#conversationView').querySelectorAll('button')) button.disabled = value;
  setText('#messageStatus', message);
}
function focusHeading(selector) {
  requestAnimationFrame(() => $(selector)?.focus());
}

function hideRecovery() { $('#recoveryPanel').hidden = true; }
function hideRussellRecovery() { $('#russellRecoveryPanel').hidden = true; }
function showRecovery(error, retry = null, surface = null) {
  if (error.kind === 'authentication') {
    state.session = null;
    state.conversation = null;
    $('#sessionTools').hidden = true;
    showOnly($('#loginView'));
    setText('#loginStatus', error.message);
    $('#email').focus();
    return;
  }
  const russellSurface = surface === 'russell' || !$('#russellView').hidden;
  if (russellSurface) {
    state.russellLastAction = retry;
    setText('#russellRecoveryMessage', error.message || 'That request could not be loaded. Your signed-in review session is still active.');
    $('#russellRetryButton').hidden = !retry;
    $('#russellRecoveryPanel').hidden = false;
    focusHeading('#russellRecoveryTitle');
    return;
  }
  state.lastAction = retry;
  setText('#recoveryMessage', error.message || 'Your conversation and draft are still here.');
  $('#retryButton').hidden = !retry;
  $('#recoveryPanel').hidden = false;
  focusHeading('#recoveryTitle');
}

async function initialize() {
  try {
    state.session = await api('/api/session');
  } catch (error) {
    state.session = null;
    $('#sessionTools').hidden = true;
    showOnly($('#loginView'));
    if (error.status && error.status !== 401) setText('#loginStatus', 'The private service is unavailable. Retry this page when it is available.');
    $('#email').focus();
    return;
  }
  $('#sessionTools').hidden = false;
  $('#accountLabel').textContent = `${state.session.user.email} · ${state.session.user.role}`;
  if (state.session.user.role === 'participant') {
    showOnly($('#participantView'));
    $('#callRussellLink').href = `tel:${state.session.russellPhone}`;
    $('#textRussellLink').href = `sms:${state.session.russellPhone}`;
    $('#humanActions').hidden = false;
    try { await loadConversationList(); }
    catch (error) { showRecovery(error, loadConversationList); }
  } else if (['russell', 'administrator'].includes(state.session.user.role)) {
    showOnly($('#russellView'));
    try { await loadHandoffs(); }
    catch (error) { showRecovery(error, loadHandoffs, 'russell'); }
  } else showOnly($('#reviewerView'));
}

$('#loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  setText('#loginStatus', '');
  try {
    await api('/api/login', { method: 'POST', body: JSON.stringify({ email: $('#email').value, password: $('#password').value }) });
    await initialize();
  } catch (error) {
    setText('#loginStatus', error.message);
    $('#password').focus();
  }
});

$('#logoutButton').addEventListener('click', async () => {
  try { await api('/api/logout', { method: 'POST' }); } catch {}
  state.session = null;
  state.conversation = null;
  await initialize();
});

$('#retryButton').addEventListener('click', async () => {
  hideRecovery();
  if (!state.lastAction) return;
  try { await state.lastAction(); }
  catch (error) { showRecovery(error, state.lastAction); }
});
$('#recoveryBackButton').addEventListener('click', () => {
  hideRecovery();
  $('#resumePanel').hidden = true;
  if (state.conversation) { $('#conversationView').hidden = false; $('#messageInput').focus(); }
  else { $('#emptyState').hidden = false; $('#developmentConsent').focus(); }
});
$('#russellRetryButton').addEventListener('click', async () => {
  hideRussellRecovery();
  if (!state.russellLastAction) return;
  try { await state.russellLastAction(); }
  catch (error) { showRecovery(error, state.russellLastAction, 'russell'); }
});
$('#russellRecoveryBackButton').addEventListener('click', () => {
  hideRussellRecovery();
  $('#handoffList button')?.focus();
});

async function loadConversationList() {
  const data = await api('/api/conversations');
  const list = $('#conversationList');
  list.replaceChildren();
  for (const conversation of data.conversations) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `Conversation · ${formatDate(conversation.lastActiveAt)}`;
    button.addEventListener('click', () => loadConversation(conversation.id));
    list.append(button);
  }
}

function showStart() {
  state.conversation = null;
  state.pendingResume = null;
  $('#conversationView').hidden = true;
  $('#resumePanel').hidden = true;
  $('#emptyState').hidden = false;
  $('#humanActions').hidden = false;
  $('#shareContextButton').hidden = true;
  $('#developmentConsent').checked = false;
  $('#developmentConsent').focus();
}
$('#newConversationButton').addEventListener('click', showStart);

$('#consentStartButton').addEventListener('click', async () => {
  setText('#startStatus', '');
  if (!$('#developmentConsent').checked) {
    setText('#startStatus', 'Choose the retention option before starting this private review conversation.');
    $('#developmentConsent').focus();
    return;
  }
  const action = async () => {
    const data = await api('/api/conversations', { method: 'POST', body: JSON.stringify({ developmentConsent: true, noticeVersion: state.session.developmentNoticeVersion }) });
    state.conversation = data.conversation;
    renderConversation(data.controls);
    await loadConversationList();
  };
  try { await action(); }
  catch (error) { showRecovery(error, action); }
});

async function loadConversation(id) {
  const action = async () => {
    const data = await api(`/api/conversations/${id}`);
    state.conversation = data.conversation;
    state.pendingResume = data;
    $('#emptyState').hidden = true;
    $('#conversationView').hidden = true;
    $('#resumePanel').hidden = false;
    setText('#resumeText', data.conversation.resume?.text || 'Choose how you would like to continue.');
    focusHeading('#resumeTitle');
  };
  try { await action(); }
  catch (error) { showRecovery(error, action); }
}

for (const button of document.querySelectorAll('[data-resume]')) {
  button.addEventListener('click', () => {
    const action = button.dataset.resume;
    if (action === 'start') return showStart();
    $('#resumePanel').hidden = true;
    renderConversation(state.pendingResume?.controls || {}, { resumed: true });
    if (action === 'correct') $('#messageInput').value = 'I want to correct something: ';
    if (action === 'topic') $('#messageInput').value = 'Can we change the topic to ';
    $('#messageInput').focus();
  });
}

function renderConversation(controls = {}, { resumed = false } = {}) {
  $('#emptyState').hidden = true;
  $('#resumePanel').hidden = true;
  $('#conversationView').hidden = false;
  $('#humanActions').hidden = false;
  $('#shareContextButton').hidden = false;
  $('#retentionLabel').textContent = `Private review retained through ${formatDate(state.conversation.retentionThrough)}`;
  const messages = $('#messages');
  messages.replaceChildren();
  for (const message of state.conversation.messages) {
    const article = document.createElement('article');
    article.className = `message message-${message.role}`;
    const label = document.createElement('span');
    label.className = 'message-label';
    label.textContent = message.role === 'participant' ? 'You' : 'Russ';
    const content = document.createElement('p');
    content.textContent = message.content;
    article.append(label, content);
    messages.append(article);
  }
  const understanding = state.conversation.understanding;
  $('#understandingPanel').hidden = !understanding?.needsResponse;
  if (understanding?.needsResponse) setText('#understandingText', understanding.text);
  $('#correctionArea').hidden = true;
  renderQuickReplies(controls.quickReplies || []);
  $('#handoffPanel').hidden = true;
  $('#composer').hidden = state.conversation.state === 'shared';
  if (state.conversation.state === 'shared') {
    setText('#announcement', 'This continuation request is already available to Russell.');
  } else if (!resumed) {
    const latest = state.conversation.messages.at(-1);
    setText('#announcement', latest?.role === 'russ' ? `Russ said: ${latest.content}` : 'Conversation updated.');
  }
  if (controls.contactReplyTo) $('#contactReply').value = controls.contactReplyTo;
  if (controls.openHuman) openHandoff(controls.openHuman === 'contact' ? 'contact' : null);
  else if (controls.focus === 'understanding' && understanding?.needsResponse) focusHeading('#understandingTitle');
  else if (!resumed && state.conversation.state !== 'shared') $('#messageInput').focus();
}

function renderQuickReplies(replies) {
  const container = $('#quickReplies');
  container.replaceChildren();
  for (const reply of replies) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = reply;
    button.addEventListener('click', () => submitMessage(reply));
    container.append(button);
  }
}

for (const button of document.querySelectorAll('[data-control-message]')) {
  button.addEventListener('click', () => { $('#messageInput').value = button.dataset.controlMessage; $('#messageInput').focus(); });
}

async function submitMessage(explicitContent = null) {
  const input = $('#messageInput');
  const originalValue = explicitContent ?? input.value;
  const content = originalValue.trim();
  if (!content) { setText('#messageError', 'Write a message before sending.'); input.focus(); return; }
  const draftAtSubmission = input.value;
  if (explicitContent !== null) input.value = '';
  setText('#messageError', '');
  const action = async () => {
    setBusy(true, 'Russ is considering what you shared…');
    try {
      const data = await api(`/api/conversations/${state.conversation.id}/messages`, { method: 'POST', body: JSON.stringify({ content }) });
      state.conversation = data.conversation;
      if (explicitContent === null && input.value === draftAtSubmission) input.value = '';
      renderConversation(data.controls);
    } finally { setBusy(false); }
  };
  try { await action(); }
  catch (error) {
    if (explicitContent === null && input.value === draftAtSubmission) input.value = draftAtSubmission;
    if (explicitContent !== null && !input.value) input.value = explicitContent;
    setBusy(false);
    setText('#messageError', `${error.message} Your draft is still here.`);
    showRecovery(error, action);
  }
}
$('#composer').addEventListener('submit', async (event) => {
  event.preventDefault();
  await submitMessage();
});

$('#confirmButton').addEventListener('click', () => updateUnderstanding({ action: 'confirm' }));
$('#correctButton').addEventListener('click', () => { $('#correctionArea').hidden = false; $('#correctionInput').focus(); });
$('#submitCorrectionButton').addEventListener('click', () => updateUnderstanding({ action: 'correct', correction: $('#correctionInput').value }));
async function updateUnderstanding(payload) {
  const action = async () => {
    setBusy(true, 'Updating the conversation…');
    try {
      const data = await api(`/api/conversations/${state.conversation.id}/understanding`, { method: 'POST', body: JSON.stringify(payload) });
      state.conversation = data.conversation;
      $('#correctionInput').value = '';
      renderConversation(data.controls);
    } finally { setBusy(false); }
  };
  try { await action(); }
  catch (error) { setBusy(false); showRecovery(error, action); }
}

function openHandoff(channel = null) {
  $('#handoffPanel').hidden = false;
  setText('#handoffError', '');
  setText('#handoffStatus', '');
  if (channel) {
    const radio = document.querySelector(`input[name="handoffChannel"][value="${channel}"]`);
    if (radio) radio.checked = true;
  }
  updateContactFields();
  focusHeading('#handoffHeading');
}
$('#contactRussellButton').addEventListener('click', () => {
  if (state.conversation) openHandoff('contact');
  else {
    $('#preContactPanel').hidden = false;
    setText('#preContactError', '');
    setText('#preContactStatus', '');
    focusHeading('#preContactTitle');
  }
});
$('#preContactClose').addEventListener('click', () => {
  $('#preContactPanel').hidden = true;
  $('#contactRussellButton').focus();
});
$('#preContactSubmit').addEventListener('click', async () => {
  const contact = { name: $('#preContactName').value, replyTo: $('#preContactReply').value };
  const action = async () => {
    setText('#preContactError', '');
    setText('#preContactStatus', 'Sending your contact request…');
    const data = await api('/api/contact-requests', { method: 'POST', body: JSON.stringify({ contact }) });
    setText('#preContactStatus', data.continuation.contextShared ? 'Your request was sent with context.' : 'Your contact request is available to Russell. No Russ conversation was started or shared.');
    $('#preContactStatus').focus();
  };
  try { await action(); }
  catch (error) {
    setText('#preContactStatus', '');
    setText('#preContactError', error.message);
    showRecovery(error, action);
  }
});
$('#shareContextButton').addEventListener('click', () => openHandoff());
$('#closeHandoffButton').addEventListener('click', () => { $('#handoffPanel').hidden = true; $('#messageInput').focus(); });
for (const radio of document.querySelectorAll('input[name="handoffChannel"]')) radio.addEventListener('change', updateContactFields);
function updateContactFields() {
  const channel = document.querySelector('input[name="handoffChannel"]:checked')?.value;
  $('#contactFields').hidden = channel !== 'contact';
}

$('#continueButton').addEventListener('click', async () => {
  const channel = document.querySelector('input[name="handoffChannel"]:checked')?.value;
  if (!channel) { setText('#handoffError', 'Choose Call, Text, or Ask Russell to contact you.'); return; }
  const shareContext = $('#handoffConsent').checked;
  if ((channel === 'call' || channel === 'text') && !shareContext) {
    window.location.href = `${channel === 'call' ? 'tel' : 'sms'}:${state.session.russellPhone}`;
    return;
  }
  const contact = channel === 'contact' ? { name: $('#contactName').value, replyTo: $('#contactReply').value } : null;
  const action = async () => {
    setText('#handoffError', '');
    setText('#handoffStatus', 'Sending your choice…');
    const data = await api(`/api/conversations/${state.conversation.id}/handoff`, {
      method: 'POST', body: JSON.stringify({ channel, shareContext, consent: shareContext, noticeVersion: state.session.handoffNoticeVersion, contact })
    });
    state.conversation.state = data.continuation.conversationState || (data.continuation.contextShared ? 'shared' : 'active');
    setText('#handoffStatus', data.continuation.contextShared ? 'Your continuation request and conversation context are available to Russell.' : 'Your contact request is available to Russell. The conversation was not shared, and you can keep talking with Russ.');
    if (data.continuation.contextShared) $('#continueButton').disabled = true;
    $('#handoffStatus').focus();
    if (channel === 'call' || channel === 'text') window.location.href = `${channel === 'call' ? 'tel' : 'sms'}:${state.session.russellPhone}`;
  };
  try { await action(); }
  catch (error) { setText('#handoffStatus', ''); setText('#handoffError', error.message); showRecovery(error, action); }
});

$('#deleteButton').addEventListener('click', async () => {
  if (!state.conversation || !window.confirm('Delete this retained conversation and any continuation package now? This cannot be undone.')) return;
  const action = async () => {
    await api(`/api/conversations/${state.conversation.id}`, { method: 'DELETE' });
    showStart();
    await loadConversationList();
  };
  try { await action(); }
  catch (error) { showRecovery(error, action); }
});

async function loadHandoffs() {
  const data = await api('/api/russell/handoffs');
  const list = $('#handoffList');
  list.replaceChildren();
  for (const handoff of data.handoffs) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `${handoff.channel} · ${formatDate(handoff.receivedAt)}`;
    button.addEventListener('click', () => loadHandoff(handoff.id));
    list.append(button);
  }
}

async function loadHandoff(id) {
  const action = async () => {
    const data = await api(`/api/russell/handoffs/${id}`);
    const detail = $('#handoffDetail');
    detail.replaceChildren();
    const heading = document.createElement('h2');
    heading.tabIndex = -1;
    heading.textContent = data.handoff.package.contextShared ? 'Consented conversation' : 'Contact request';
    detail.append(heading);
    if (data.handoff.package.contextShared) {
      const consent = document.createElement('p');
      consent.textContent = `Shared for ${data.handoff.package.consent.purpose} on ${formatDate(data.handoff.consentedAt)}.`;
      const summaryHeading = document.createElement('h3'); summaryHeading.textContent = 'Generated supplemental summary';
      const summary = document.createElement('p'); summary.textContent = data.handoff.package.summary.content;
      const transcriptHeading = document.createElement('h3'); transcriptHeading.textContent = 'Ordered conversation';
      const transcript = document.createElement('ol');
      for (const message of data.handoff.package.messages) {
        const item = document.createElement('li');
        item.textContent = `${message.role === 'participant' ? 'Participant' : 'Russ'}: ${message.content}`;
        transcript.append(item);
      }
      detail.append(consent, summaryHeading, summary, transcriptHeading, transcript);
    } else {
      const note = document.createElement('p');
      note.textContent = 'The participant requested contact without sharing the conversation.';
      detail.append(note);
    }
    if (data.handoff.contact) {
      const contactHeading = document.createElement('h3'); contactHeading.textContent = 'Requested contact';
      const contact = document.createElement('p'); contact.textContent = data.handoff.contact.name ? `${data.handoff.contact.name}: ${data.handoff.contact.replyTo}` : data.handoff.contact.replyTo;
      detail.append(contactHeading, contact);
    }
    heading.focus();
  };
  try { await action(); }
  catch (error) { showRecovery(error, action, 'russell'); }
}

initialize();
