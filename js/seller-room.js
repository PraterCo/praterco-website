(() => {
  const engine = window.PraterDecisionEngine;
  const personality = window.RussPersonality;

  const room = document.getElementById('thought-room');
  const conversation = document.getElementById('conversation');
  const chat = document.getElementById('chat');
  const quickReplies = document.getElementById('quick-replies');
  const selectedThought = document.getElementById('selected-thought');
  const replyForm = document.getElementById('reply-form');
  const replyInput = document.getElementById('reply-input');
  const backButton = document.getElementById('conversation-back');
  const hearingList = document.getElementById('hearing-list');
  const unknownList = document.getElementById('unknown-list');
  const roadmapList = document.getElementById('roadmap-list');
  const readinessStage = document.getElementById('readiness-stage');
  const readinessTrack = document.querySelector('.readiness-track');
  const readinessBar = document.getElementById('readiness-bar');
  const readinessNote = document.getElementById('readiness-note');
  const decisionInsight = document.getElementById('decision-insight');
  const decisionBlocker = document.getElementById('decision-blocker');
  const blueprint = document.getElementById('seller-blueprint');
  const blueprintTitle = document.getElementById('blueprint-title');
  const blueprintIntro = document.getElementById('blueprint-intro');
  const blueprintChange = document.getElementById('blueprint-change');
  const blueprintSuccess = document.getElementById('blueprint-success');
  const blueprintTimeline = document.getElementById('blueprint-timeline');
  const blueprintBlocker = document.getElementById('blueprint-blocker');
  const blueprintSteps = document.getElementById('blueprint-steps');
  const blueprintPrint = document.getElementById('blueprint-print');

  if (!engine || !personality || !room || !conversation || !chat || !replyForm) return;

  let profile = null;
  let currentQuestion = null;

  function addMessage(text, role = 'russ') {
    const item = document.createElement('div');
    item.className = `chat-message ${role}`;

    const name = document.createElement('span');
    name.className = 'chat-name';
    name.textContent = role === 'russ' ? 'Russ' : 'You';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = text;

    item.append(name, bubble);
    chat.appendChild(item);
    requestAnimationFrame(() => item.classList.add('is-visible'));
    chat.scrollTop = chat.scrollHeight;
  }

  function showTyping(callback) {
    const typing = document.createElement('div');
    typing.className = 'chat-message russ typing is-visible';
    typing.innerHTML = '<span class="chat-name">Russ</span><div class="chat-bubble"><i></i><i></i><i></i></div>';
    chat.appendChild(typing);
    chat.scrollTop = chat.scrollHeight;

    window.setTimeout(() => {
      typing.remove();
      callback();
    }, 550);
  }

  function replaceList(element, items, fallback) {
    element.textContent = '';
    const values = items && items.length ? items : [fallback];
    values.forEach((text) => {
      const item = document.createElement('li');
      item.textContent = text;
      element.appendChild(item);
    });
  }

  function renderQuickReplies(items = []) {
    quickReplies.textContent = '';
    items.forEach((text) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = text;
      button.addEventListener('click', () => submitAnswer(text));
      quickReplies.appendChild(button);
    });
  }

  function hearingFromProfile(activeProfile) {
    const heard = [];
    if (activeProfile.motivation) heard.push(`What changed: ${activeProfile.motivation}`);
    if (activeProfile.successLooksLike) heard.push(`Success looks like: ${activeProfile.successLooksLike}`);
    if (activeProfile.timeline) heard.push(`Timing: ${activeProfile.timeline}`);
    if (activeProfile.blockerConfirmed) heard.push(`Biggest decision: ${activeProfile.blocker}`);
    if (!heard.length && activeProfile.lifeEvent) heard.push(activeProfile.lifeEvent);
    return heard;
  }

  function readinessMessage(activeProfile) {
    if (activeProfile.readiness >= 80) return 'You have enough clarity to compare the real options and choose a practical next step.';
    if (activeProfile.readiness >= 55) return 'The decision is taking shape. A few important details still need real numbers.';
    if (activeProfile.readiness >= 30) return 'We are narrowing the decision without forcing a commitment.';
    return 'We’re just getting started. The goal is clarity, not pressure.';
  }

  function renderPanel(activeProfile) {
    readinessStage.textContent = activeProfile.stage;
    readinessBar.style.width = `${activeProfile.readiness}%`;
    readinessTrack.setAttribute('aria-valuenow', String(activeProfile.readiness));
    readinessNote.textContent = readinessMessage(activeProfile);

    replaceList(hearingList, hearingFromProfile(activeProfile), 'We’ll build this together as you answer.');
    replaceList(unknownList, activeProfile.unknowns, 'The real numbers needed to compare your options.');

    roadmapList.textContent = '';
    activeProfile.roadmap.forEach((step) => {
      const item = document.createElement('li');
      item.textContent = step.text;
      if (step.complete) item.classList.add('is-complete');
      if (step.current) item.classList.add('is-current');
      roadmapList.appendChild(item);
    });

    if (activeProfile.blocker) {
      decisionBlocker.textContent = activeProfile.blocker;
      decisionInsight.hidden = false;
    } else {
      decisionInsight.hidden = true;
    }
  }

  function askNextQuestion() {
    currentQuestion = engine.nextQuestion(profile);

    if (!currentQuestion || currentQuestion.field === 'complete') {
      completeConversation();
      return;
    }

    showTyping(() => {
      addMessage(personality.transition(currentQuestion));
      renderQuickReplies(currentQuestion.replies);
      replyInput.focus();
    });
  }

  function submitAnswer(answer) {
    const clean = String(answer || '').trim();
    if (!clean || !currentQuestion || currentQuestion.field === 'complete') return;

    addMessage(clean, 'user');
    replyInput.value = '';
    renderQuickReplies();

    const answeredField = currentQuestion.field;
    profile = engine.record(profile, answeredField, clean);
    renderPanel(profile);

    const acknowledgement = personality.acknowledge(answeredField, clean);
    showTyping(() => {
      if (acknowledgement) addMessage(acknowledgement);
      askNextQuestion();
    });
  }

  function renderBlueprint() {
    const summary = engine.summary(profile);
    blueprintTitle.textContent = summary.title;
    blueprintIntro.textContent = personality.blueprintIntro(summary);
    blueprintChange.textContent = summary.motivation || summary.lifeEvent || 'Still being clarified';
    blueprintSuccess.textContent = summary.success || 'A confident, low-pressure decision';
    blueprintTimeline.textContent = summary.timeline || 'Still being clarified';
    blueprintBlocker.textContent = summary.blocker || 'The central decision is still emerging';

    blueprintSteps.textContent = '';
    personality.nextSteps(summary).forEach((text) => {
      const item = document.createElement('li');
      item.textContent = text;
      blueprintSteps.appendChild(item);
    });

    blueprint.hidden = false;
  }

  function completeConversation() {
    currentQuestion = { field: 'complete' };
    replyForm.hidden = true;
    renderQuickReplies();
    renderPanel(profile);

    showTyping(() => {
      addMessage(engine.nextQuestion(profile).text);
      renderBlueprint();
      blueprint.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function startConversation(path, label) {
    profile = engine.begin(path);
    currentQuestion = null;

    selectedThought.textContent = label;
    chat.textContent = '';
    quickReplies.textContent = '';
    replyInput.value = '';
    replyForm.hidden = false;
    blueprint.hidden = true;
    room.hidden = true;
    conversation.hidden = false;

    renderPanel(profile);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    addMessage(personality.opening(profile));
    askNextQuestion();
  }

  function resetExperience() {
    engine.reset();
    profile = null;
    currentQuestion = null;
    conversation.hidden = true;
    blueprint.hidden = true;
    room.hidden = false;
    replyForm.hidden = false;
    chat.textContent = '';
    quickReplies.textContent = '';
    replyInput.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('[data-thought]').forEach((button) => {
    button.addEventListener('click', () => {
      startConversation(button.dataset.thought || 'other', button.textContent.trim());
    });
  });

  replyForm.addEventListener('submit', (event) => {
    event.preventDefault();
    submitAnswer(replyInput.value);
  });

  backButton.addEventListener('click', resetExperience);
  blueprintPrint.addEventListener('click', () => window.print());
})();
