const $ = (selector) => document.querySelector(selector);
const state = { session: null, conversation: null, selectedChannel: null };

async function api(path, options = {}) {
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(state.session?.csrf ? { 'X-CSRF-Token': state.session.csrf } : {}), ...options.headers };
  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'The request could not be completed.');
  return data;
}

function showOnly(view) {
  for (const element of [$('#loginView'), $('#participantView'), $('#russellView'), $('#reviewerView')]) element.hidden = element !== view;
}

function setStatus(selector, message) { $(selector).textContent = message; }
function formatDate(value) { return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value)); }

async function initialize() {
  try {
    state.session = await api('/api/session');
    $('#sessionTools').hidden = false;
    $('#accountLabel').textContent = `${state.session.user.email} · ${state.session.user.role}`;
    if (state.session.user.role === 'participant') {
      showOnly($('#participantView'));
      await loadConversationList();
    } else if (['russell', 'administrator'].includes(state.session.user.role)) {
      showOnly($('#russellView'));
      await loadHandoffs();
    } else {
      showOnly($('#reviewerView'));
    }
  } catch {
    state.session = null;
    $('#sessionTools').hidden = true;
    showOnly($('#loginView'));
    $('#email').focus();
  }
}

$('#loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus('#loginStatus', 'Signing in…');
  try {
    await api('/api/login', { method: 'POST', body: JSON.stringify({ email: $('#email').value, password: $('#password').value }) });
    setStatus('#loginStatus', '');
    await initialize();
  } catch (error) {
    setStatus('#loginStatus', error.message);
    $('#password').focus();
  }
});

$('#logoutButton').addEventListener('click', async () => {
  try { await api('/api/logout', { method: 'POST' }); } catch {}
  state.session = null;
  state.conversation = null;
  await initialize();
});

async function loadConversationList() {
  const data = await api('/api/conversations');
  const list = $('#conversationList');
  list.replaceChildren();
  for (const conversation of data.conversations) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `Conversation · ${formatDate(conversation.updated_at)}`;
    button.addEventListener('click', () => loadConversation(conversation.id));
    list.append(button);
  }
}

$('#newConversationButton').addEventListener('click', () => {
  state.conversation = null;
  $('#conversationView').hidden = true;
  $('#emptyState').hidden = false;
  $('#developmentConsent').checked = false;
  $('#developmentConsent').focus();
});

$('#consentStartButton').addEventListener('click', async () => {
  setStatus('#startStatus', '');
  if (!$('#developmentConsent').checked) {
    setStatus('#startStatus', 'Choose the consent option before starting a retained conversation.');
    $('#developmentConsent').focus();
    return;
  }
  try {
    const data = await api('/api/conversations', { method: 'POST', body: JSON.stringify({ developmentConsent: true, noticeVersion: state.session.developmentNoticeVersion }) });
    state.conversation = data.conversation;
    renderConversation(data.quickReplies);
    await loadConversationList();
  } catch (error) { setStatus('#startStatus', error.message); }
});

async function loadConversation(id) {
  try {
    const data = await api(`/api/conversations/${id}`);
    state.conversation = data.conversation;
    renderConversation(data.quickReplies);
  } catch (error) { setStatus('#startStatus', error.message); }
}

function renderConversation(quickReplies = []) {
  $('#emptyState').hidden = true;
  $('#conversationView').hidden = false;
  $('#deleteButton').hidden = false;
  $('#retentionLabel').textContent = `Private review retention through ${formatDate(state.conversation.expiresAt)}`;
  const messages = $('#messages');
  messages.replaceChildren();
  for (const message of state.conversation.messages) {
    const article = document.createElement('article');
    article.className = `message message-${message.role === 'participant' ? 'participant' : 'russ'}`;
    const label = document.createElement('span');
    label.className = 'message-label';
    label.textContent = message.role === 'participant' ? 'You' : 'Russ';
    const content = document.createElement('p');
    content.textContent = message.content;
    article.append(label, content);
    messages.append(article);
  }

  const understanding = state.conversation.understanding;
  const pending = understanding?.state === 'pending';
  $('#understandingPanel').hidden = !pending;
  if (pending) $('#understandingText').textContent = understanding.content;
  $('#correctionArea').hidden = true;

  const continuation = state.conversation.messages.some((message) => message.kind === 'direction') || state.conversation.status === 'handoff-ready';
  $('#continuationPanel').hidden = !continuation;
  for (const button of document.querySelectorAll('.continuation-options button')) button.disabled = state.conversation.status === 'handoff-ready';
  if (state.conversation.status === 'handoff-ready') {
    $('#handoffPanel').hidden = false;
    setStatus('#handoffStatus', 'This conversation has already been shared with Russell.');
    $('#shareButton').disabled = true;
  } else {
    $('#shareButton').disabled = false;
    setStatus('#handoffStatus', '');
  }
  $('#composer').hidden = pending || continuation;
  if (state.conversation.status !== 'handoff-ready') $('#handoffPanel').hidden = true;
  renderQuickReplies(quickReplies);
  $('#announcement').textContent = state.conversation.messages.at(-1)?.role === 'russ' ? `Russ said: ${state.conversation.messages.at(-1).content}` : 'Conversation updated.';
  if (!pending && !continuation) $('#messageInput').focus();
}

function renderQuickReplies(replies) {
  const container = $('#quickReplies');
  container.replaceChildren();
  for (const reply of replies || []) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = reply;
    button.addEventListener('click', () => { $('#messageInput').value = reply; $('#messageInput').focus(); });
    container.append(button);
  }
}

$('#composer').addEventListener('submit', async (event) => {
  event.preventDefault();
  const content = $('#messageInput').value.trim();
  if (!content) { setStatus('#messageStatus', 'Write a message before sending.'); $('#messageInput').focus(); return; }
  const draft = $('#messageInput').value;
  setStatus('#messageStatus', 'Russ is considering what you shared…');
  $('#composer button[type="submit"]').disabled = true;
  try {
    const data = await api(`/api/conversations/${state.conversation.id}/messages`, { method: 'POST', body: JSON.stringify({ content }) });
    state.conversation = data.conversation;
    $('#messageInput').value = '';
    setStatus('#messageStatus', '');
    renderConversation(data.quickReplies);
  } catch (error) {
    $('#messageInput').value = draft;
    setStatus('#messageStatus', `${error.message} Your draft is still here.`);
  } finally { $('#composer button[type="submit"]').disabled = false; }
});

$('#confirmButton').addEventListener('click', () => updateUnderstanding({ action: 'confirm' }));
$('#correctButton').addEventListener('click', () => { $('#correctionArea').hidden = false; $('#correctionInput').focus(); });
$('#submitCorrectionButton').addEventListener('click', () => updateUnderstanding({ action: 'correct', correction: $('#correctionInput').value }));

async function updateUnderstanding(payload) {
  try {
    const data = await api(`/api/conversations/${state.conversation.id}/understanding`, { method: 'POST', body: JSON.stringify(payload) });
    state.conversation = data.conversation;
    $('#correctionInput').value = '';
    renderConversation();
  } catch (error) { setStatus('#messageStatus', error.message); }
}

for (const button of document.querySelectorAll('.continuation-options button')) {
  button.addEventListener('click', () => {
    state.selectedChannel = button.dataset.channel;
    $('#handoffPanel').hidden = false;
    $('#contactFields').hidden = state.selectedChannel !== 'contact';
    const isCall = state.selectedChannel === 'call';
    const isText = state.selectedChannel === 'text';
    $('#withoutSharingLink').hidden = !(isCall || isText);
    $('#withoutSharingLink').href = isCall ? `tel:${state.session.russellPhone}` : isText ? `sms:${state.session.russellPhone}` : '#';
    $('#shareButton').textContent = state.selectedChannel === 'contact' ? 'Share and request contact' : `Share and ${state.selectedChannel}`;
    $('#handoffHeading').focus?.();
  });
}

$('#shareButton').addEventListener('click', async () => {
  setStatus('#handoffStatus', '');
  if (!$('#handoffConsent').checked) { setStatus('#handoffStatus', 'Choose the sharing consent option before continuing.'); $('#handoffConsent').focus(); return; }
  const contact = state.selectedChannel === 'contact' ? { name: $('#contactName').value, replyTo: $('#contactReply').value } : null;
  try {
    await api(`/api/conversations/${state.conversation.id}/handoff`, { method: 'POST', body: JSON.stringify({ channel: state.selectedChannel, consent: true, noticeVersion: state.session.handoffNoticeVersion, contact }) });
    state.conversation.status = 'handoff-ready';
    setStatus('#handoffStatus', 'Your conversation was shared with Russell.');
    $('#shareButton').disabled = true;
    if (state.selectedChannel === 'call') window.location.href = `tel:${state.session.russellPhone}`;
    if (state.selectedChannel === 'text') window.location.href = `sms:${state.session.russellPhone}`;
  } catch (error) { setStatus('#handoffStatus', error.message); }
});

$('#deleteButton').addEventListener('click', async () => {
  if (!state.conversation || !window.confirm('Delete this retained conversation and any handoff now? This cannot be undone.')) return;
  try {
    await api(`/api/conversations/${state.conversation.id}`, { method: 'DELETE' });
    state.conversation = null;
    $('#conversationView').hidden = true;
    $('#emptyState').hidden = false;
    $('#deleteButton').hidden = true;
    await loadConversationList();
  } catch (error) { setStatus('#messageStatus', error.message); }
});

async function loadHandoffs() {
  const data = await api('/api/russell/handoffs');
  const list = $('#handoffList');
  list.replaceChildren();
  for (const handoff of data.handoffs) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `${handoff.channel} · ${formatDate(handoff.consented_at)}`;
    button.addEventListener('click', () => loadHandoff(handoff.id));
    list.append(button);
  }
}

async function loadHandoff(id) {
  const data = await api(`/api/russell/handoffs/${id}`);
  const detail = $('#handoffDetail');
  detail.replaceChildren();
  const heading = document.createElement('h2');
  heading.textContent = 'Consented conversation';
  const consent = document.createElement('p');
  consent.textContent = `Shared for ${data.handoff.package.consent.purpose} on ${formatDate(data.handoff.consentedAt)}.`;
  const summaryHeading = document.createElement('h3');
  summaryHeading.textContent = 'Supplemental summary';
  const summary = document.createElement('p');
  summary.textContent = data.handoff.package.summary.content;
  const transcriptHeading = document.createElement('h3');
  transcriptHeading.textContent = 'Ordered conversation';
  const transcript = document.createElement('ol');
  for (const message of data.handoff.package.messages) {
    const item = document.createElement('li');
    item.textContent = `${message.role === 'participant' ? 'Participant' : 'Russ'}: ${message.content}`;
    transcript.append(item);
  }
  detail.append(heading, consent, summaryHeading, summary, transcriptHeading, transcript);
  if (data.handoff.contact) {
    const contactHeading = document.createElement('h3');
    contactHeading.textContent = 'Requested contact';
    const contact = document.createElement('p');
    contact.textContent = `${data.handoff.contact.name}: ${data.handoff.contact.replyTo}`;
    detail.append(contactHeading, contact);
  }
  heading.focus?.();
}

initialize();
