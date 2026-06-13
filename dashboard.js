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

