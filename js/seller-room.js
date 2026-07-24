(() => {
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
  const readinessBar = document.getElementById('readiness-bar');
  const readinessTrack = document.querySelector('.readiness-track');
  const readinessNote = document.getElementById('readiness-note');
  const decisionInsight = document.getElementById('decision-insight');
  const decisionBlocker = document.getElementById('decision-blocker');
  const strategyPanel = document.getElementById('strategy-panel');
  const strategyTitle = document.getElementById('strategy-title');
  const strategyConfidence = document.getElementById('strategy-confidence');
  const strategyExplanation = document.getElementById('strategy-explanation');
  const strategyReasons = document.getElementById('strategy-reasons');
  const strategyAlternativeWrap = document.getElementById('strategy-alternative-wrap');
  const strategyAlternative = document.getElementById('strategy-alternative');
  const blueprint = document.getElementById('seller-blueprint');
  const blueprintTitle = document.getElementById('blueprint-title');
  const blueprintIntro = document.getElementById('blueprint-intro');
  const blueprintChange = document.getElementById('blueprint-change');
  const blueprintSuccess = document.getElementById('blueprint-success');
  const blueprintTimeline = document.getElementById('blueprint-timeline');
  const blueprintBlocker = document.getElementById('blueprint-blocker');
  const blueprintStrategy = document.getElementById('blueprint-strategy');
  const blueprintStrategyConfidence = document.getElementById('blueprint-strategy-confidence');
  const blueprintStrategyReasons = document.getElementById('blueprint-strategy-reasons');
  const blueprintSteps = document.getElementById('blueprint-steps');
  const blueprintPrint = document.getElementById('blueprint-print');

  if (!room || !conversation || !chat || !window.PraterDecisionEngine) return;

  const Engine = window.PraterDecisionEngine;
  const Strategy = window.PraterStrategyEngine || null;
  const Personality = window.RussPersonality || {};

  const paths = {
    'needs-work': {
      title: 'It needs work before we sell… right?',
      opener: 'That is probably one of the most common questions I hear. The good news is that “needs work” does not always mean “needs a remodel.”',
      question: 'What makes you feel the house needs work?',
      replies: ['It feels outdated', 'There are actual repairs', 'An agent told us to remodel', 'I worry buyers will judge it']
    },
    value: {
      title: 'I’m wondering what our house is really worth.',
      opener: 'Online estimates are useful for curiosity, but they often miss condition, upgrades, lot differences, and what buyers are doing right now.',
      question: 'What is behind the value question for you?',
      replies: ['We may sell soon', 'We are planning ahead', 'We need to know our equity', 'We are just curious']
    },
    'low-rate': {
      title: 'Our payment is so low, I’m afraid to move.',
      opener: 'That concern is completely reasonable. A low rate is valuable, but it is only one part of the decision.',
      question: 'What is making you consider moving despite the payment?',
      replies: ['We need more space', 'We want to downsize', 'The location no longer works', 'Life circumstances changed']
    },
    timing: {
      title: 'Is now a terrible time to sell?',
      opener: 'There is rarely one market that is perfect for everyone. The better question is whether the current market works for your specific move.',
      question: 'What worries you most about the timing?',
      replies: ['Rates are high', 'Prices may fall', 'There are fewer buyers', 'We are not in a rush']
    },
    'buy-first': {
      title: 'Should we buy before we sell?',
      opener: 'Both paths can work. The right one depends on cash, financing, timing, and how much uncertainty you are comfortable carrying.',
      question: 'Which part feels most difficult?',
      replies: ['Making two payments', 'Finding the next house first', 'Moving twice', 'Coordinating both closings']
    },
    downsizing: {
      title: 'The kids moved out. This house feels too big.',
      opener: 'That can be both a practical decision and an emotional one. Downsizing is not just about square footage; it is about what you want the next chapter to feel like.',
      question: 'What are you hoping would be easier in the next home?',
      replies: ['Less maintenance', 'Lower monthly costs', 'Single-story living', 'Closer to family or activities']
    },
    inherited: {
      title: 'We inherited a house and don’t know what to do.',
      opener: 'You do not have to make every decision at once. First we separate the legal, financial, property, and family questions.',
      question: 'What is the biggest complication right now?',
      replies: ['Multiple family members are involved', 'The house needs work', 'There is a tenant or occupant', 'We do not know the property value']
    },
    'quick-sale': {
      title: 'We may need to sell quickly.',
      opener: 'Speed matters, but so does protecting you from giving away more value than necessary. We can compare the fast options honestly.',
      question: 'What is driving the timeline?',
      replies: ['Job relocation', 'Financial pressure', 'Family situation', 'Another purchase depends on it']
    },
    rental: {
      title: 'Should we keep it as a rental instead?',
      opener: 'Keeping the house can build wealth, but only if the numbers, responsibilities, and risks fit your life.',
      question: 'What makes renting it out appealing?',
      replies: ['Long-term appreciation', 'The low mortgage payment', 'We may move back someday', 'We do not want to sell yet']
    },
    stuck: {
      title: 'I honestly don’t know where to start.',
      opener: 'That is enough of a starting point. You do not need a plan before the conversation; the conversation is how we build the plan.',
      question: 'Which statement feels closest to where you are?',
      replies: ['We might move someday', 'Something changed recently', 'The house is becoming a burden', 'I just need clarity']
    },
    solar: {
      title: 'We have solar and I’m not sure what happens with it.',
      opener: 'Solar can affect the sale differently depending on whether it is owned, financed, leased, or under a power purchase agreement.',
      question: 'Do you know how the solar is currently structured?',
      replies: ['We own it', 'There is a loan', 'It is leased', 'I am not sure']
    },
    other: {
      title: 'Something else is going on.',
      opener: 'That is completely fine. Real life rarely fits neatly into a button.',
      question: 'Tell me what is happening in your own words.',
      replies: []
    }
  };

  let activePath = null;
  let profile = null;
  let currentQuestion = null;
  let currentRecommendation = null;

  function addMessage(text, role = 'russ') {
    if (!text) return;
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
    }, 500);
  }

  function renderQuickReplies(items = []) {
    quickReplies.innerHTML = '';
    items.forEach((text) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = text;
      button.addEventListener('click', () => submitAnswer(text));
      quickReplies.appendChild(button);
    });
  }

  function completedDiscoveries() {
    return Object.values(profile.discoveries).filter((item) => item.status === Engine.STATES.DONE && item.summary);
  }

  function updateStrategy() {
    if (!Strategy || !profile) {
      if (strategyPanel) strategyPanel.hidden = true;
      currentRecommendation = null;
      return;
    }

    currentRecommendation = Strategy.recommendation(profile);
    const primary = currentRecommendation.primary;
    const alternative = currentRecommendation.alternative;
    const hasUsefulSignal = primary && (primary.reasons.length > 0 || completedDiscoveries().length >= 2);

    if (!strategyPanel) return;
    strategyPanel.hidden = !hasUsefulSignal;
    if (!hasUsefulSignal) return;

    strategyTitle.textContent = primary.title;
    strategyConfidence.textContent = `${primary.confidence}% confidence`;
    strategyExplanation.textContent = Strategy.explain(primary);
    strategyReasons.innerHTML = primary.reasons.length
      ? primary.reasons.slice(0, 3).map((reason) => `<li>${escapeHtml(reason)}</li>`).join('')
      : '<li>This is the clearest working path based on what is known so far.</li>';

    strategyAlternativeWrap.hidden = !alternative;
    if (alternative) strategyAlternative.textContent = `${alternative.title} · ${alternative.confidence}% confidence`;
  }

  function updatePanel() {
    if (!profile) return;

    const understood = completedDiscoveries();
    hearingList.innerHTML = understood.length
      ? understood.map((item) => `<li><strong>${escapeHtml(item.label)}:</strong> ${escapeHtml(item.summary)}</li>`).join('')
      : '<li>We’ll build this together as you answer.</li>';

    unknownList.innerHTML = profile.unknowns.length
      ? profile.unknowns.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
      : '<li>The essential questions are answered.</li>';

    roadmapList.innerHTML = profile.roadmap.map((item) => {
      const className = item.complete ? 'is-complete' : item.current ? 'is-current' : '';
      const suffix = item.complete ? ' ✓' : item.current ? ' — current' : '';
      return `<li class="${className}">${escapeHtml(item.text + suffix)}</li>`;
    }).join('');

    readinessStage.textContent = `${profile.readiness}%`;
    readinessBar.style.width = `${profile.readiness}%`;
    readinessTrack.setAttribute('aria-valuenow', String(profile.readiness));
    readinessNote.textContent = profile.readiness >= 80
      ? 'There is enough clarity to compare practical options.'
      : profile.readiness >= 55
        ? 'The shape of the move is becoming clear.'
        : profile.readiness >= 30
          ? 'We are replacing assumptions with useful information.'
          : 'We’re just getting started. The goal is clarity, not pressure.';

    const obstacle = profile.discoveries.obstacle;
    const showObstacle = obstacle && obstacle.summary;
    decisionInsight.hidden = !showObstacle;
    if (showObstacle) decisionBlocker.textContent = obstacle.summary;

    updateStrategy();
  }

  function renderBlueprint() {
    if (!profile || Engine.chooseNextDiscovery(profile) !== 'complete') return;

    const d = profile.discoveries;
    const recommendation = currentRecommendation || (Strategy ? Strategy.recommendation(profile) : null);
    const primary = recommendation && recommendation.primary;

    blueprint.hidden = false;
    blueprintTitle.textContent = profile.decisionProfile;
    blueprintIntro.textContent = Personality.blueprintIntro
      ? Personality.blueprintIntro({ success: d.homeNeeds.summary, blocker: d.obstacle.summary })
      : 'You now have enough clarity to compare the realistic options without committing to a sale.';
    blueprintChange.textContent = d.why.summary || 'Still being clarified';
    blueprintSuccess.textContent = d.homeNeeds.summary || 'A move that solves the underlying problem';
    blueprintTimeline.textContent = d.timeline.summary || 'Still being clarified';
    blueprintBlocker.textContent = d.obstacle.summary || 'No major blocker identified';

    if (blueprintStrategy) blueprintStrategy.textContent = primary ? primary.title : 'Still being evaluated';
    if (blueprintStrategyConfidence) blueprintStrategyConfidence.textContent = primary ? `${primary.confidence}%` : 'Not enough information yet';
    if (blueprintStrategyReasons) {
      blueprintStrategyReasons.innerHTML = primary && primary.reasons.length
        ? primary.reasons.slice(0, 4).map((reason) => `<li>${escapeHtml(reason)}</li>`).join('')
        : '<li>The recommendation will strengthen as the practical details are confirmed.</li>';
    }

    const steps = Personality.nextSteps
      ? Personality.nextSteps({ blocker: d.obstacle.summary })
      : ['Estimate likely net proceeds.', 'Compare the realistic move options.', 'Choose the smallest practical next step.'];
    blueprintSteps.innerHTML = steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('');
  }

  function confirmationFor(target) {
    if (!target || !profile.discoveries[target]) return '';
    const item = profile.discoveries[target];
    if (item.status !== Engine.STATES.DONE || !item.summary) return '';

    if (target === 'why') return `So it sounds like ${lowercaseFirst(item.summary)}`;
    if (target === 'timeline') return `Got it. Your timing is ${lowercaseFirst(item.summary)}`;
    if (target === 'location') return `Okay. For location, ${lowercaseFirst(item.summary)}`;
    if (target === 'homeNeeds') return `So the next home needs to solve this: ${lowercaseFirst(item.summary)}`;
    if (target === 'financialPath') return `Got it. The financial path is ${lowercaseFirst(item.summary)}`;
    if (target === 'obstacle') return `That makes sense. The biggest concern is ${lowercaseFirst(item.summary)}`;
    return '';
  }

  function respondAfterAnswer(target) {
    const humanMoment = profile.lastHumanMoment;
    const confirmation = confirmationFor(target);
    currentQuestion = Engine.nextQuestion(profile);

    showTyping(() => {
      if (humanMoment) addMessage(humanMoment.text);
      if (confirmation) addMessage(confirmation);
      if (currentQuestion.discovery === 'complete') {
        addMessage(currentQuestion.text);
        if (currentRecommendation && currentRecommendation.primary && Strategy) {
          addMessage(Strategy.explain(currentRecommendation.primary));
        }
        renderQuickReplies([]);
        renderBlueprint();
      } else {
        addMessage(Personality.transition ? Personality.transition(currentQuestion) : currentQuestion.text);
        renderQuickReplies(currentQuestion.replies);
      }
      replyInput.focus();
    });
  }

  function submitAnswer(answer) {
    const clean = String(answer || '').trim();
    if (!clean || !profile) return;

    const target = currentQuestion ? currentQuestion.discovery : 'why';
    addMessage(clean, 'user');
    replyInput.value = '';
    renderQuickReplies([]);

    profile = Engine.infer(profile, clean, target);
    updatePanel();
    respondAfterAnswer(target);
  }

  function startConversation(key, buttonText) {
    const path = paths[key];
    if (!path) return;

    activePath = key;
    profile = Engine.begin(key);
    currentRecommendation = null;
    currentQuestion = { discovery: 'why', reason: 'The opening thought needs context before advice is useful.', text: path.question, replies: path.replies };

    selectedThought.textContent = buttonText || path.title;
    chat.innerHTML = '';
    blueprint.hidden = true;
    if (strategyPanel) strategyPanel.hidden = true;
    room.hidden = true;
    conversation.hidden = false;
    updatePanel();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    addMessage(path.opener);
    showTyping(() => {
      addMessage(path.question);
      renderQuickReplies(path.replies);
      replyInput.focus();
    });
  }

  function resetConversation() {
    conversation.hidden = true;
    room.hidden = false;
    blueprint.hidden = true;
    if (strategyPanel) strategyPanel.hidden = true;
    activePath = null;
    profile = null;
    currentQuestion = null;
    currentRecommendation = null;
    chat.innerHTML = '';
    quickReplies.innerHTML = '';
    Engine.reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function lowercaseFirst(value) {
    const text = String(value || '').trim();
    return text ? text.charAt(0).toLowerCase() + text.slice(1) : '';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[character]);
  }

  document.querySelectorAll('[data-thought]').forEach((button) => {
    button.addEventListener('click', () => startConversation(button.dataset.thought, button.textContent.trim()));
  });

  replyForm.addEventListener('submit', (event) => {
    event.preventDefault();
    submitAnswer(replyInput.value);
  });

  backButton.addEventListener('click', resetConversation);
  if (blueprintPrint) blueprintPrint.addEventListener('click', () => window.print());
})();