// DOM Elements
const botNameInput = document.getElementById('input-bot-name');
const welcomeInput = document.getElementById('input-welcome');
const n8nUrlInput = document.getElementById('input-n8n-url');
const colorPicker = document.getElementById('input-color-picker');
const colorHexText = document.getElementById('color-hex-val');
const themeButtons = document.querySelectorAll('.theme-btn');
const presetDots = document.querySelectorAll('.preset-dot');
const positionSelect = document.getElementById('select-position');
const codeSnippetBlock = document.getElementById('snippet-code-block');
const copyCodeBtn = document.getElementById('btn-copy-code');
const widgetHost = document.getElementById('kartabot-widget-host');

// State Variables
let activeTheme = 'light';
let activeColor = '#6366f1';

// Initial Load
window.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  updateWidget();
});

// Setup Control Event Listeners
function setupEventListeners() {
  // Input changes
  botNameInput.addEventListener('input', debounce(updateWidget, 300));
  welcomeInput.addEventListener('input', debounce(updateWidget, 300));
  n8nUrlInput.addEventListener('input', debounce(updateWidget, 300));
  positionSelect.addEventListener('change', updateWidget);

  // Color picker change
  colorPicker.addEventListener('input', (e) => {
    activeColor = e.target.value;
    colorHexText.textContent = activeColor.toUpperCase();
    
    // De-activate all presets unless it matches exactly
    presetDots.forEach(dot => {
      const dotColor = dot.getAttribute('data-color');
      dot.classList.toggle('active', dotColor.toLowerCase() === activeColor.toLowerCase());
    });
    
    updateWidget();
  });

  // Preset dots clicks
  presetDots.forEach(dot => {
    dot.addEventListener('click', () => {
      // De-activate current presets, activate clicked
      presetDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      
      // Update values
      activeColor = dot.getAttribute('data-color');
      colorPicker.value = activeColor;
      colorHexText.textContent = activeColor.toUpperCase();
      
      updateWidget();
    });
  });

  // Theme presets selection
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      themeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      activeTheme = btn.getAttribute('data-theme');
      updateWidget();
    });
  });

  // Copy code button click
  copyCodeBtn.addEventListener('click', copyCodeSnippet);
}

// Generate Embed Code Text
function generateSnippetText(config) {
  // Use the current origin where dashboard is served, falling back to a sample URL
  const scriptOrigin = window.location.origin.startsWith('http') 
    ? window.location.origin 
    : 'https://cdn.krutrimkarta.com';

  const n8nAttr = config.n8nUrl ? `\n  data-n8n-url="${escapeHtml(config.n8nUrl)}"` : '';

  return `<!-- KartaBot Chatbot Widget Integration -->
<script
  src="${scriptOrigin}/widget.js"
  id="kartabot-widget-script"
  data-bot-name="${escapeHtml(config.botName)}"
  data-color="${config.color}"
  data-theme="${config.theme}"
  data-welcome="${escapeHtml(config.welcome)}"
  data-position="${config.position}"${n8nAttr}
  defer>
</script>`;
}

// Main Updater: Re-renders snippet and re-injects Widget Script into host
function updateWidget() {
  const config = {
    botName: botNameInput.value.trim() || 'KartaBot',
    welcome: welcomeInput.value.trim() || 'Hello! How can I help you today?',
    n8nUrl: n8nUrlInput.value.trim(),
    color: activeColor,
    theme: activeTheme,
    position: positionSelect.value
  };

  // 1. Update the integration snippet code block display
  codeSnippetBlock.textContent = generateSnippetText(config);

  // 2. Remove previously injected widget elements from host preview
  // Remove container markup
  const existingContainer = widgetHost.querySelector('.kartabot-widget-container');
  if (existingContainer) {
    existingContainer.remove();
  }

  // Remove styling injected by widget.js (we select by searching style element containing 'kartabot')
  const styleElements = document.querySelectorAll('head style');
  styleElements.forEach(style => {
    if (style.textContent.includes('kartabot-widget-container')) {
      style.remove();
    }
  });

  // Remove previous script loader tag inside the host
  const existingScript = document.getElementById('kartabot-preview-script');
  if (existingScript) {
    existingScript.remove();
  }

  // 3. Inject new widget script dynamically with timestamp to force fresh setup
  const script = document.createElement('script');
  script.id = 'kartabot-preview-script';
  script.src = `widget.js?t=${new Date().getTime()}`;
  script.setAttribute('data-bot-name', config.botName);
  script.setAttribute('data-color', config.color);
  script.setAttribute('data-theme', config.theme);
  script.setAttribute('data-welcome', config.welcome);
  script.setAttribute('data-position', config.position);
  if (config.n8nUrl) {
    script.setAttribute('data-n8n-url', config.n8nUrl);
  }
  script.defer = true;

  // Append script to host container so it initializes inside preview website
  widgetHost.appendChild(script);
}

// Copy to Clipboard logic
function copyCodeSnippet() {
  const codeText = codeSnippetBlock.textContent;
  
  navigator.clipboard.writeText(codeText).then(() => {
    const btnText = copyCodeBtn.querySelector('.btn-text');
    
    // Visual Feedback
    copyCodeBtn.classList.add('copied');
    btnText.textContent = 'Copied!';
    
    setTimeout(() => {
      copyCodeBtn.classList.remove('copied');
      btnText.textContent = 'Copy Code';
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy snippet: ', err);
    alert('Failed to copy to clipboard. Please copy manually.');
  });
}

// Helper: Escape HTML strings for code display safety
function escapeHtml(string) {
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Helper: Debounce utility to prevent high-frequency re-renders on keystroke
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
