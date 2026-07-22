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
  const exploreList = document.getElementById('explore-list');

  if (!room || !conversation || !chat) return;

  const paths = {
    'needs-work': {
      title: 'It needs work before we sell… right?',
      opener: 'That is probably one of the most common questions I hear. The good news is that “needs work” does not always mean “needs a remodel.”',
      question: 'What makes you feel the house needs work?',
      replies: ['It feels outdated', 'There are actual repairs', 'An agent told us to remodel', 'I worry buyers will judge it'],
      hearing: ['Concerned the home may not show well', 'Wants to avoid spending money unnecessarily'],
      explore: ['Repairs that protect value', 'Improvements buyers actually notice', 'The cost and tradeoff of selling as-is']
    },
    value: {
      title: 'I’m wondering what our house is really worth.',
      opener: 'Online estimates are useful for curiosity, but they often miss condition, upgrades, lot differences, and what buyers are doing right now.',
      question: 'What is behind the value question for you?',
      replies: ['We may sell soon', 'We are planning ahead', 'We need to know our equity', 'We are just curious'],
      hearing: ['Trying to understand the home’s current market position'],
      explore: ['Recent comparable sales', 'Current competing inventory', 'Condition and buyer demand']
    },
    'low-rate': {
      title: 'Our payment is so low, I’m afraid to move.',
      opener: 'That concern is completely reasonable. A low rate is valuable, but it is only one part of the decision.',
      question: 'What is making you consider moving despite the payment?',
      replies: ['We need more space', 'We want to downsize', 'The location no longer works', 'Life circumstances changed'],
      hearing: ['Values the current low housing payment', 'Feels tension between finances and lifestyle needs'],
      explore: ['Estimated net proceeds', 'Replacement housing costs', 'Whether waiting solves the underlying problem']
    },
    timing: {
      title: 'Is now a terrible time to sell?',
      opener: 'There is rarely one market that is perfect for everyone. The better question is whether the current market works for your specific move.',
      question: 'What worries you most about the timing?',
      replies: ['Rates are high', 'Prices may fall', 'There are fewer buyers', 'We are not in a rush'],
      hearing: ['Uncertain whether current market conditions support the move'],
      explore: ['Buyer demand in the neighborhood', 'Your likely selling timeline', 'What happens if you wait']
    },
    'buy-first': {
      title: 'Should we buy before we sell?',
      opener: 'Both paths can work. The right one depends on cash, financing, timing, and how much uncertainty you are comfortable carrying.',
      question: 'Which part feels most difficult?',
      replies: ['Making two payments', 'Finding the next house first', 'Moving twice', 'Coordinating both closings'],
      hearing: ['Needs a coordinated sale and purchase plan'],
      explore: ['Contingent offer strategy', 'Bridge financing or reserves', 'Temporary housing versus timeline risk']
    },
    downsizing: {
      title: 'The kids moved out. This house feels too big.',
      opener: 'That can be both a practical decision and an emotional one. Downsizing is not just about square footage; it is about what you want the next chapter to feel like.',
      question: 'What are you hoping would be easier in the next home?',
      replies: ['Less maintenance', 'Lower monthly costs', 'Single-story living', 'Closer to family or activities'],
      hearing: ['Considering a lifestyle-driven move', 'Wants a home that is easier to manage'],
      explore: ['What to keep versus let go', 'Target areas and property types', 'The financial impact of downsizing']
    },
    inherited: {
      title: 'We inherited a house and don’t know what to do.',
      opener: 'You do not have to make every decision at once. First we separate the legal, financial, property, and family questions.',
      question: 'What is the biggest complication right now?',
      replies: ['Multiple family members are involved', 'The house needs work', 'There is a tenant or occupant', 'We do not know the property value'],
      hearing: ['Managing an inherited property with unanswered questions'],
      explore: ['Ownership and decision authority', 'As-is value versus repairs', 'Holding costs and sale timing']
    },
    'quick-sale': {
      title: 'We may need to sell quickly.',
      opener: 'Speed matters, but so does protecting you from giving away more value than necessary. We can compare the fast options honestly.',
      question: 'What is driving the timeline?',
      replies: ['Job relocation', 'Financial pressure', 'Family situation', 'Another purchase depends on it'],
      hearing: ['Has a time-sensitive reason for selling'],
      explore: ['Fast-market preparation', 'Traditional listing versus investor sale', 'Minimum acceptable timing and proceeds']
    },
    rental: {
      title: 'Should we keep it as a rental instead?',
      opener: 'Keeping the house can build wealth, but only if the numbers, responsibilities, and risks fit your life.',
      question: 'What makes renting it out appealing?',
      replies: ['Long-term appreciation', 'The low mortgage payment', 'We may move back someday', 'We do not want to sell yet'],
      hearing: ['Comparing a sale with long-term ownership'],
      explore: ['Likely rent and true operating costs', 'Property management and vacancy risk', 'Equity tied up versus sale proceeds']
    },
    stuck: {
      title: 'I honestly don’t know where to start.',
      opener: 'That is enough of a starting point. You do not need a plan before the conversation; the conversation is how we build the plan.',
      question: 'Which statement feels closest to where you are?',
      replies: ['We might move someday', 'Something changed recently', 'The house is becoming a burden', 'I just need clarity'],
      hearing: ['Early in the decision process', 'Needs clarity before taking action'],
      explore: ['Your reason for considering a move', 'What would make selling worthwhile', 'The first low-pressure step']
    },
    solar: {
      title: 'We have solar and I’m not sure what happens with it.',
      opener: 'Solar can affect the sale differently depending on whether it is owned, financed, leased, or under a power purchase agreement.',
      question: 'Do you know how the solar is currently structured?',
      replies: ['We own it', 'There is a loan', 'It is leased', 'I am not sure'],
      hearing: ['Needs to understand how solar affects a future sale'],
      explore: ['Agreement and payoff terms', 'Buyer qualification or transfer requirements', 'How solar should be disclosed and presented']
    },
    other: {
      title: 'Something else is going on.',
      opener: 'That is completely fine. Real life rarely fits neatly into a button.',
      question: 'Tell me what is happening in your own words.',
      replies: [],
      hearing: ['Has a unique situation that needs a personal conversation'],
      explore: ['The facts that matter most', 'Your timing and priorities', 'A practical next step']
    }
  };

  let activePath = null;
  let answers = [];

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
    }, 650);
  }

  function renderQuickReplies(items) {
    quickReplies.innerHTML = '';
    items.forEach((text) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = text;
      button.addEventListener('click', () => submitAnswer(text));
      quickReplies.appendChild(button);
    });
  }

  function updatePanel(answer) {
    const path = paths[activePath];
    const hearing = [...path.hearing];
    if (answer) hearing.push(`You said: “${answer}”`);
    hearingList.innerHTML = hearing.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
    exploreList.innerHTML = path.explore.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  }

  function submitAnswer(answer) {
    const clean = answer.trim();
    if (!clean) return;
    answers.push(clean);
    addMessage(clean, 'user');
    replyInput.value = '';
    renderQuickReplies([]);
    updatePanel(clean);

    showTyping(() => {
      addMessage('That helps. The next thing I would want to understand is your timing. Are you thinking weeks, months, or are you still just exploring?');
      renderQuickReplies(['Within 30 days', 'Within 3–6 months', 'Later this year', 'Just exploring']);
    });
  }

  function startConversation(key, buttonText) {
    activePath = key;
    answers = [];
    const path = paths[key];
    if (!path) return;

    selectedThought.textContent = buttonText || path.title;
    chat.innerHTML = '';
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

  function escapeHtml(value) {
    return value.replace(/[&<>'"]/g, (character) => ({
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

  backButton.addEventListener('click', () => {
    conversation.hidden = true;
    room.hidden = false;
    activePath = null;
    answers = [];
    chat.innerHTML = '';
    quickReplies.innerHTML = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();