# Project Context: Websitebot (Krutrim Karta Chatbot Developer Console & Widget)

You are helping me with the **Websitebot** project, a visual configuration dashboard and embeddable chatbot widget created for Krutrim Karta.

## Project Overview
This project is built using vanilla HTML, CSS, and JavaScript (no heavy frameworks). It consists of two major parts:
1. **Developer Console (Dashboard)**: Allows developers to customize the bot's identity, preset themes, colors, position, greeting messages, and webhook URLs (like n8n). It generates an embed snippet.
2. **Embeddable Chatbot Widget**: A JavaScript wrapper script (widget.js) that clients add to their website to inject the chatbot iframe, and the underlying chatbot user interface (widget-ui.html, widget-ui.css, widget-ui.js).

## Directory Structure
- index.html - Developer console HTML interface.
- dashboard.css - Custom styling for the console.
- dashboard.js - Dynamic controls, state management, and embed snippet builder.
- widget.js - Loader script included in client websites to load and position the widget.
- widget-ui.html - Iframe chat interface HTML.
- widget-ui.css - Theme styles for the chatbot UI.
- widget-ui.js - Logic for sending/receiving chat messages (integrates with n8n/webhook endpoints).

Here is the source code of the files in the project:

## File: index.html
``html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KartaBot Developer Console - Create Chatbot Widget</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="dashboard.css">
</head>
<body>
  <!-- Dashboard Wrapper -->
  <div class="dashboard-wrapper">
    
    <!-- Sidebar: Configuration Panel -->
    <aside class="sidebar">
      <div class="logo-area">
        <div class="logo-icon"></div>
        <div class="logo-text">
          <h1>Krutrim Karta</h1>
          <span>Bot Console</span>
        </div>
      </div>

      <div class="panel-section">
        <h3>1. Bot Identity</h3>
        
        <div class="input-group">
          <label for="input-bot-name">Bot Name</label>
          <input type="text" id="input-bot-name" value="KartaBot" placeholder="e.g. HelpBot, Sales Assistant">
        </div>

        <div class="input-group">
          <label for="input-avatar">Bot Avatar URL</label>
          <input type="text" id="input-avatar" value="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80" placeholder="e.g. https://example.com/avatar.png">
        </div>

        <div class="input-group">
          <label for="input-welcome">Welcome Message</label>
          <textarea id="input-welcome" rows="3" placeholder="Welcome message sent on load...">Hello! Welcome to our website. How can I help you today? ðŸ˜Š</textarea>
        </div>

        <div class="input-group">
          <label for="input-n8n-url">n8n Webhook URL (Optional)</label>
          <input type="text" id="input-n8n-url" placeholder="https://primary.n8n.cloud/webhook/..." value="https://n8n.srv1175271.hstgr.cloud/webhook/VelBot">
        </div>

        <div class="input-group">
          <label for="input-suggestions">Suggested Questions (comma-separated)</label>
          <input type="text" id="input-suggestions" placeholder="e.g. Question 1, Question 2" value="What are your features?, Tell me about pricing, How do I embed this widget?">
        </div>
      </div>

      <div class="panel-section">
        <h3>2. Styling & Theme</h3>
        
        <div class="input-group">
          <label>Theme Preset</label>
          <div class="theme-grid">
            <button type="button" class="theme-btn active" data-theme="light">Light</button>
            <button type="button" class="theme-btn" data-theme="dark">Dark</button>
            <button type="button" class="theme-btn" data-theme="glass">Glass</button>
            <button type="button" class="theme-btn" data-theme="glass-dark">Glass Dark</button>
          </div>
        </div>

        <div class="input-group">
          <label>Accent Color</label>
          <div class="color-picker-wrapper">
            <input type="color" id="input-color-picker" value="#6366f1">
            <span id="color-hex-val">#6366f1</span>
          </div>
          <div class="color-presets">
            <button type="button" class="preset-dot active" style="background-color: #6366f1;" data-color="#6366f1"></button>
            <button type="button" class="preset-dot" style="background-color: #10b981;" data-color="#10b981"></button>
            <button type="button" class="preset-dot" style="background-color: #f43f5e;" data-color="#f43f5e"></button>
            <button type="button" class="preset-dot" style="background-color: #f59e0b;" data-color="#f59e0b"></button>
            <button type="button" class="preset-dot" style="background-color: #3b82f6;" data-color="#3b82f6"></button>
            <button type="button" class="preset-dot" style="background-color: #a855f7;" data-color="#a855f7"></button>
          </div>
        </div>

        <div class="input-group">
          <label for="select-position">Launcher Position</label>
          <select id="select-position">
            <option value="right">Right Side</option>
            <option value="left">Left Side</option>
          </select>
        </div>
      </div>

      <!-- Copyable Embed Code -->
      <div class="panel-section embed-code-section">
        <h3>3. Integration Snippet</h3>
        <p>Copy and paste this script tag into the <code>&lt;body&gt;</code> of your website.</p>
        
        <div class="code-container">
          <pre><code id="snippet-code-block">Loading snippet...</code></pre>
          <button id="btn-copy-code" aria-label="Copy code">
            <span class="btn-text">Copy Code</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content Area: Preview Playground -->
    <!-- Main Content Area: Preview Playground & Leads Console -->
    <main class="main-preview-area">
      <header class="preview-header">
        <div class="header-title-tabs">
          <div class="header-text-group">
            <h2>Developer Console</h2>
            <p>Configure options in the panel, and interact with the live widget below.</p>
          </div>
          <div class="dashboard-tabs">
            <button class="tab-btn active" data-tab="preview">Widget Preview</button>
            <button class="tab-btn" data-tab="leads">
              Captured Leads
              <span class="leads-count-badge" id="leads-badge" style="display: none;">0</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Tab Content: Widget Preview -->
      <div class="tab-content" id="tab-preview">
        <!-- Simulated Browser Mockup -->
        <div class="browser-mockup">
          <div class="browser-topbar">
            <div class="dots">
              <span class="dot-red"></span>
              <span class="dot-yellow"></span>
              <span class="dot-green"></span>
            </div>
            <div class="address-bar">
              <svg class="lock-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
              </svg>
              <span>https://example.com/preview</span>
            </div>
            <div class="actions">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <!-- Simulated Website Content Container -->
          <div class="browser-body" id="kartabot-widget-host">
            <!-- Mock Website Content -->
            <nav class="mock-nav">
              <div class="mock-logo">
                <div class="mock-logo-circle"></div>
                <span>SaaSify</span>
              </div>
              <div class="mock-links">
                <span>Features</span>
                <span>Solutions</span>
                <span>Pricing</span>
              </div>
              <button class="mock-btn-nav">Get Started</button>
            </nav>

            <section class="mock-hero">
              <div class="hero-badge">Next Gen Automation</div>
              <h2>Scale Customer Relationships with AI Agents</h2>
              <p>Empower your website visitors to resolve questions instantly. Customize themes, colors, and features in less than 5 minutes. Try out our live chatbot widget on the bottom right!</p>
              <div class="hero-ctas">
                <button class="mock-btn-primary">Start Free Trial</button>
                <button class="mock-btn-outline">Watch Demo</button>
              </div>
            </section>

            <section class="mock-features">
              <div class="mock-feature-card">
                <div class="feature-icon">âœ¨</div>
                <h4>Zero Code Integration</h4>
                <p>Just drop in a single script tag and your chatbot is enabled.</p>
              </div>
              <div class="mock-feature-card">
                <div class="feature-icon">ðŸŽ¨</div>
                <h4>Pixel-Perfect Themes</h4>
                <p>Match your brand colors and typography instantly.</p>
              </div>
              <div class="mock-feature-card">
                <div class="feature-icon">ðŸ“Š</div>
                <h4>Conversational Rules</h4>
                <p>Simulate, configure, and connect triggers easily.</p>
              </div>
            </section>
            
            <!-- Chatbot Widget will be dynamically injected here in #kartabot-widget-host -->
          </div>
        </div>
      </div>

      <!-- Tab Content: Captured Leads -->
      <div class="tab-content hidden" id="tab-leads">
        <div class="leads-dashboard">
          <div class="leads-control-bar">
            <div class="leads-search-filters">
              <div class="search-input-wrapper">
                <input type="text" id="leads-search-input" placeholder="Search leads by name, email, phone...">
              </div>
              <select id="leads-filter-select" class="filter-select">
                <option value="all">All Sources</option>
                <option value="price">Pricing Query</option>
                <option value="agent">Agent Request</option>
                <option value="webhook_failure">Webhook Failure</option>
              </select>
            </div>
            <button id="btn-export-leads" class="btn-export">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export CSV</span>
            </button>
          </div>
          
          <div class="leads-table-container" id="leads-table-container">
            <table class="leads-table" id="leads-table-element">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Bot Name</th>
                  <th>Trigger Source</th>
                  <th style="width: 80px; text-align: center;">Actions</th>
                </tr>
              </thead>
              <tbody id="leads-table-body">
                <!-- Leads will be injected here dynamically -->
              </tbody>
            </table>
          </div>

          <!-- Empty State (shown when no leads match) -->
          <div class="leads-empty-state" id="leads-empty-state" style="display: none;">
            <div class="empty-state-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3>No Leads Found</h3>
            <p>Leads captured when users ask for pricing, request an agent, or when webhooks fail will be displayed here.</p>
          </div>
        </div>
      </div>
    </main>
  </div>

  <script src="dashboard.js"></script>
</body>
</html>

``

## File: dashboard.css
``css
/* Reset and base dashboard styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --primary: #6366f1;
  --primary-glow: rgba(99, 102, 241, 0.15);
  --bg-dark: #090d16;
  --panel-bg: #111827;
  --border-color: #1f2937;
  --text-main: #f3f4f6;
  --text-muted: #9ca3af;
  --font-family: 'Outfit', sans-serif;
  --shadow-panel: 0 10px 30px rgba(0, 0, 0, 0.25);
  --radius-lg: 16px;
  --radius-md: 8px;
}

body {
  font-family: var(--font-family);
  background-color: var(--bg-dark);
  color: var(--text-main);
  min-height: 100vh;
  display: flex;
  overflow-x: hidden;
}

/* Dashboard Wrapper Layout */
.dashboard-wrapper {
  display: grid;
  grid-template-columns: 360px 1fr;
  width: 100%;
  height: 100vh;
}

@media (max-width: 1024px) {
  .dashboard-wrapper {
    grid-template-columns: 1fr;
    height: auto;
  }
  body {
    overflow-y: auto;
  }
}

/* Sidebar: Configuration */
.sidebar {
  background-color: var(--panel-bg);
  border-right: 1px solid var(--border-color);
  padding: 30px 24px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  overflow-y: auto;
  box-shadow: var(--shadow-panel);
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.logo-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--primary), #a855f7);
  box-shadow: 0 0 15px var(--primary-glow);
  position: relative;
}

.logo-icon::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  border: 2px solid #ffffff;
  border-radius: 50%;
}

.logo-text h1 {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.5px;
  line-height: 1.1;
  background: linear-gradient(to right, #ffffff, #e5e7eb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.logo-text span {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

/* Panel Sections */
.panel-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel-section h3 {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 13px;
  font-weight: 500;
  color: #d1d5db;
}

.input-group input[type="text"],
.input-group textarea,
.input-group select {
  background-color: #1f2937;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
}

.input-group input[type="text"]:focus,
.input-group textarea:focus,
.input-group select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-glow);
}

.input-group textarea {
  resize: vertical;
}

/* Color Picker and Presets */
.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #1f2937;
  border: 1px solid var(--border-color);
  padding: 8px 12px;
  border-radius: var(--radius-md);
}

.color-picker-wrapper input[type="color"] {
  -webkit-appearance: none;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  background: none;
}

.color-picker-wrapper input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-picker-wrapper input[type="color"]::-webkit-color-swatch {
  border: 1px solid var(--border-color);
  border-radius: 6px;
}

#color-hex-val {
  font-size: 14px;
  font-weight: 500;
  color: #e5e7eb;
}

.color-presets {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}

.preset-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-dot:hover {
  transform: scale(1.15);
}

.preset-dot.active {
  border-color: #ffffff;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
}

/* Theme Presets Selector Grid */
.theme-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.theme-btn {
  background-color: #1f2937;
  border: 1px solid var(--border-color);
  color: #d1d5db;
  padding: 10px;
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.theme-btn:hover {
  border-color: #4b5563;
  color: #ffffff;
}

.theme-btn.active {
  background-color: var(--primary);
  border-color: var(--primary);
  color: #ffffff;
  box-shadow: 0 4px 12px var(--primary-glow);
}

/* Embed Code Snippet Container */
.embed-code-section p {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
}

.code-container {
  position: relative;
  background-color: #0b0f19;
  border: 1px solid #1f2937;
  border-radius: var(--radius-md);
  padding: 14px;
  overflow: hidden;
  margin-top: 6px;
}

.code-container pre {
  margin: 0;
  overflow-x: auto;
  scrollbar-width: thin;
}

.code-container code {
  font-family: 'Courier New', Courier, monospace;
  font-size: 11px;
  color: #38bdf8;
  display: block;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}

#btn-copy-code {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: #1f2937;
  border: 1px solid #374151;
  color: #e5e7eb;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-family: var(--font-family);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

#btn-copy-code:hover {
  background-color: #374151;
  color: #ffffff;
}

#btn-copy-code.copied {
  background-color: #059669;
  border-color: #059669;
  color: #ffffff;
}

/* Main Preview Layout */
.main-preview-area {
  display: flex;
  flex-direction: column;
  padding: 30px 40px;
  height: 100vh;
  gap: 20px;
  overflow-y: auto;
}

@media (max-width: 1024px) {
  .main-preview-area {
    height: auto;
    padding: 24px;
  }
}

.preview-header h2 {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.preview-header p {
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 4px;
}

/* Browser Mockup Window */
.browser-mockup {
  flex: 1;
  background-color: #ffffff; /* White canvas representing client site */
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 550px;
  color: #1f2937; /* Reset text color for simulated client website */
}

/* Simulated browser control bar */
.browser-topbar {
  background-color: #1e293b;
  padding: 12px 18px;
  display: grid;
  grid-template-columns: 80px 1fr 80px;
  align-items: center;
  border-bottom: 1px solid #334155;
}

.browser-topbar .dots {
  display: flex;
  gap: 6px;
}

.browser-topbar .dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.dot-red { background-color: #ef4444; }
.dot-yellow { background-color: #f59e0b; }
.dot-green { background-color: #10b981; }

.address-bar {
  background-color: #0f172a;
  border-radius: 6px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 400;
  width: 100%;
  max-width: 450px;
  margin: 0 auto;
}

.lock-icon {
  color: #22c55e;
}

/* Simulated website canvas */
.browser-body {
  flex: 1;
  position: relative; /* CRITICAL for absolute widget nesting */
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Mock Nav */
.mock-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 30px;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}

.mock-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 16px;
  color: #0f172a;
}

.mock-logo-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #4f46e5;
}

.mock-links {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.mock-btn-nav {
  background-color: #0f172a;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-family);
}

/* Mock Hero */
.mock-hero {
  text-align: center;
  padding: 60px 40px 40px 40px;
  max-width: 650px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.hero-badge {
  background-color: #e0e7ff;
  color: #4f46e5;
  font-size: 11px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mock-hero h2 {
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.15;
  letter-spacing: -0.5px;
}

.mock-hero p {
  font-size: 15px;
  color: #475569;
  line-height: 1.6;
}

.hero-ctas {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.mock-btn-primary {
  background-color: #4f46e5;
  color: #ffffff;
  border: none;
  padding: 11px 22px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
  font-family: var(--font-family);
}

.mock-btn-outline {
  background-color: #ffffff;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 11px 22px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-family);
}

/* Mock Feature Grid */
.mock-features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 0 30px 40px 30px;
  max-width: 900px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .mock-features {
    grid-template-columns: 1fr;
    padding-bottom: 20px;
  }
}

.mock-feature-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 20px;
  border-radius: var(--radius-md);
  text-align: left;
}

.feature-icon {
  font-size: 20px;
  margin-bottom: 10px;
}

.mock-feature-card h4 {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 6px;
}

.mock-feature-card p {
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
}

/* Dashboard Tab System Styling */
.header-title-tabs {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 20px;
}

.header-text-group {
  display: flex;
  flex-direction: column;
}

.dashboard-tabs {
  display: flex;
  gap: 8px;
  background-color: var(--panel-bg);
  padding: 4px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  flex-shrink: 0;
}

.tab-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  padding: 8px 16px;
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-btn:hover {
  color: var(--text-main);
}

.tab-btn.active {
  background-color: var(--primary);
  color: #ffffff;
  box-shadow: 0 4px 10px var(--primary-glow);
}

.leads-count-badge {
  background-color: #ef4444;
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  display: inline-block;
}

.tab-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.tab-content.hidden {
  display: none !important;
}

/* Leads Dashboard Container */
.leads-dashboard {
  background-color: var(--panel-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: var(--shadow-panel);
  min-height: 480px;
}

.leads-control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.leads-search-filters {
  display: flex;
  gap: 12px;
  flex: 1;
  max-width: 600px;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
}

.search-input-wrapper input {
  width: 100%;
  background-color: #1f2937;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-size: 13px;
  outline: none;
  transition: all 0.2s ease;
}

.search-input-wrapper input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-glow);
}

.filter-select {
  background-color: #1f2937;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-size: 13px;
  outline: none;
  cursor: pointer;
}

.btn-export {
  background-color: #10b981;
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
  flex-shrink: 0;
}

.btn-export:hover {
  background-color: #059669;
  transform: translateY(-1px);
}

/* Leads Table */
.leads-table-container {
  overflow-x: auto;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: #111827;
}

.leads-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
}

.leads-table th {
  background-color: #1f2937;
  color: var(--text-muted);
  font-weight: 600;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-color);
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.5px;
}

.leads-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-main);
  vertical-align: middle;
}

.leads-table tr:hover td {
  background-color: rgba(255, 255, 255, 0.015);
}

.leads-table td a:hover {
  text-decoration: underline !important;
}

.lead-source-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
}

.lead-source-badge.price {
  background-color: rgba(99, 102, 241, 0.15);
  color: #818cf8;
}

.lead-source-badge.agent {
  background-color: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.lead-source-badge.webhook {
  background-color: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.btn-delete-lead {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.btn-delete-lead:hover {
  background-color: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

/* Empty State */
.leads-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px 20px;
  gap: 16px;
  background-color: #111827;
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-md);
}

.empty-state-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.02);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}

.leads-empty-state h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
  margin: 0;
}

.leads-empty-state p {
  font-size: 13px;
  color: var(--text-muted);
  max-width: 420px;
  line-height: 1.5;
  margin: 0;
}


``

## File: dashboard.js
``javascript
// DOM Elements
const botNameInput = document.getElementById('input-bot-name');
const avatarInput = document.getElementById('input-avatar');
const welcomeInput = document.getElementById('input-welcome');
const n8nUrlInput = document.getElementById('input-n8n-url');
const suggestionsInput = document.getElementById('input-suggestions');
const colorPicker = document.getElementById('input-color-picker');
const colorHexText = document.getElementById('color-hex-val');
const themeButtons = document.querySelectorAll('.theme-btn');
const presetDots = document.querySelectorAll('.preset-dot');
const positionSelect = document.getElementById('select-position');
const codeSnippetBlock = document.getElementById('snippet-code-block');
const copyCodeBtn = document.getElementById('btn-copy-code');
const widgetHost = document.getElementById('kartabot-widget-host');

// Leads Dashboard DOM Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const leadsBadge = document.getElementById('leads-badge');
const leadsSearchInput = document.getElementById('leads-search-input');
const leadsFilterSelect = document.getElementById('leads-filter-select');
const btnExportLeads = document.getElementById('btn-export-leads');
const leadsTableBody = document.getElementById('leads-table-body');
const leadsTableContainer = document.getElementById('leads-table-container');
const leadsEmptyState = document.getElementById('leads-empty-state');


// State Variables
let activeTheme = 'light';
let activeColor = '#6366f1';

// Initial Load
window.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  updateWidget();
  updateLeadsBadge();
});

// Setup Control Event Listeners
function setupEventListeners() {
  // Input changes
  botNameInput.addEventListener('input', debounce(updateWidget, 300));
  avatarInput.addEventListener('input', debounce(updateWidget, 300));
  welcomeInput.addEventListener('input', debounce(updateWidget, 300));
  n8nUrlInput.addEventListener('input', debounce(updateWidget, 300));
  suggestionsInput.addEventListener('input', debounce(updateWidget, 300));
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

  // Tab Switching
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      tabContents.forEach(content => {
        const id = content.getAttribute('id');
        if (id === `tab-${targetTab}`) {
          content.classList.remove('hidden');
        } else {
          content.classList.add('hidden');
        }
      });
      
      if (targetTab === 'leads') {
        renderLeadsTable();
      }
    });
  });

  // Leads Filters & Search
  if (leadsSearchInput) {
    leadsSearchInput.addEventListener('input', debounce(renderLeadsTable, 200));
  }
  if (leadsFilterSelect) {
    leadsFilterSelect.addEventListener('change', renderLeadsTable);
  }
  if (btnExportLeads) {
    btnExportLeads.addEventListener('click', exportLeadsToCSV);
  }
}

// Generate Embed Code Text
function generateSnippetText(config) {
  // Use the current origin where dashboard is served, falling back to a sample URL
  const scriptOrigin = window.location.origin.startsWith('http') 
    ? window.location.origin 
    : 'https://cdn.krutrimkarta.com';

  const n8nAttr = config.n8nUrl ? `\n  data-n8n-url="${escapeHtml(config.n8nUrl)}"` : '';
  const suggestionsAttr = config.suggestions ? `\n  data-suggestions="${escapeHtml(config.suggestions)}"` : '';
  const avatarAttr = config.avatar ? `\n  data-avatar="${escapeHtml(config.avatar)}"` : '';

  return `<!-- KartaBot Chatbot Widget Integration -->
<script
  src="${scriptOrigin}/widget.js"
  id="kartabot-widget-script"
  data-bot-name="${escapeHtml(config.botName)}"
  data-color="${config.color}"
  data-theme="${config.theme}"
  data-welcome="${escapeHtml(config.welcome)}"
  data-position="${config.position}"${avatarAttr}${n8nAttr}${suggestionsAttr}
  defer>
</script>`;
}

// Main Updater: Re-renders snippet and re-injects Widget Script into host
function updateWidget() {
  const config = {
    botName: botNameInput.value.trim() || 'KartaBot',
    avatar: avatarInput.value.trim(),
    welcome: welcomeInput.value.trim() || 'Hello! How can I help you today?',
    n8nUrl: n8nUrlInput.value.trim(),
    suggestions: suggestionsInput.value.trim(),
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
  if (config.avatar) {
    script.setAttribute('data-avatar', config.avatar);
  }
  if (config.n8nUrl) {
    script.setAttribute('data-n8n-url', config.n8nUrl);
  }
  if (config.suggestions) {
    script.setAttribute('data-suggestions', config.suggestions);
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

// --- Leads Dashboard Logic ---

// Listen to postMessage from the chatbot widget iframe
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'kartabot-lead-captured') {
    const newLead = event.data.lead;
    saveLead(newLead);
  }
});

let sessionLeads = [];

function getLeads() {
  return sessionLeads;
}

function saveLead(lead) {
  // Prevent duplicate lead save
  if (sessionLeads.some(l => l.id === lead.id)) return;
  
  sessionLeads.unshift(lead); // Put newest lead first
  
  updateLeadsBadge();
  
  // Re-render table if currently active
  const activeTab = document.querySelector('.tab-btn.active');
  if (activeTab && activeTab.getAttribute('data-tab') === 'leads') {
    renderLeadsTable();
  }
}

function deleteLead(id) {
  sessionLeads = sessionLeads.filter(l => l.id !== id);
  
  updateLeadsBadge();
  renderLeadsTable();
}

function updateLeadsBadge() {
  const leads = getLeads();
  if (leadsBadge) {
    if (leads.length > 0) {
      leadsBadge.textContent = leads.length;
      leadsBadge.style.display = 'inline-block';
    } else {
      leadsBadge.style.display = 'none';
    }
  }
}

function renderLeadsTable() {
  const leads = getLeads();
  const searchQuery = leadsSearchInput ? leadsSearchInput.value.toLowerCase().trim() : '';
  const filterSource = leadsFilterSelect ? leadsFilterSelect.value : 'all';
  
  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery) ||
      lead.email.toLowerCase().includes(searchQuery) ||
      lead.phone.toLowerCase().includes(searchQuery) ||
      (lead.botName && lead.botName.toLowerCase().includes(searchQuery));
      
    const matchesSource = filterSource === 'all' || lead.source === filterSource;
    
    return matchesSearch && matchesSource;
  });
  
  // Render
  if (!leadsTableBody) return;
  leadsTableBody.innerHTML = '';
  
  if (filteredLeads.length === 0) {
    leadsTableContainer.style.display = 'none';
    leadsEmptyState.style.display = 'flex';
  } else {
    leadsTableContainer.style.display = 'block';
    leadsEmptyState.style.display = 'none';
    
    filteredLeads.forEach(lead => {
      const tr = document.createElement('tr');
      
      const formattedDate = new Date(lead.timestamp).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      let sourceClass = 'price';
      let sourceText = 'Pricing Query';
      if (lead.source === 'agent') {
        sourceClass = 'agent';
        sourceText = 'Agent Request';
      } else if (lead.source === 'webhook_failure') {
        sourceClass = 'webhook';
        sourceText = 'Webhook Failure';
      }
      
      tr.innerHTML = `
        <td style="color: #9ca3af;">${formattedDate}</td>
        <td style="font-weight: 500; color: #ffffff;">${escapeHtml(lead.name)}</td>
        <td><a href="mailto:${escapeHtml(lead.email)}" style="color: var(--primary); text-decoration: none; font-weight: 500;">${escapeHtml(lead.email)}</a></td>
        <td style="color: #d1d5db;">${escapeHtml(lead.phone)}</td>
        <td style="color: #d1d5db;"><span style="background-color: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px; font-size: 11px;">${escapeHtml(lead.botName || 'KartaBot')}</span></td>
        <td><span class="lead-source-badge ${sourceClass}">${sourceText}</span></td>
        <td style="text-align: center;">
          <button class="btn-delete-lead" data-id="${lead.id}" title="Delete Lead">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </td>
      `;
      
      tr.querySelector('.btn-delete-lead').addEventListener('click', (e) => {
        const leadId = e.currentTarget.getAttribute('data-id');
        if (confirm("Are you sure you want to delete this lead?")) {
          deleteLead(leadId);
        }
      });
      
      leadsTableBody.appendChild(tr);
    });
  }
}

function exportLeadsToCSV() {
  const leads = getLeads();
  if (leads.length === 0) {
    alert("No leads available to export.");
    return;
  }
  
  const headers = ['Timestamp', 'Name', 'Email', 'Phone', 'Bot Name', 'Trigger Source'];
  const rows = leads.map(l => [
    l.timestamp,
    l.name,
    l.email,
    l.phone,
    l.botName || 'KartaBot',
    l.source
  ]);
  
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + "\n";
  
  rows.forEach(r => {
    csvContent += r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',') + "\n";
  });
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `kartabot_captured_leads_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


``

## File: widget.js
``javascript
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
  
  // Add cache-buster to prevent iframe page caching during edits
  queryParams.set('t', new Date().getTime());
  
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

``

## File: widget-ui.html
``html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chatbot UI</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="widget-ui.css">
</head>
<body>
  <div class="chat-container">
    <!-- Chat Header -->
    <header class="chat-header">
      <div class="bot-info">
        <div class="avatar-container">
          <div class="avatar-pulse"></div>
          <img id="bot-avatar" src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80" alt="Bot Avatar">
        </div>
        <div class="bot-status-details">
          <h2 id="bot-name-display">KartaBot</h2>
          <div class="status-indicator">
            <span class="dot"></span>
            <span class="status-text">Online</span>
          </div>
        </div>
      </div>
      <button id="close-chat" aria-label="Close chat">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </header>

    <!-- Chat Messages Area -->
    <main class="chat-messages" id="chat-messages-container">
      <div class="messages-list" id="messages-list">
        <!-- Messages will be injected here dynamically -->
      </div>
      
      <!-- Typing Indicator (hidden by default) -->
      <div class="typing-indicator" id="typing-indicator">
        <div class="typing-bubble">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </main>

    <!-- Chat Quick Suggestions -->
    <div class="quick-replies-container" id="quick-replies">
      <!-- Suggested buttons will be injected here dynamically -->
    </div>

    <!-- Chat Input Form -->
    <form class="chat-input-container" id="chat-form">
      <textarea 
        id="chat-input" 
        placeholder="Type a message..." 
        rows="1" 
        autocomplete="off" 
        required
      ></textarea>
      <button type="submit" id="send-button" aria-label="Send message">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </form>

    <!-- Branding Footer -->
    <footer class="chat-footer">
      <span>Powered by <a href="https://www.krutrimkarta.com" target="_blank" rel="noopener noreferrer">Krutrim Karta</a></span>
    </footer>
  </div>

  <script src="widget-ui.js"></script>
</body>
</html>

``

## File: widget-ui.css
``css
/* Base custom styles for Chatbot UI */
:root {
  --primary-color: #6366f1;
  --primary-hover: #4f46e5;
  --primary-rgb: 99, 102, 241;
  
  --font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Default Theme Variables (Light Theme) */
  --bg-color: #ffffff;
  --border-color: #f1f5f9;
  --header-bg: #ffffff;
  --header-border: #f1f5f9;
  --header-text: #0f172a;
  --body-text: #334155;
  --time-text: #94a3b8;
  
  --bubble-bot-bg: #f8fafc;
  --bubble-bot-text: #1e293b;
  --bubble-bot-border: #f1f5f9;
  
  --bubble-user-bg: var(--primary-color);
  --bubble-user-text: #ffffff;
  
  --input-bg: #f8fafc;
  --input-border: #e2e8f0;
  --input-text: #1e293b;
  
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

/* Dark Theme Variables */
[data-theme="dark"] {
  --bg-color: #0f172a;
  --border-color: #1e293b;
  --header-bg: #0f172a;
  --header-border: #1e293b;
  --header-text: #f8fafc;
  --body-text: #cbd5e1;
  --time-text: #64748b;
  
  --bubble-bot-bg: #1e293b;
  --bubble-bot-text: #f8fafc;
  --bubble-bot-border: #1e293b;
  
  --input-bg: #1e293b;
  --input-border: #334155;
  --input-text: #f8fafc;
}

/* Glassmorphism Theme Variables */
[data-theme="glass"] {
  --bg-color: rgba(255, 255, 255, 0.7);
  --border-color: rgba(255, 255, 255, 0.4);
  --header-bg: rgba(255, 255, 255, 0.85);
  --header-border: rgba(255, 255, 255, 0.4);
  --header-text: #0f172a;
  --body-text: #1e293b;
  --time-text: #64748b;
  
  --bubble-bot-bg: rgba(255, 255, 255, 0.9);
  --bubble-bot-text: #1e293b;
  --bubble-bot-border: rgba(255, 255, 255, 0.5);
  
  --input-bg: rgba(255, 255, 255, 0.6);
  --input-border: rgba(255, 255, 255, 0.4);
  --input-text: #1e293b;
  
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

[data-theme="glass-dark"] {
  --bg-color: rgba(15, 23, 42, 0.75);
  --border-color: rgba(255, 255, 255, 0.1);
  --header-bg: rgba(15, 23, 42, 0.85);
  --header-border: rgba(255, 255, 255, 0.1);
  --header-text: #f8fafc;
  --body-text: #cbd5e1;
  --time-text: #64748b;
  
  --bubble-bot-bg: rgba(30, 41, 59, 0.8);
  --bubble-bot-text: #f8fafc;
  --bubble-bot-border: rgba(255, 255, 255, 0.05);
  
  --input-bg: rgba(30, 41, 59, 0.6);
  --input-border: rgba(255, 255, 255, 0.1);
  --input-text: #f8fafc;
  
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* Global Reset & Container */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body, html {
  font-family: var(--font-family);
  background-color: transparent;
  color: var(--body-text);
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 0; /* Handled by embed script's iframe container */
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  position: relative;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

/* Header */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: var(--header-bg);
  border-bottom: 1px solid var(--header-border);
  z-index: 10;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.bot-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-container {
  position: relative;
  width: 40px;
  height: 40px;
}

.avatar-container img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-color);
}

.avatar-pulse {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--primary-color);
  opacity: 0.15;
  animation: pulse 2s infinite ease-in-out;
  pointer-events: none;
}

.bot-status-details h2 {
  font-size: 16px;
  font-weight: 600;
  color: var(--header-text);
  line-height: 1.2;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 2px;
}

.status-indicator .dot {
  width: 6px;
  height: 6px;
  background-color: #22c55e;
  border-radius: 50%;
}

.status-indicator .status-text {
  font-size: 11px;
  color: var(--time-text);
  font-weight: 400;
}

#close-chat {
  background: none;
  border: none;
  color: var(--time-text);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease, color 0.2s ease;
}

#close-chat:hover {
  background-color: var(--border-color);
  color: var(--header-text);
}

/* Chat Messages */
.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
  display: flex;
  flex-direction: column;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background-color: rgba(var(--primary-rgb), 0.15);
  border-radius: 10px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background-color: rgba(var(--primary-rgb), 0.3);
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 8px;
}

/* Message Bubble Styling */
.message {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  max-width: 85%;
  animation: messageFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
  transform: translateY(10px);
}

.message.bot {
  align-self: flex-start;
}

.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
  max-width: 80%;
}

.message-avatar-small {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid var(--border-color);
}

.message-bubble-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.message.bot .message-bubble {
  background-color: var(--bubble-bot-bg);
  color: var(--bubble-bot-text);
  border: 1px solid var(--bubble-bot-border);
  border-bottom-left-radius: 4px;
}

.message.user .message-bubble {
  background-color: var(--bubble-user-bg);
  color: var(--bubble-user-text);
  border-bottom-right-radius: 4px;
}

.message-time {
  font-size: 10px;
  color: var(--time-text);
  margin: 0 4px;
}

.message.user .message-time {
  text-align: right;
}

/* Message formatted links */
.message-bubble a {
  color: inherit;
  text-decoration: underline;
  font-weight: 500;
}

/* Typing Indicator */
.typing-indicator {
  display: none;
  align-self: flex-start;
  margin-left: 36px;
  margin-top: 4px;
  margin-bottom: 8px;
}

.typing-bubble {
  background-color: var(--bubble-bot-bg);
  border: 1px solid var(--bubble-bot-border);
  padding: 10px 16px;
  border-radius: 18px;
  border-bottom-left-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.typing-bubble span {
  width: 6px;
  height: 6px;
  background-color: var(--time-text);
  border-radius: 50%;
  display: inline-block;
  animation: typingBounce 1.4s infinite ease-in-out both;
}

.typing-bubble span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-bubble span:nth-child(2) {
  animation-delay: -0.16s;
}

/* Quick Replies */
.quick-replies-container {
  display: flex;
  gap: 8px;
  padding: 8px 20px;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none; /* Hide scrollbar for cleaner horizontal scrolling */
}

.quick-replies-container::-webkit-scrollbar {
  display: none;
}

.quick-reply-btn {
  background-color: var(--bg-color);
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-family: var(--font-family);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.quick-reply-btn:hover {
  background-color: var(--primary-color);
  color: #ffffff;
  box-shadow: 0 4px 10px rgba(var(--primary-rgb), 0.15);
  transform: translateY(-1px);
}

/* Input Area */
.chat-input-container {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid var(--border-color);
  background-color: var(--header-bg);
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

.chat-input-container textarea {
  flex: 1;
  background-color: var(--input-bg);
  border: 1px solid var(--input-border);
  color: var(--input-text);
  border-radius: 20px;
  padding: 10px 16px;
  font-size: 14px;
  font-family: var(--font-family);
  resize: none;
  outline: none;
  max-height: 100px;
  line-height: 1.4;
  transition: all 0.2s ease;
}

.chat-input-container textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
  background-color: var(--bg-color);
}

#send-button {
  background-color: var(--primary-color);
  color: #ffffff;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

#send-button:hover {
  background-color: var(--primary-hover);
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(var(--primary-rgb), 0.2);
}

#send-button:disabled {
  background-color: var(--time-text);
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Footer / Branding */
.chat-footer {
  padding: 6px;
  text-align: center;
  font-size: 10px;
  color: var(--time-text);
  background-color: var(--header-bg);
  border-top: 1px solid var(--border-color);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.chat-footer a {
  color: var(--time-text);
  text-decoration: none;
  font-weight: 500;
}

.chat-footer a:hover {
  text-decoration: underline;
  color: var(--primary-color);
}

/* Keyframe Animations */
@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.15;
  }
  50% {
    transform: scale(1.08);
    opacity: 0.35;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.15;
  }
}

@keyframes messageFadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes typingBounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.3;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Lead Form Card styling */
.lead-form-card {
  background: var(--bubble-bot-bg);
  border: 1px solid var(--bubble-bot-border);
  border-radius: 16px;
  padding: 16px;
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 100%;
  box-shadow: var(--shadow-sm);
  animation: messageFadeIn 0.3s ease-out;
  box-sizing: border-box;
}

.lead-form-card h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--header-text);
  margin-bottom: 2px;
}

.lead-form-card p {
  font-size: 12px;
  color: var(--time-text);
  line-height: 1.4;
}

.lead-input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.lead-input-group label {
  font-size: 11px;
  color: var(--time-text);
  margin-bottom: 2px;
  font-weight: 500;
  display: block;
  text-align: left;
}

.lead-input-group input {
  background-color: var(--input-bg);
  border: 1px solid var(--input-border);
  color: var(--input-text);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-family: var(--font-family);
  outline: none;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;
}

.lead-input-group input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
  background-color: var(--bg-color);
}

.lead-submit-btn {
  background-color: var(--primary-color);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 10px;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-family);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  width: 100%;
}

.lead-submit-btn:hover {
  background-color: var(--primary-hover);
  box-shadow: 0 4px 10px rgba(var(--primary-rgb), 0.15);
}

.lead-submit-btn:disabled {
  background-color: var(--time-text);
  opacity: 0.6;
  cursor: not-allowed;
}

/* Success state inside Lead Form Card */
.lead-success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 10px 0;
  gap: 8px;
  animation: messageFadeIn 0.3s ease-out;
}

.lead-success-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.lead-success-state p {
  font-size: 13px;
  font-weight: 500;
  color: var(--body-text);
  margin: 0;
}

/* Gemstone Grid & Cards */
.gemstone-grid {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  width: 100%;
  padding: 6px 2px;
  margin-top: 14px;
  scrollbar-width: none; /* Hide scrollbar for Firefox */
  box-sizing: border-box;
}

.gemstone-grid::-webkit-scrollbar {
  display: none; /* Hide scrollbar for Chrome/Safari */
}

/* Buy Now button styling */
.gemstone-buy-btn {
  display: block;
  width: 100%;
  text-align: center;
  background-color: #6c7a47; /* Mossy green from screenshot */
  color: #ffffff !important;
  text-decoration: none !important;
  font-size: 11px;
  font-weight: 600;
  padding: 8px 0;
  border-radius: 6px;
  transition: all 0.2s ease;
  margin-top: auto;
  box-sizing: border-box;
}

.gemstone-buy-btn:hover {
  background-color: #556234;
  transform: translateY(-1px);
}


``

## File: widget-ui.js
``javascript
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
    "How do I embed this widget?"
  ];
};

const config = {
  botName: urlParams.get('botName') || 'KartaBot',
  color: urlParams.get('color') || '#6366f1',
  theme: urlParams.get('theme') || 'light',
  welcomeMessage: urlParams.get('welcome') || 'Hello! How can I help you today?',
  avatarUrl: urlParams.get('avatar') || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
  n8nUrl: urlParams.get('n8nUrl') || 'https://n8n.srv1175271.hstgr.cloud/webhook/VelBot',
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
  
  let shouldCaptureLead = null;
  let shouldRecommendGemstone = false;
  if (isGemstoneQuery) {
    shouldRecommendGemstone = true;
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
        message: userMessage,
        botName: config.botName,
        sessionId: getSessionId(),
        timestamp: new Date().toISOString()
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

      // Capture lead or trigger gemstone recommendation form if detected
      if (shouldRecommendGemstone) {
        setTimeout(() => {
          renderGemstoneFormCard();
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
      addMessage("âš ï¸ **Connection Error**: I could not reach my backend server. Please verify your Webhook URL and ensure that CORS is enabled.", 'bot');
      
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

      // Capture lead or trigger gemstone recommendation form if detected
      if (shouldRecommendGemstone) {
        setTimeout(() => {
          renderGemstoneFormCard();
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
    return `We offer simple, transparent pricing plans starting at **$0/month** for developers!\n\nâ€¢ **Starter**: Free (up to 1,000 messages/mo)\nâ€¢ **Pro**: $19/mo (up to 50,000 messages/mo + AI models)\nâ€¢ **Enterprise**: Custom (dedicated support, unlimited volume)\n\nWould you like a link to our [Pricing Page](#pricing)?`;
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
  
  if (contains(text, ['thank', 'awesome', 'cool', 'great'])) {
    return `You're very welcome! Let me know if there's anything else I can do for you. ðŸ˜Š`;
  }
  
  // Default Catch-all
  return `I'm not sure I fully understand that. I am a customizable chatbot template powered by **Krutrim Karta**. Try asking me about my **features**, **pricing**, or **how to embed** this widget on your website!`;
}

// Generate contextual quick suggestion questions
function getSuggestedQuestions(lastUserMessage) {
  // Check if suggestions have been customized by the user
  const defaultSuggestions = [
    "What are your features?",
    "Tell me about pricing",
    "How do I embed this widget?"
  ];
  const isCustomized = JSON.stringify(config.quickReplies.map(s => s.trim())) !== JSON.stringify(defaultSuggestions);
  
  if (isCustomized) {
    return config.quickReplies;
  }

  const text = lastUserMessage.toLowerCase();
  if (contains(text, ['hi', 'hello', 'hey'])) {
    return ["What are your features?", "Tell me about pricing"];
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
        <h4>ðŸ“© Share Your Details</h4>
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
          timestamp: new Date().toISOString()
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
        <h4>ðŸ’Ž Gemstone Recommendation</h4>
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
          timestamp: new Date().toISOString()
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
        errorEl.textContent = "âš ï¸ Submission failed. Please check connection and try again.";
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


``
