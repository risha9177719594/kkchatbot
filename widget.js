(function () {
  // Retrieve script configuration
  let currentScript = document.currentScript;
  if (!currentScript) {
    currentScript = document.getElementById('kartabot-widget-script') || 
                    document.getElementById('kartabot-preview-script');
  }
  if (!currentScript) {
    // Search for any script tag containing 'widget.js' in its src
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].getAttribute('src') || '';
      if (src && (src.includes('widget.js') || scripts[i].id.includes('kartabot'))) {
        currentScript = scripts[i];
        break;
      }
    }
  }

  // Prevent duplicate script execution (skip for live preview in dashboard console)
  const isPreview = currentScript && currentScript.id === 'kartabot-preview-script';
  if (!isPreview) {
    if (window.KartaBotWidgetInitialized) return;
    window.KartaBotWidgetInitialized = true;
  }

  // Fallback defaults if no script tag is resolved
  const botName = currentScript ? (currentScript.getAttribute('data-bot-name') || 'KartaBot') : 'KartaBot';
  const accentColor = currentScript ? (currentScript.getAttribute('data-color') || '#6366f1') : '#6366f1';
  const theme = currentScript ? (currentScript.getAttribute('data-theme') || 'light') : 'light';
  const welcomeMessage = currentScript ? (currentScript.getAttribute('data-welcome') || 'Hello! How can I help you today?') : 'Hello! How can I help you today?';
  const avatarUrl = currentScript ? (currentScript.getAttribute('data-avatar') || '') : '';
  const position = currentScript ? (currentScript.getAttribute('data-position') || 'right') : 'right';
  const n8nUrl = currentScript ? (currentScript.getAttribute('data-n8n-url') || '') : '';
  const suggestions = currentScript ? (currentScript.getAttribute('data-suggestions') || '') : '';

  // Resolve widget directory to load widget-ui.html relative to this script
  let baseUrl = '';
  try {
    if (currentScript && currentScript.src) {
      const scriptSrc = currentScript.src;
      const url = new URL(scriptSrc);
      baseUrl = url.origin + url.pathname.substring(0, url.pathname.lastIndexOf('/'));
    }
  } catch (e) {
    console.error('KartaBot: Error resolving script path. Using relative path.', e);
  }

  // If baseUrl couldn't be resolved or is empty, use the current document origin
  if (!baseUrl) {
    baseUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
  }
  const widgetUiUrl = `${baseUrl}/widget-ui.html`;

  // Construct iframe source URL with configuration query parameters
  const queryParams = new URLSearchParams({
    botName: botName,
    color: accentColor,
    theme: theme,
    welcome: welcomeMessage,
  });
  if (avatarUrl) queryParams.set('avatar', avatarUrl);
  if (n8nUrl) queryParams.set('n8nUrl', n8nUrl);
  if (suggestions) queryParams.set('suggestions', suggestions);
  
  const finalIframeUrl = `${widgetUiUrl}?${queryParams.toString()}`;

  // Inject styles for launcher and iframe container
  const styleEl = document.createElement('style');
  const positionStyles = position === 'left' 
    ? `left: 20px; right: auto;` 
    : `right: 20px; left: auto;`;

  const flexPositionStyles = position === 'left'
    ? `align-items: flex-start;`
    : `align-items: flex-end;`;

  styleEl.textContent = `
    .kartabot-widget-container {
      position: fixed;
      bottom: 20px;
      ${positionStyles}
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      ${flexPositionStyles}
      gap: 16px;
      width: 56px;
      height: 56px;
      overflow: visible;
      transition: width 0.25s ease, height 0.25s ease;
    }
    
    .kartabot-widget-container.open {
      width: 380px;
      height: 672px;
      max-height: calc(100vh - 40px);
    }
    
    /* Nesting inside preview container override */
    .kartabot-widget-container.kartabot-inline {
      position: absolute;
      bottom: 20px;
      z-index: 99999;
    }
    
    .kartabot-widget-container.kartabot-inline.open {
      width: 340px;
      height: 552px;
    }
    
    .kartabot-iframe-wrapper {
      position: absolute;
      bottom: 72px;
      ${position}: 0;
      width: 380px;
      height: 600px;
      max-height: calc(100vh - 110px);
      background: transparent;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.16);
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid rgba(0, 0, 0, 0.05);
      transform: translateY(20px) scale(0.95);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
      transform-origin: bottom ${position};
    }
    
    .kartabot-widget-container.kartabot-inline .kartabot-iframe-wrapper {
      max-height: calc(100% - 80px);
      height: 480px;
      width: 340px;
    }
    
    .kartabot-iframe-wrapper.open {
      transform: translateY(0) scale(1);
      opacity: 1;
      pointer-events: auto;
    }
    
    .kartabot-iframe-wrapper iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }
    
    .kartabot-launcher {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background-color: ${accentColor};
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
      position: relative;
    }
    
    .kartabot-launcher:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.22);
    }
    
    .kartabot-launcher:active {
      transform: scale(0.95);
    }
    
    .kartabot-launcher-icon {
      position: absolute;
      transition: transform 0.25s ease, opacity 0.2s ease;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .kartabot-icon-chat {
      opacity: 1;
      transform: rotate(0deg) scale(1);
    }
    
    .kartabot-icon-close {
      opacity: 0;
      transform: rotate(-90deg) scale(0.5);
    }
    
    .kartabot-launcher.open .kartabot-icon-chat {
      opacity: 0;
      transform: rotate(90deg) scale(0.5);
    }
    
    .kartabot-launcher.open .kartabot-icon-close {
      opacity: 1;
      transform: rotate(0deg) scale(1);
    }
    
    /* Mobile Responsiveness */
    @media (max-width: 480px) {
      .kartabot-widget-container:not(.kartabot-inline) {
        bottom: 20px;
        ${positionStyles}
        padding: 0;
        gap: 0;
      }
      .kartabot-widget-container:not(.kartabot-inline).open {
        width: 100vw;
        height: 100vh;
        bottom: 0;
        left: 0;
        right: 0;
      }
      .kartabot-widget-container:not(.kartabot-inline) .kartabot-iframe-wrapper {
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
        bottom: 0;
        left: 0;
        right: 0;
        top: 0;
        position: fixed;
        border: none;
        transform: translateY(100%);
        transform-origin: bottom center;
      }
      .kartabot-widget-container:not(.kartabot-inline) .kartabot-iframe-wrapper.open {
        transform: translateY(0);
      }
      .kartabot-widget-container:not(.kartabot-inline) .kartabot-launcher {
        position: fixed;
        bottom: 20px;
        ${positionStyles}
        z-index: 1000000;
        transition: transform 0.25s ease;
      }
      .kartabot-widget-container:not(.kartabot-inline) .kartabot-launcher.open {
        transform: scale(0);
        pointer-events: none;
      }
    }
  `;
  document.head.appendChild(styleEl);

  // Check if a specific preview host element exists
  const host = document.getElementById('kartabot-widget-host') || document.body;

  // Create markup
  const widgetContainer = document.createElement('div');
  widgetContainer.className = 'kartabot-widget-container';
  if (host !== document.body) {
    widgetContainer.classList.add('kartabot-inline');
  }


  // Iframe Wrapper
  const iframeWrapper = document.createElement('div');
  iframeWrapper.className = 'kartabot-iframe-wrapper';
  
  const iframe = document.createElement('iframe');
  iframe.src = finalIframeUrl;
  iframe.title = botName;
  iframe.allow = 'autoplay; microphone; clipboard-write';
  
  iframeWrapper.appendChild(iframe);
  widgetContainer.appendChild(iframeWrapper);

  // Launcher Button
  const launcher = document.createElement('button');
  launcher.className = 'kartabot-launcher';
  launcher.setAttribute('aria-label', `Open chat with ${botName}`);

  // SVG Chat Icon
  const chatIcon = document.createElement('div');
  chatIcon.className = 'kartabot-launcher-icon kartabot-icon-chat';
  chatIcon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  `;

  // SVG Close Icon
  const closeIcon = document.createElement('div');
  closeIcon.className = 'kartabot-launcher-icon kartabot-icon-close';
  closeIcon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  `;

  launcher.appendChild(chatIcon);
  launcher.appendChild(closeIcon);
  widgetContainer.appendChild(launcher);

  // Append to host container
  host.appendChild(widgetContainer);

  // Toggle Functionality
  function toggleChat() {
    const isOpen = iframeWrapper.classList.toggle('open');
    launcher.classList.toggle('open', isOpen);
    widgetContainer.classList.toggle('open', isOpen);
    
    if (isOpen) {
      // Focus the chat input inside the iframe if possible
      try {
        iframe.contentWindow.postMessage({ type: 'kartabot-widget-focus' }, '*');
      } catch (e) {}
    }
  }

  launcher.addEventListener('click', toggleChat);

  // Handle postMessage commands from inside iframe (like Close button)
  window.addEventListener('message', (event) => {
    // Basic verification: accept toggles from any source for template compatibility
    if (event.data && event.data.type === 'kartabot-widget-toggle') {
      if (event.data.action === 'close') {
        iframeWrapper.classList.remove('open');
        launcher.classList.remove('open');
        widgetContainer.classList.remove('open');
      }
    }
  });

})();
