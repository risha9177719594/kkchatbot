// Configurations passed via URL query parameters
const urlParams = new URLSearchParams(window.location.search);

// Parse custom suggestions if passed as a comma-separated list
const getCustomSuggestions = () => {
  const suggestionsParam = urlParams.get('suggestions');
  if (suggestionsParam) {
    return suggestionsParam.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [
    "What are your features?",
    "Tell me about pricing",
    "Book an appointment"
  ];
};

const config = {
  botName: urlParams.get('botName') || 'KartaBot',
  color: urlParams.get('color') || '#6366f1',
  theme: urlParams.get('theme') || 'light',
  welcomeMessage: urlParams.get('welcome') || 'Hello! How can I help you today?',
  avatarUrl: urlParams.get('avatar') || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
  n8nUrl: urlParams.get('n8nUrl') || 'https://n8n.srv1175271.hstgr.cloud/webhook/VelBot',
  projectId: urlParams.get('projectId') || '',
  quickReplies: getCustomSuggestions()
};

let leadFormActive = false;


// Selectors
const chatContainer = document.querySelector('.chat-container');
const botNameDisplay = document.getElementById('bot-name-display');
const botAvatar = document.getElementById('bot-avatar');
const messagesList = document.getElementById('messages-list');
const chatMessagesContainer = document.getElementById('chat-messages-container');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const typingIndicator = document.getElementById('typing-indicator');
const quickRepliesContainer = document.getElementById('quick-replies');
const closeChatButton = document.getElementById('close-chat');

// Initialize Styling and Config
function initWidget() {
  // Apply bot details
  botNameDisplay.textContent = config.botName;
  if (config.avatarUrl) {
    botAvatar.src = config.avatarUrl;
  }
  
  // Set theme attribute
  chatContainer.setAttribute('data-theme', config.theme);
  
  // Apply Custom Colors via CSS variables
  document.documentElement.style.setProperty('--primary-color', config.color);
  
  // Helper to generate hover color (darken)
  const darkenColor = adjustColorBrightness(config.color, -15);
  document.documentElement.style.setProperty('--primary-hover', darkenColor);
  
  // Convert hex to rgb for opacity-based styles
  const rgb = hexToRgb(config.color);
  if (rgb) {
    document.documentElement.style.setProperty('--primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
  }

  // Populate welcome message
  addMessage(config.welcomeMessage, 'bot');

  // Populate quick replies
  renderQuickReplies(config.quickReplies);

  // Focus input on load
  chatInput.focus();
}

// Render Quick Reply Buttons
function renderQuickReplies(replies) {
  quickRepliesContainer.innerHTML = '';
  if (!replies || replies.length === 0) {
    quickRepliesContainer.style.display = 'none';
    return;
  }
  
  quickRepliesContainer.style.display = 'flex';
  replies.forEach(reply => {
    const btn = document.createElement('button');
    btn.className = 'quick-reply-btn';
    btn.textContent = reply;
    btn.type = 'button';
    btn.addEventListener('click', () => {
      handleUserSendMessage(reply);
      // Remove quick replies after one is clicked to keep chat clean (or hide container temporarily)
      quickRepliesContainer.style.display = 'none';
    });
    quickRepliesContainer.appendChild(btn);
  });
}

// Add Message Bubble to Chat Area
function addMessage(text, sender = 'bot') {
  const messageEl = document.createElement('div');
  messageEl.className = `message ${sender}`;
  
  // Small avatar for bot messages
  let avatarHtml = '';
  if (sender === 'bot') {
    avatarHtml = `<img class="message-avatar-small" src="${config.avatarUrl}" alt="${config.botName}">`;
  }
  
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Basic markdown format helper (only covers basic links and bold tags)
  const formattedText = parseMessageMarkdown(text);
  
  messageEl.innerHTML = `
    ${avatarHtml}
    <div class="message-bubble-wrapper">
      <div class="message-bubble">
        ${formattedText}
      </div>
      <span class="message-time">${time}</span>
    </div>
  `;
  
  messagesList.appendChild(messageEl);
  scrollToBottom();
}

// Intelligent helper to extract human-readable text from various API/LLM response shapes
function extractText(data) {
  if (data === null || data === undefined) return "";
  
  // 1. If it's a string, check if it's stringified JSON
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        return extractText(parsed); // Recurse with parsed JSON
      } catch (e) {
        return trimmed; // Not valid JSON, treat as raw text
      }
    }
    return trimmed;
  }
  
  // 2. If it's an array, extract from its items
  if (Array.isArray(data)) {
    if (data.length === 0) return "";
    // If it's an array of content blocks with 'text' or 'output_text', combine them
    const texts = data
      .map(item => {
        if (item && typeof item === 'object') {
          return item.text || item.output_text || extractText(item);
        }
        return String(item);
      })
      .filter(Boolean);
    if (texts.length > 0) return texts.join('\n\n');
    return extractText(data[0]);
  }
  
  // 3. If it's an object, check standard response keys
  if (typeof data === 'object') {
    // Check Claude/Anthropic content block structure
    if (data.content && Array.isArray(data.content)) {
      return extractText(data.content);
    }
    
    // Check standard keys
    const val = data.reply || data.response || data.output || data.text || data.message || data.output_text;
    if (val !== undefined && val !== null && val !== '') {
      return extractText(val);
    }
    
    // Check if it has a content block directly
    if (data.content && typeof data.content === 'string') {
      return data.content;
    }
    
    // Check nested json object (n8n output format)
    if (data.json && typeof data.json === 'object') {
      return extractText(data.json);
    }
    
    // If it has only one key, extract from that key
    const keys = Object.keys(data);
    if (keys.length === 1) {
      return extractText(data[keys[0]]);
    }
    
    // Fallback: Stringify the object
    return JSON.stringify(data);
  }
  
  return String(data);
}

// Parse markdown tags
function parseMessageMarkdown(text) {
  const textStr = String(text || '');
  // Convert [text](url) to anchor links
  let html = textStr.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  // Convert **text** to strong
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Convert *text* to em
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // Handle line breaks
  html = html.replace(/\n/g, '<br>');
  return html;
}

// Scroll chat log to bottom
function scrollToBottom() {
  chatMessagesContainer.scrollTo({
    top: chatMessagesContainer.scrollHeight,
    behavior: 'smooth'
  });
}

// Show/Hide typing indicator
function setTyping(isTyping) {
  if (isTyping) {
    typingIndicator.style.display = 'block';
    scrollToBottom();
  } else {
    typingIndicator.style.display = 'none';
  }
}

// Form Submission Event
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  handleUserSendMessage(text);
});

// Handle text input auto-sizing and Send button state
chatInput.addEventListener('input', () => {
  // Auto-grow height
  chatInput.style.height = 'auto';
  chatInput.style.height = (chatInput.scrollHeight) + 'px';
  
  // Handle empty input state
  sendButton.disabled = !chatInput.value.trim();
});

// Handle Shift+Enter for newline, Enter for submit
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    chatForm.dispatchEvent(new Event('submit'));
  }
});

// Send Message handler
function handleUserSendMessage(text) {
  // User bubble
  addMessage(text, 'user');
  
  // Clear and reset input field
  chatInput.value = '';
  chatInput.style.height = 'auto';
  sendButton.disabled = true;
  
  // Trigger bot reaction
  triggerBotResponse(text);
}

// Session Identifier helper to allow conversational memory in backends like n8n
function getSessionId() {
  let sessionId = localStorage.getItem('kartabot-session-id');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('kartabot-session-id', sessionId);
  }
  return sessionId;
}

// Bot Reply Logic (Simulated local engine or real n8n webhook connection)
function triggerBotResponse(userMessage) {
  setTyping(true);
  
  const lowerMsg = userMessage.toLowerCase();
  const isPriceQuery = contains(lowerMsg, ['price', 'pricing', 'cost', 'subscription', 'rates', 'plan', 'plans', 'payment', 'charge']);
  const isAgentQuery = contains(lowerMsg, ['agent', 'human', 'support', 'contact', 'representative', 'person', 'live chat', 'talk to agent', 'speak to agent', 'email', 'help']);
  const isGemstoneQuery = contains(lowerMsg, ['gem', 'gemstone', 'gemstones', 'lucky stone', 'astrology stone', 'birthstone', 'recommendation']);
  const isBookQuery = contains(lowerMsg, ['book', 'appointment', 'schedule', 'booking', 'meet', 'calendar', 'slot']);
  
  let shouldCaptureLead = null;
  let shouldRecommendGemstone = false;
  let shouldBookAppointment = false;

  if (isGemstoneQuery) {
    shouldRecommendGemstone = true;
  } else if (isBookQuery) {
    shouldBookAppointment = true;
  } else if (isAgentQuery) {
    shouldCaptureLead = 'agent';
  } else if (isPriceQuery) {
    shouldCaptureLead = 'price';
  }
  
  // If n8n URL is provided, send the message to n8n Webhook
  if (config.n8nUrl) {
    fetch(config.n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event: 'message',
        message: userMessage,
        botName: config.botName,
        sessionId: getSessionId(),
        timestamp: new Date().toISOString(),
        projectId: config.projectId
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`n8n responded with status ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      setTyping(false);
      
      // Look for standard response keys from n8n response object
      const reply = extractText(data);
      if (reply) {
        addMessage(reply, 'bot');
      } else {
        addMessage("Received response from n8n, but no text was resolved in standard fields.", 'bot');
      }
      
      // Update quick suggestion questions if n8n returns them, otherwise fall back to suggested ones
      if (data.quickReplies && Array.isArray(data.quickReplies)) {
        renderQuickReplies(data.quickReplies);
      } else {
        setTimeout(() => {
          renderQuickReplies(getSuggestedQuestions(userMessage));
        }, 400);
      }
 
      // Capture lead or trigger gemstone recommendation/appointment form if detected
      if (shouldRecommendGemstone) {
        setTimeout(() => {
          renderGemstoneFormCard();
        }, 1200);
      } else if (shouldBookAppointment) {
        setTimeout(() => {
          renderAppointmentFormCard();
        }, 1200);
      } else if (shouldCaptureLead) {
        setTimeout(() => {
          renderLeadFormCard(shouldCaptureLead);
        }, 1200);
      }
    })
    .catch(error => {
      console.error('KartaBot n8n Connection Error:', error);
      setTyping(false);
      addMessage("⚠️ **Connection Error**: I could not reach my backend server. Please verify your Webhook URL and ensure that CORS is enabled.", 'bot');
      
      setTimeout(() => {
        renderLeadFormCard('webhook_failure');
      }, 1000);
    });
  } else {
    // Fallback: Calculate dynamic typing delay depending on length of local mock message
    const reply = getMockReply(userMessage);
    const typingDelay = Math.max(1000, Math.min(2500, reply.length * 12));
    
    setTimeout(() => {
      setTyping(false);
      addMessage(reply, 'bot');
      
      // Restore or provide fresh quick replies based on context
      setTimeout(() => {
        const freshQuickReplies = getSuggestedQuestions(userMessage);
        if (freshQuickReplies && freshQuickReplies.length > 0) {
          renderQuickReplies(freshQuickReplies);
        }
      }, 400);
 
      // Capture lead or trigger gemstone recommendation/appointment form if detected
      if (shouldRecommendGemstone) {
        setTimeout(() => {
          renderGemstoneFormCard();
        }, 1200);
      } else if (shouldBookAppointment) {
        setTimeout(() => {
          renderAppointmentFormCard();
        }, 1200);
      } else if (shouldCaptureLead) {
        setTimeout(() => {
          renderLeadFormCard(shouldCaptureLead);
        }, 1200);
      }
    }, typingDelay);
  }
}

// Basic Rule-based Conversation Engine
function getMockReply(msg) {
  const text = msg.toLowerCase();
  
  if (contains(text, ['hi', 'hello', 'hey', 'greetings', 'hola'])) {
    return `Hi there! I am **${config.botName}**. What can I help you with today?`;
  }
  
  if (contains(text, ['price', 'pricing', 'cost', 'subscription'])) {
    return `We offer simple, transparent pricing plans starting at **$0/month** for developers!\n\n• **Starter**: Free (up to 1,000 messages/mo)\n• **Pro**: $19/mo (up to 50,000 messages/mo + AI models)\n• **Enterprise**: Custom (dedicated support, unlimited volume)\n\nWould you like a link to our [Pricing Page](#pricing)?`;
  }
  
  if (contains(text, ['feature', 'what can you do', 'capabilities', 'how do you work'])) {
    return `I can assist your site visitors with their questions 24/7! My core features include:\n\n1. **Zero-Code Embed**: Paste a single script tag and you're set!\n2. **Custom Branding**: Modify names, themes, avatars, and primary accents.\n3. **Quick Suggestions**: Help users find answers faster with quick replies.\n4. **Context-Aware**: Link me up with any AI API for smart answers.`;
  }

  if (contains(text, ['embed', 'integrate', 'place', 'script', 'how to setup'])) {
    return `Setting me up is incredibly easy! Just copy the embed script block from your dashboard and paste it before the closing \`</body>\` tag of your HTML file.\n\nLike this:\n\`\`\`html\n<script src="widget.js" data-bot-name="${config.botName}" data-color="${config.color}"></script>\n\`\`\``;
  }
  
  if (contains(text, ['contact', 'support', 'email', 'help', 'human'])) {
    return `Need support? You can reach our friendly human team at support@krutrimkarta.com, or fill out the [Contact Form](#contact). We're always happy to help!`;
  }
  
  if (contains(text, ['book', 'appointment', 'schedule', 'booking', 'meet', 'calendar', 'slot'])) {
    return `Sure! I can help you schedule a meeting with our team. Please fill out the **Appointment Booking Form** below to choose your slot:`;
  }
  
  if (contains(text, ['thank', 'awesome', 'cool', 'great'])) {
    return `You're very welcome! Let me know if there's anything else I can do for you. 😊`;
  }
  
  // Default Catch-all
  return `I'm not sure I fully understand that. I am a customizable chatbot template powered by **Krutrim Karta**. Try asking me about my **features**, **pricing**, or how to **book an appointment**!`;
}

// Generate contextual quick suggestion questions
function getSuggestedQuestions(lastUserMessage) {
  // Check if suggestions have been customized by the user
  const defaultSuggestions = [
    "What are your features?",
    "Tell me about pricing",
    "Book an appointment"
  ];
  const isCustomized = JSON.stringify(config.quickReplies.map(s => s.trim())) !== JSON.stringify(defaultSuggestions);
  
  if (isCustomized) {
    return config.quickReplies;
  }

  const text = lastUserMessage.toLowerCase();
  if (contains(text, ['hi', 'hello', 'hey'])) {
    return ["What are your features?", "Book an appointment"];
  }
  if (contains(text, ['price', 'pricing', 'cost'])) {
    return ["Can I try it for free?", "How do I embed it?"];
  }
  if (contains(text, ['feature', 'what can you do'])) {
    return ["How do I embed this?", "Get support contact"];
  }
  // Default fallback questions (uses user-defined suggestions)
  return config.quickReplies;
}

// Helper to check if keyword exists in text
function contains(str, keywords) {
  return keywords.some(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(str);
  });
}

// Hex to RGB parser helper
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Adjust brightness of hex color (positive to lighten, negative to darken)
function adjustColorBrightness(hex, percent) {
  // Strip leading hash if present
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
  
  let R = parseInt(cleanHex.substring(0, 2), 16);
  let G = parseInt(cleanHex.substring(2, 4), 16);
  let B = parseInt(cleanHex.substring(4, 6), 16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R < 255) ? R : 255;
  G = (G < 255) ? G : 255;
  B = (B < 255) ? B : 255;

  R = (R > 0) ? R : 0;
  G = (G > 0) ? G : 0;
  B = (B > 0) ? B : 0;

  const rHex = R.toString(16).padStart(2, '0');
  const gHex = G.toString(16).padStart(2, '0');
  const bHex = B.toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

// Render interactive Lead Capture Card in chat
function renderLeadFormCard(source) {
  if (leadFormActive) return;
  leadFormActive = true;

  const messageEl = document.createElement('div');
  messageEl.className = 'message bot';
  
  const avatarHtml = `<img class="message-avatar-small" src="${config.avatarUrl}" alt="${config.botName}">`;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  let introText = "Please provide your details below and an agent will reach out to you shortly.";
  if (source === 'price') {
    introText = "Interested in pricing details? Leave your info below and our team will send a custom quote!";
  } else if (source === 'agent') {
    introText = "Let's get you connected with a specialist. Please share your details below:";
  } else if (source === 'webhook_failure') {
    introText = "I'm having trouble reaching my server right now. Leave your info so we can follow up directly!";
  }

  const formId = `lead-form-${Date.now()}`;
  messageEl.innerHTML = `
    ${avatarHtml}
    <div class="message-bubble-wrapper" style="width: 100%; max-width: 300px;">
      <div class="lead-form-card">
        <h4>📩 Share Your Details</h4>
        <p>${introText}</p>
        <form id="${formId}" style="display: flex; flex-direction: column; gap: 10px;">
          <div class="lead-input-group">
            <input type="text" class="lead-field-name" placeholder="Full Name" required autocomplete="name">
          </div>
          <div class="lead-input-group">
            <input type="email" class="lead-field-email" placeholder="Email Address" required autocomplete="email">
          </div>
          <div class="lead-input-group">
            <input type="tel" class="lead-field-phone" placeholder="Phone Number" required autocomplete="tel">
          </div>
          <button type="submit" class="lead-submit-btn">Submit Details</button>
        </form>
      </div>
      <span class="message-time">${time}</span>
    </div>
  `;
  
  messagesList.appendChild(messageEl);
  scrollToBottom();

  const form = document.getElementById(formId);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nameVal = form.querySelector('.lead-field-name').value.trim();
    const emailVal = form.querySelector('.lead-field-email').value.trim();
    const phoneVal = form.querySelector('.lead-field-phone').value.trim();
    
    const leadData = {
      id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      name: nameVal,
      email: emailVal,
      phone: phoneVal,
      timestamp: new Date().toISOString(),
      source: source,
      botName: config.botName
    };
    
    form.querySelectorAll('input').forEach(input => input.disabled = true);
    const submitBtn = form.querySelector('.lead-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    // Post to Webhook if available
    let postPromise = Promise.resolve();
    if (config.n8nUrl) {
      postPromise = fetch(config.n8nUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: 'lead_captured',
          lead: leadData,
          sessionId: getSessionId(),
          timestamp: new Date().toISOString(),
          projectId: config.projectId
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Webhook responded with status ${response.status}`);
        }
        return response;
      });
    }

    postPromise
      .then(() => {
        // Post message to parent window (for live preview dashboard UI updates in-memory)
        try {
          window.parent.postMessage({ type: 'kartabot-lead-captured', lead: leadData }, '*');
        } catch (err) {
          console.error("Failed to postMessage lead data to parent window", err);
        }
        
        setTimeout(() => {
          const card = form.closest('.lead-form-card');
          card.innerHTML = `
            <div class="lead-success-state">
              <div class="lead-success-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4>Details Saved!</h4>
              <p>Thank you, <strong>${escapeHtml(nameVal)}</strong>. An agent will contact you soon!</p>
            </div>
          `;
          leadFormActive = false;
          scrollToBottom();
        }, 800);
      })
      .catch(error => {
        console.error("Failed to post lead to webhook:", error);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Details';
        form.querySelectorAll('input').forEach(input => input.disabled = false);
        alert("Failed to submit details to webhook. Please check connection and try again.");
      });
  });
}

// Render interactive Gemstone Recommendation Form Card in chat
function renderGemstoneFormCard() {
  if (leadFormActive) return; // Share the form active lock to prevent duplicate cards
  leadFormActive = true;

  const messageEl = document.createElement('div');
  messageEl.className = 'message bot';
  
  const avatarHtml = `<img class="message-avatar-small" src="${config.avatarUrl}" alt="${config.botName}">`;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const introText = "Please fill out your birth details and weight to receive your gemstone recommendation:";
  const formId = `gemstone-form-${Date.now()}`;

  messageEl.innerHTML = `
    ${avatarHtml}
    <div class="message-bubble-wrapper" style="width: 100%; max-width: 300px;">
      <div class="lead-form-card">
        <h4>💎 Gemstone Recommendation</h4>
        <p>${introText}</p>
        <form id="${formId}" style="display: flex; flex-direction: column; gap: 10px;">
          <div class="lead-input-group">
            <input type="text" class="lead-field-name" placeholder="Full Name" required autocomplete="name">
          </div>
          <div class="lead-input-group">
            <label>Date of Birth</label>
            <input type="date" class="lead-field-dob" required>
          </div>
          <div class="lead-input-group">
            <label>Time of Birth</label>
            <input type="time" class="lead-field-tob" required>
          </div>
          <div class="lead-input-group">
            <input type="text" class="lead-field-pob" placeholder="Place of Birth" required>
          </div>
          <div class="lead-input-group">
            <input type="number" class="lead-field-weight" placeholder="Body Weight (kg)" required min="1" max="500" step="any">
          </div>
          <button type="submit" class="lead-submit-btn">Get Recommendation</button>
        </form>
      </div>
      <span class="message-time">${time}</span>
    </div>
  `;
  
  messagesList.appendChild(messageEl);
  scrollToBottom();

  const form = document.getElementById(formId);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nameVal = form.querySelector('.lead-field-name').value.trim();
    const dobVal = form.querySelector('.lead-field-dob').value;
    const tobVal = form.querySelector('.lead-field-tob').value;
    const pobVal = form.querySelector('.lead-field-pob').value.trim();
    const weightVal = parseFloat(form.querySelector('.lead-field-weight').value);
    
    const gemData = {
      id: 'gem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      name: nameVal,
      dob: dobVal,
      tob: tobVal,
      pob: pobVal,
      weight: weightVal,
      timestamp: new Date().toISOString(),
      source: 'gemstone',
      botName: config.botName
    };
    
    form.querySelectorAll('input').forEach(input => input.disabled = true);
    const submitBtn = form.querySelector('.lead-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    // Clear any previous error
    const existingError = form.querySelector('.lead-form-error');
    if (existingError) {
      existingError.remove();
    }
    
    // Setup AbortController for a 15-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 15000);

    // Post to Webhook if available
    let postPromise = Promise.resolve(null);
    if (config.n8nUrl) {
      postPromise = fetch(config.n8nUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({
          event: 'gemstone_recommendation',
          lead: gemData,
          sessionId: getSessionId(),
          timestamp: new Date().toISOString(),
          projectId: config.projectId
        })
      })
      .then(response => {
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error(`Webhook responded with status ${response.status}`);
        }
        return response.text().then(text => {
          try {
            return JSON.parse(text);
          } catch (e) {
            return text; // Return raw text if not valid JSON
          }
        });
      })
      .catch(err => {
        clearTimeout(timeoutId);
        throw err;
      });
    }

    postPromise
      .then((data) => {
        // Post message to parent window (for live preview dashboard UI updates if needed)
        try {
          window.parent.postMessage({ type: 'kartabot-lead-captured', lead: gemData }, '*');
        } catch (err) {
          console.error("Failed to postMessage gemstone data to parent window", err);
        }
        
        setTimeout(() => {
          try {
            const card = form.closest('.lead-form-card');
            if (!card) {
              throw new Error("Could not find lead-form-card element in DOM");
            }
            
            let responseText = extractText(data);
            
            if (!responseText) {
              responseText = `Thank you, **${escapeHtml(nameVal)}**. We've recorded your birth details and will recommend your gemstone shortly!`;
            }
            
            const formattedReply = parseMessageMarkdown(responseText);

            const stones = {
              emerald: { label: "Emerald (Panna)", img: "https://cdn.shopify.com/s/files/1/0666/4798/2128/files/green1.png?v=1770534103", buy: "https://www.velgemsandjewellers.com/collections/emerald-panna", keywords: ["emerald", "panna"] },
              yellow: { label: "Yellow Sapphire", img: "https://cdn.shopify.com/s/files/1/0666/4798/2128/files/yellow1.png?v=1770534117", buy: "https://www.velgemsandjewellers.com/collections/yellow-sapphire-pukhraj", keywords: ["yellow sapphire", "pukhraj"] },
              blue: { label: "Blue Sapphire", img: "https://cdn.shopify.com/s/files/1/0666/4798/2128/files/blue1.png?v=1770534176", buy: "https://www.velgemsandjewellers.com/collections/blue-sapphire-neelam", keywords: ["blue sapphire", "neelam"] },
              ruby: { label: "Ruby (Manik)", img: "https://cdn.shopify.com/s/files/1/0666/4798/2128/files/red1.png?v=1770534117", buy: "https://www.velgemsandjewellers.com/collections/ruby-manik", keywords: ["ruby", "manik"] },
              safed: { label: "White Sapphire (Safed Pukhraj)", img: "https://cdn.shopify.com/s/files/1/0666/4798/2128/files/white1.png?v=1770534117", buy: "https://www.velgemsandjewellers.com/collections/white-sapphire-safed-pukhraj", keywords: ["white sapphire", "safed pukhraj", "safed"] },
              hessonite: { label: "Hessonite (Gomed)", img: "https://cdn.shopify.com/s/files/1/0666/4798/2128/files/full_logosvg.svg?v=1768233942", buy: "https://www.velgemsandjewellers.com/collections/hessonite-gomed", keywords: ["hessonite", "gomed"] },
              gomed: { label: "Hessonite (Gomed)", img: "https://cdn.shopify.com/s/files/1/0666/4798/2128/files/full_logosvg.svg?v=1768233942", buy: "https://www.velgemsandjewellers.com/collections/hessonite-gomed", keywords: ["hessonite", "gomed"] },
              coral: { label: "Red Coral (Moonga)", img: "https://cdn.shopify.com/s/files/1/0666/4798/2128/files/full_logosvg.svg?v=1768233942", buy: "https://www.velgemsandjewellers.com/collections/red-coral-moonga", keywords: ["red coral", "coral", "moonga"] },
              moonga: { label: "Red Coral (Moonga)", img: "https://cdn.shopify.com/s/files/1/0666/4798/2128/files/full_logosvg.svg?v=1768233942", buy: "https://www.velgemsandjewellers.com/collections/red-coral-moonga", keywords: ["red coral", "coral", "moonga"] },
              cats: { label: "Cats Eye (Lahsuniya)", img: "https://cdn.shopify.com/s/files/1/0666/4798/2128/files/full_logosvg.svg?v=1768233942", buy: "https://www.velgemsandjewellers.com/collections/cats-eye-lahsuniya", keywords: ["cats eye", "lahsuniya", "cat's eye"] },
              lahsuniya: { label: "Cats Eye (Lahsuniya)", img: "https://cdn.shopify.com/s/files/1/0666/4798/2128/files/full_logosvg.svg?v=1768233942", buy: "https://www.velgemsandjewellers.com/collections/cats-eye-lahsuniya", keywords: ["cats eye", "lahsuniya", "cat's eye"] },
              pearl: { label: "Pearl (Moti)", img: "https://cdn.shopify.com/s/files/1/0666/4798/2128/files/full_logosvg.svg?v=1768233942", buy: "https://www.velgemsandjewellers.com/collections/pearl-moti", keywords: ["pearl", "moti"] },
              moti: { label: "Pearl (Moti)", img: "https://cdn.shopify.com/s/files/1/0666/4798/2128/files/full_logosvg.svg?v=1768233942", buy: "https://www.velgemsandjewellers.com/collections/pearl-moti", keywords: ["pearl", "moti"] },
              opal: { label: "Opal (Dudhiya Pathar)", img: "https://cdn.shopify.com/s/files/1/0666/4798/2128/files/full_logosvg.svg?v=1768233942", buy: "https://www.velgemsandjewellers.com/collections/opal-dudhiya-pathar", keywords: ["opal", "dudhiya"] },
              garnet: { label: "Red Garnet (Rakt Mani)", img: "https://cdn.shopify.com/s/files/1/0666/4798/2128/files/full_logosvg.svg?v=1768233942", buy: "https://www.velgemsandjewellers.com/collections/red-garnet-rakt-mani", keywords: ["garnet", "rakt mani"] },
              moonstone: { label: "Moonstone (Chandrakant)", img: "https://cdn.shopify.com/s/files/1/0666/4798/2128/files/full_logosvg.svg?v=1768233942", buy: "https://www.velgemsandjewellers.com/collections/moonstone-chandrakant", keywords: ["moonstone", "chandrakant"] },
              carnelian: { label: "Carnelian (Rat-Ratua)", img: "https://cdn.shopify.com/s/files/1/0666/4798/2128/files/full_logosvg.svg?v=1768233942", buy: "https://www.velgemsandjewellers.com/collections/carnelian-rat-ratua", keywords: ["carnelian", "rat-ratua"] },
              peridot: { label: "Peridot (Mani Stone)", img: "https://cdn.shopify.com/s/files/1/0666/4798/2128/files/full_logosvg.svg?v=1768233942", buy: "https://www.velgemsandjewellers.com/collections/peridot-mani-stone", keywords: ["peridot"] },
              onyx: { label: "Green Onyx (Sulemani)", img: "https://cdn.shopify.com/s/files/1/0666/4798/2128/files/full_logosvg.svg?v=1768233942", buy: "https://www.velgemsandjewellers.com/collections/green-onyx-sulemani", keywords: ["onyx", "sulemani"] },
              jade: { label: "Jade (Crassula)", img: "https://cdn.shopify.com/s/files/1/0666/4798/2128/files/full_logosvg.svg?v=1768233942", buy: "https://www.velgemsandjewellers.com/collections/jade-crassula", keywords: ["jade"] },
              citrine: { label: "Citrine (Sunela)", img: "https://cdn.shopify.com/s/files/1/0666/4798/2128/files/full_logosvg.svg?v=1768233942", buy: "https://www.velgemsandjewellers.com/collections/citrine-sunela", keywords: ["citrine", "sunela"] },
              amethyst: { label: "Amethyst", img: "https://cdn.shopify.com/s/files/1/0666/4798/2128/files/full_logosvg.svg?v=1768233942", buy: "https://www.velgemsandjewellers.com/collections/amethyst-jamunia", keywords: ["amethyst", "jamunia"] }
            };

            const lowerText = responseText.toLowerCase();
            const primaryMatch = responseText.match(/Primary Gemstone:\s*([^\n\r#]+)/i);
            const primaryText = primaryMatch ? primaryMatch[1].trim().toLowerCase() : "";
            
            let primaryKey = "";
            Object.keys(stones).forEach(key => {
              if (primaryText && stones[key].keywords.some(kw => primaryText.includes(kw))) {
                primaryKey = key;
              }
            });

            let gemstoneGridHtml = "";
            let matchCount = 0;
            const renderedStones = new Set();

            Object.keys(stones).forEach(key => {
              const isMatched = stones[key].keywords.some(keyword => lowerText.includes(keyword));
              if (isMatched) {
                const uniqueId = stones[key].buy;
                if (renderedStones.has(uniqueId)) return;
                renderedStones.add(uniqueId);

                matchCount++;
                const isPrimary = (key === primaryKey);
                gemstoneGridHtml += `
                  <div class="gemstone-card" style="position: relative; flex: 0 0 120px; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 12px 8px; border-radius: 12px; box-sizing: border-box; background-color: ${isPrimary ? 'rgba(34, 197, 94, 0.05)' : 'var(--input-bg)'}; border: ${isPrimary ? '1.5px solid #22c55e' : '1px solid var(--input-border)'}; box-shadow: var(--shadow-sm); z-index: 1;">
                    ${isPrimary ? '<span style="position: absolute; top: 6px; right: 6px; background-color: #22c55e; color: #ffffff; font-size: 8px; font-weight: 700; padding: 1px 4px; border-radius: 3px; letter-spacing: 0.5px; z-index: 10;">PRIMARY</span>' : ''}
                    <img src="${stones[key].img}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-color); background-color: #ffffff; padding: 2px; margin-bottom: 8px;">
                    <strong style="font-size: 11px; font-weight: 600; color: var(--header-text); margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 30px; line-height: 1.3; width: 100%;">${stones[key].label}</strong>
                    <a class="gemstone-buy-btn" href="${stones[key].buy}" target="_blank">Buy Now</a>
                  </div>
                `;
              }
            });

            let gemstoneSectionHtml = "";
            if (matchCount > 0) {
              gemstoneSectionHtml = `
                <div style="margin-top: 14px; width: 100%;">
                  <h4 style="font-size: 12px; font-weight: 600; color: var(--header-text); margin-bottom: 4px; text-align: left;">Recommended Gemstones</h4>
                  <div class="gemstone-grid">
                    ${gemstoneGridHtml}
                  </div>
                </div>
              `;
            }
            
            card.innerHTML = `
              <div class="lead-success-state" style="text-align: left; align-items: flex-start; padding: 0; width: 100%;">
                <div class="lead-success-icon" style="background-color: rgba(168, 85, 247, 0.1); color: #a855f7; margin-bottom: 8px; align-self: center;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 style="align-self: center; margin-bottom: 8px;">Recommendation</h4>
                <div style="font-size: 13px; color: var(--body-text); line-height: 1.5; width: 100%;">${formattedReply}</div>
                ${gemstoneSectionHtml}
              </div>
            `;
            leadFormActive = false;
            scrollToBottom();
          } catch (err) {
            console.error("Error updating gemstone success card UI:", err);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Get Recommendation';
            form.querySelectorAll('input').forEach(input => input.disabled = false);
          }
        }, 800);
      })
      .catch(error => {
        console.error("Failed to post gemstone recommendation request to webhook:", error);
        
        // Handle AbortError / Timeout gracefully by closing form and displaying standard confirmation
        if (error.name === 'AbortError') {
          setTimeout(() => {
            try {
              const card = form.closest('.lead-form-card');
              if (card) {
                const fallbackText = `Your birth details have been recorded! The calculation is taking a bit longer, but we will send your gemstone recommendation shortly.`;
                card.innerHTML = `
                  <div class="lead-success-state" style="text-align: left; align-items: flex-start; padding: 0;">
                    <div class="lead-success-icon" style="background-color: rgba(168, 85, 247, 0.1); color: #a855f7; margin-bottom: 8px; align-self: center;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h4 style="align-self: center; margin-bottom: 8px;">Recommendation</h4>
                    <div style="font-size: 13px; color: var(--body-text); line-height: 1.5; width: 100%;">${fallbackText}</div>
                  </div>
                `;
              }
              leadFormActive = false;
              scrollToBottom();
            } catch (e) {}
          }, 800);
          return;
        }

        submitBtn.disabled = false;
        submitBtn.textContent = 'Get Recommendation';
        form.querySelectorAll('input').forEach(input => input.disabled = false);
        
        // Show inline error message instead of blocking browser alert
        let errorEl = form.querySelector('.lead-form-error');
        if (!errorEl) {
          errorEl = document.createElement('div');
          errorEl.className = 'lead-form-error';
          errorEl.style.color = '#ef4444';
          errorEl.style.fontSize = '12px';
          errorEl.style.marginTop = '8px';
          form.appendChild(errorEl);
        }
        errorEl.textContent = "⚠️ Submission failed. Please check connection and try again.";
      });
  });
}

function escapeHtml(string) {
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Close Chat Frame postMessage trigger
closeChatButton.addEventListener('click', () => {
  window.parent.postMessage({ type: 'kartabot-widget-toggle', action: 'close' }, '*');
});

// Initialize on page load
window.addEventListener('DOMContentLoaded', initWidget);

// Handle commands from the parent/host window
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'kartabot-widget-focus') {
    setTimeout(() => {
      chatInput.focus();
    }, 150);
  }
});

// Render interactive Appointment Booking Form Card in chat
function renderAppointmentFormCard() {
  if (leadFormActive) return; // Share the form active lock to prevent duplicate cards
  leadFormActive = true;

  const messageEl = document.createElement('div');
  messageEl.className = 'message bot';
  
  const avatarHtml = `<img class="message-avatar-small" src="${config.avatarUrl}" alt="${config.botName}">`;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const introText = "Please select your preferred date and time slot below to schedule your appointment:";
  const formId = `appointment-form-${Date.now()}`;

  // Get tomorrow's date to set min date (so they can only book tomorrow onwards)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];

  messageEl.innerHTML = `
    ${avatarHtml}
    <div class="message-bubble-wrapper" style="width: 100%; max-width: 300px;">
      <div class="lead-form-card">
        <h4>📅 Book Appointment</h4>
        <p>${introText}</p>
        <form id="${formId}" style="display: flex; flex-direction: column; gap: 10px;">
          <div class="lead-input-group">
            <input type="text" class="lead-field-name" placeholder="Full Name" required autocomplete="name">
          </div>
          <div class="lead-input-group">
            <input type="email" class="lead-field-email" placeholder="Email Address" required autocomplete="email">
          </div>
          <div class="lead-input-group">
            <label>Select Date</label>
            <input type="date" class="lead-field-date" required min="${minDateStr}">
          </div>
          <div class="lead-input-group">
            <label>Preferred Time Slot</label>
            <select class="lead-field-slot" required>
              <option value="">Choose a slot...</option>
              <option value="09:00 AM">09:00 AM</option>
              <option value="10:30 AM">10:30 AM</option>
              <option value="01:00 PM">01:00 PM</option>
              <option value="02:30 PM">02:30 PM</option>
              <option value="04:00 PM">04:00 PM</option>
            </select>
          </div>
          <div class="lead-input-group">
            <textarea class="lead-field-notes" placeholder="Meeting purpose or notes..." rows="2" style="width: 100%; box-sizing: border-box; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: var(--radius-sm); padding: 8px; color: var(--text-color); font-family: inherit; font-size: 13px; resize: none;"></textarea>
          </div>
          <button type="submit" class="lead-submit-btn">Schedule Meeting</button>
        </form>
      </div>
      <span class="message-time">${time}</span>
    </div>
  `;
  
  messagesList.appendChild(messageEl);
  scrollToBottom();

  const form = document.getElementById(formId);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nameVal = form.querySelector('.lead-field-name').value.trim();
    const emailVal = form.querySelector('.lead-field-email').value.trim();
    const dateVal = form.querySelector('.lead-field-date').value;
    const slotVal = form.querySelector('.lead-field-slot').value;
    const notesVal = form.querySelector('.lead-field-notes').value.trim();
    
    const appointmentData = {
      id: 'apt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      name: nameVal,
      email: emailVal,
      date: dateVal,
      slot: slotVal,
      notes: notesVal,
      timestamp: new Date().toISOString(),
      source: 'appointment',
      botName: config.botName
    };
    
    form.querySelectorAll('input, select, textarea').forEach(input => input.disabled = true);
    const submitBtn = form.querySelector('.lead-submit-btn');
    submitBtn.textContent = 'Scheduling...';
    submitBtn.disabled = true;

    // Send payload back to Cloudflare/n8n
    let postPromise = Promise.resolve();
    if (config.n8nUrl) {
      postPromise = fetch(config.n8nUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: 'appointment_booking',
          appointment: appointmentData,
          sessionId: getSessionId(),
          timestamp: new Date().toISOString(),
          projectId: config.projectId
        })
      });
    }

    // Try posting message to parent dashboard
    try {
      window.parent.postMessage({
        type: 'kartabot-lead-captured',
        lead: {
          id: appointmentData.id,
          name: appointmentData.name,
          email: appointmentData.email,
          phone: `Date: ${appointmentData.date} @ ${appointmentData.slot}`,
          timestamp: appointmentData.timestamp,
          botName: appointmentData.botName,
          source: 'Agent Request'
        }
      }, '*');
    } catch (err) {
      console.error("Failed to postMessage appointment data to parent window", err);
    }

    postPromise
      .then(response => {
        if (response && response.ok) {
          return response.json();
        }
        return null;
      })
      .then(data => {
        leadFormActive = false;
        
        let responseText = `Thank you, **${escapeHtml(nameVal)}**. Your appointment on **${escapeHtml(dateVal)}** at **${escapeHtml(slotVal)}** has been requested! You will receive an email confirmation shortly.`;
        
        if (data) {
          const customReply = extractText(data);
          if (customReply) responseText = customReply;
        }

        const formCard = form.closest('.lead-form-card');
        formCard.innerHTML = `
          <div style="text-align: center; padding: 10px 0;">
            <div style="width: 48px; height: 48px; background: rgba(34, 197, 94, 0.1); color: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto; font-size: 20px;">✓</div>
            <h4 style="margin-bottom: 4px; color: var(--header-text);">Appointment Requested</h4>
            <p style="font-size: 12px; color: var(--text-muted); line-height: 1.4; margin: 0;">${responseText}</p>
          </div>
        `;
        scrollToBottom();
      })
      .catch(error => {
        console.error("Failed to post appointment booking request to webhook:", error);
        leadFormActive = false;
        
        const formCard = form.closest('.lead-form-card');
        formCard.innerHTML = `
          <div style="text-align: center; padding: 10px 0;">
            <div style="width: 48px; height: 48px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto; font-size: 20px;">!</div>
            <h4 style="margin-bottom: 4px; color: var(--header-text);">Booking offline</h4>
            <p style="font-size: 12px; color: var(--text-muted); line-height: 1.4; margin: 0;">We recorded your request for **${escapeHtml(dateVal)}** at **${escapeHtml(slotVal)}** locally, but couldn't reach the calendar server. We will contact you at **${escapeHtml(emailVal)}** to confirm!</p>
          </div>
        `;
        scrollToBottom();
      });
  });
}

