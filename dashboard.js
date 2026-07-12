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
let supabaseClient = null;
let isSupabaseConnected = false;
let projectsList = [];
let activeProject = null;
let activeVersionList = [];
let selectedVersion = null;

// Local fallback defaults
const LOCAL_PROJECTS_KEY = 'kartabot_local_projects';
const ACTIVE_PROJECT_ID_KEY = 'kartabot_active_project_id';
const SUPABASE_CONFIG_KEY = 'kartabot_supabase_config';
const LOCAL_PROJECT_VERSIONS_KEY = 'kartabot_local_project_versions';

const defaultProject = {
  id: 'local-default',
  name: 'Default Client (Local)',
  bot_name: 'KartaBot',
  avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
  welcome_message: 'Hello! Welcome to our website. How can I help you today? 😊',
  n8n_url: 'https://n8n.srv1175271.hstgr.cloud/webhook/VelBot',
  suggestions: 'What are your features?, Tell me about pricing, How do I embed this widget?',
  theme: 'light',
  color: '#6366f1',
  position: 'right'
};

// Initial Load
window.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  setupModalEvents();
  setupVersionHistoryEvents();
  setupWikiNavigation();
  setupDashboardActions();
  await initDatabase();
  await loadProjects();
  updateLeadsBadge();
});

// Setup Control Event Listeners
function setupEventListeners() {
  // Input changes
  botNameInput.addEventListener('input', debounce(handleInputChange, 300));
  avatarInput.addEventListener('input', debounce(handleInputChange, 300));
  welcomeInput.addEventListener('input', debounce(handleInputChange, 300));
  n8nUrlInput.addEventListener('input', debounce(handleInputChange, 300));
  suggestionsInput.addEventListener('input', debounce(handleInputChange, 300));
  positionSelect.addEventListener('change', handleInputChange);

  // Color picker change
  colorPicker.addEventListener('input', (e) => {
    activeColor = e.target.value;
    colorHexText.textContent = activeColor.toUpperCase();
    
    // De-activate all presets unless it matches exactly
    presetDots.forEach(dot => {
      const dotColor = dot.getAttribute('data-color');
      dot.classList.toggle('active', dotColor.toLowerCase() === activeColor.toLowerCase());
    });
    
    handleInputChange();
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
      
      handleInputChange();
    });
  });

  // Theme presets selection
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      themeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      activeTheme = btn.getAttribute('data-theme');
      handleInputChange();
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
      } else if (targetTab === 'projects') {
        renderProjectsGrid();
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
  // Resolve base path including subfolders (handles GitHub Pages paths like /kkchatbot/)
  const currentPath = window.location.pathname;
  const subfolder = currentPath.substring(0, currentPath.lastIndexOf('/'));
  const scriptOrigin = window.location.origin.startsWith('http') 
    ? (window.location.origin + subfolder) 
    : 'https://risha9177719594.github.io/kkchatbot';

  if (isSupabaseConnected && activeProject) {
    const isLocal = String(activeProject.id).startsWith('local-');
    if (!isLocal) {
      // Dynamic config script snippet
      return `<!-- KartaBot Chatbot Widget Integration (Dynamic Cloud Sync) -->
<script
  src="${scriptOrigin}/widget.js"
  id="kartabot-widget-script"
  data-project-id="${activeProject.id}"
  data-api-url="https://api.krutrimkarta.com/chat"
  defer>
</script>`;
    }
  }

  const n8nAttr = config.n8nUrl ? `\n  data-n8n-url="${escapeHtml(config.n8nUrl)}"` : '';
  const suggestionsAttr = config.suggestions ? `\n  data-suggestions="${escapeHtml(config.suggestions)}"` : '';
  const avatarAttr = config.avatar ? `\n  data-avatar="${escapeHtml(config.avatar)}"` : '';

  return `<!-- KartaBot Chatbot Widget Integration (Local Static Mode) -->
<!-- Connect Supabase in settings to get dynamic cloud-synced script -->
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

const debouncedSave = debounce(saveActiveProject, 1000);

function handleInputChange() {
  updateWidget();
  debouncedSave();
}

async function initDatabase() {
  const savedConfig = localStorage.getItem(SUPABASE_CONFIG_KEY);
  if (savedConfig) {
    try {
      const config = JSON.parse(savedConfig);
      if (config.url && config.key) {
        if (window.supabase) {
          supabaseClient = window.supabase.createClient(config.url, config.key);
          const { data, error } = await supabaseClient
            .from('kartabot_projects')
            .select('id')
            .limit(1);
          
          if (!error) {
            isSupabaseConnected = true;
            setSyncStatus('online');
            return;
          }
          console.warn('Supabase test query failed, falling back to local mode:', error);
        } else {
          console.error('Supabase library not loaded in window object');
        }
      }
    } catch (e) {
      console.error('Error parsing Supabase configuration:', e);
    }
  }
  isSupabaseConnected = false;
  supabaseClient = null;
  setSyncStatus('offline');
}

async function loadProjects() {
  if (isSupabaseConnected && supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('kartabot_projects')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      projectsList = data || [];
    } catch (e) {
      console.error('Error loading projects from Supabase:', e);
      setSyncStatus('error');
      loadLocalProjects();
    }
  } else {
    loadLocalProjects();
  }

  if (projectsList.length === 0) {
    if (!isSupabaseConnected) {
      projectsList = [JSON.parse(JSON.stringify(defaultProject))];
      saveLocalProjects();
    }
  }

  const savedActiveId = localStorage.getItem(ACTIVE_PROJECT_ID_KEY);
  let projectToSelect = projectsList.find(p => p.id === savedActiveId);
  if (!projectToSelect && projectsList.length > 0) {
    projectToSelect = projectsList[0];
  }

  if (projectToSelect) {
    selectProject(projectToSelect.id);
  } else {
    clearFormFields();
    renderProjectsSelector();
    renderProjectsGrid();
  }
}

function loadLocalProjects() {
  const localData = localStorage.getItem(LOCAL_PROJECTS_KEY);
  if (localData) {
    try {
      projectsList = JSON.parse(localData);
    } catch (e) {
      console.error('Error parsing local projects:', e);
      projectsList = [];
    }
  } else {
    projectsList = [];
  }
}

function saveLocalProjects() {
  localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(projectsList));
}

function selectProject(projectId) {
  const project = projectsList.find(p => p.id === projectId);
  if (!project) return;

  activeProject = project;
  localStorage.setItem(ACTIVE_PROJECT_ID_KEY, projectId);

  botNameInput.value = project.bot_name || '';
  avatarInput.value = project.avatar_url || '';
  welcomeInput.value = project.welcome_message || '';
  n8nUrlInput.value = project.n8n_url || '';
  suggestionsInput.value = project.suggestions || '';
  positionSelect.value = project.position || 'right';

  activeTheme = project.theme || 'light';
  themeButtons.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-theme') === activeTheme);
  });

  activeColor = project.color || '#6366f1';
  colorPicker.value = activeColor;
  colorHexText.textContent = activeColor.toUpperCase();
  
  presetDots.forEach(dot => {
    const dotColor = dot.getAttribute('data-color');
    dot.classList.toggle('active', dotColor.toLowerCase() === activeColor.toLowerCase());
  });

  renderProjectsSelector();
  updateWidget();

  const activeTab = document.querySelector('.tab-btn.active');
  if (activeTab && activeTab.getAttribute('data-tab') === 'projects') {
    renderProjectsGrid();
  }
}

async function saveActiveProject() {
  if (!activeProject) return;

  setSyncStatus('saving');

  // Keep a copy of the previous state for Local Mode version logging
  const oldActiveConfig = isSupabaseConnected ? null : JSON.parse(JSON.stringify(activeProject));

  activeProject.bot_name = botNameInput.value.trim() || 'KartaBot';
  activeProject.avatar_url = avatarInput.value.trim();
  activeProject.welcome_message = welcomeInput.value.trim() || 'Hello! How can I help you today?';
  activeProject.n8n_url = n8nUrlInput.value.trim();
  activeProject.suggestions = suggestionsInput.value.trim();
  activeProject.color = activeColor;
  activeProject.theme = activeTheme;
  activeProject.position = positionSelect.value;

  try {
    if (isSupabaseConnected && supabaseClient) {
      const { error } = await supabaseClient
        .from('kartabot_projects')
        .upsert({
          id: activeProject.id,
          name: activeProject.name,
          bot_name: activeProject.bot_name,
          avatar_url: activeProject.avatar_url,
          welcome_message: activeProject.welcome_message,
          n8n_url: activeProject.n8n_url,
          suggestions: activeProject.suggestions,
          theme: activeProject.theme,
          color: activeProject.color,
          position: activeProject.position,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setSyncStatus('saved');
    } else {
      const idx = projectsList.findIndex(p => p.id === activeProject.id);
      if (idx !== -1) {
        logLocalProjectVersion(oldActiveConfig, activeProject);
        projectsList[idx] = { ...activeProject };
      } else {
        projectsList.push({ ...activeProject });
      }
      saveLocalProjects();
      setSyncStatus('offline');
    }

    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab && activeTab.getAttribute('data-tab') === 'projects') {
      renderProjectsGrid();
    }
  } catch (err) {
    console.error('Error saving project:', err);
    setSyncStatus('error');
  }
}

async function createNewProjectPrompt() {
  const name = prompt("Enter a unique Client or Project name (e.g. 'vel gems'):");
  if (!name || !name.trim()) return;

  const trimmedName = name.trim();
  
  if (projectsList.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
    alert("A project with this name already exists.");
    return;
  }

  const newProj = {
    name: trimmedName,
    bot_name: trimmedName + ' Bot',
    avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    welcome_message: `Hello! Welcome to ${trimmedName}. How can I help you today? 😊`,
    n8n_url: '',
    suggestions: 'What are your services?, Contact info, Tell me about pricing',
    theme: 'light',
    color: '#6366f1',
    position: 'right'
  };

  if (!isSupabaseConnected) {
    newProj.id = 'local-' + Date.now();
  }

  setSyncStatus('saving');

  try {
    if (isSupabaseConnected && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('kartabot_projects')
        .insert(newProj)
        .select();

      if (error) throw error;
      
      const createdProject = data[0];
      projectsList.push(createdProject);
      projectsList.sort((a, b) => a.name.localeCompare(b.name));
      selectProject(createdProject.id);
      setSyncStatus('saved');
    } else {
      projectsList.push(newProj);
      projectsList.sort((a, b) => a.name.localeCompare(b.name));
      saveLocalProjects();
      selectProject(newProj.id);
      setSyncStatus('offline');
    }
  } catch (err) {
    console.error('Error creating project:', err);
    alert('Failed to create project in database: ' + err.message);
    setSyncStatus('error');
  }
}

async function deleteProject(projectId) {
  const project = projectsList.find(p => p.id === projectId);
  if (!project) return;

  if (!confirm(`Are you sure you want to delete the project "${project.name}"? This action cannot be undone.`)) {
    return;
  }

  setSyncStatus('saving');

  try {
    if (isSupabaseConnected && supabaseClient) {
      const { error } = await supabaseClient
        .from('kartabot_projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      setSyncStatus('saved');
    }

    projectsList = projectsList.filter(p => p.id !== projectId);
    if (!isSupabaseConnected) {
      saveLocalProjects();
    }

    if (activeProject && activeProject.id === projectId) {
      activeProject = null;
      if (projectsList.length > 0) {
        selectProject(projectsList[0].id);
      } else {
        clearFormFields();
        localStorage.removeItem(ACTIVE_PROJECT_ID_KEY);
        renderProjectsSelector();
      }
    } else {
      renderProjectsSelector();
    }

    renderProjectsGrid();

  } catch (err) {
    console.error('Error deleting project:', err);
    alert('Failed to delete project: ' + err.message);
    setSyncStatus('error');
  }
}

function renderProjectsSelector() {
  const selectEl = document.getElementById('select-project');
  if (!selectEl) return;

  selectEl.innerHTML = '';
  
  projectsList.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    if (activeProject && activeProject.id === p.id) {
      opt.selected = true;
    }
    selectEl.appendChild(opt);
  });

  const separator = document.createElement('option');
  separator.disabled = true;
  separator.textContent = '────────────────';
  selectEl.appendChild(separator);

  const optNew = document.createElement('option');
  optNew.value = '__new_project__';
  optNew.textContent = '+ Create New Project...';
  selectEl.appendChild(optNew);
}

function renderProjectsGrid() {
  const gridEl = document.getElementById('projects-grid');
  const emptyStateEl = document.getElementById('projects-empty-state');
  if (!gridEl || !emptyStateEl) return;

  if (projectsList.length === 0) {
    gridEl.innerHTML = '';
    gridEl.style.display = 'none';
    emptyStateEl.style.display = 'flex';
    
    const emptyDesc = document.getElementById('projects-empty-desc');
    if (emptyDesc) {
      emptyDesc.textContent = isSupabaseConnected
        ? "No client projects exist in your database yet. Click the button below to add your first client!"
        : "Connect to Supabase to store client configurations in a database, or create local projects in your browser's storage.";
    }
    return;
  }

  gridEl.style.display = 'grid';
  emptyStateEl.style.display = 'none';
  gridEl.innerHTML = '';

  projectsList.forEach(p => {
    const isCurrent = activeProject && activeProject.id === p.id;
    const card = document.createElement('div');
    card.className = `project-card ${isCurrent ? 'active-card' : ''}`;
    
    card.innerHTML = `
      <div class="project-card-header">
        <h4 class="project-card-title" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</h4>
        ${isCurrent ? '<span class="active-badge">Active</span>' : ''}
      </div>
      <div class="project-card-body">
        <div class="project-card-detail-item">
          <span>Bot Name:</span>
          <span class="val">${escapeHtml(p.bot_name || 'KartaBot')}</span>
        </div>
        <div class="project-card-detail-item">
          <span>Theme:</span>
          <span class="val" style="text-transform: capitalize;">${escapeHtml(p.theme || 'light')}</span>
        </div>
        <div class="project-card-detail-item">
          <span>Accent Color:</span>
          <span style="display: flex; align-items: center; gap: 6px;">
            <span class="color-dot" style="background-color: ${p.color || '#6366f1'};"></span>
            <code style="font-size: 11px;">${(p.color || '#6366f1').toUpperCase()}</code>
          </span>
        </div>
      </div>
      <div class="project-card-actions">
        <button class="btn-card-select" data-id="${p.id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Configure</span>
        </button>
        <button class="btn-card-delete" data-id="${p.id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    `;

    card.querySelector('.btn-card-select').addEventListener('click', () => {
      selectProject(p.id);
      const previewTabBtn = document.querySelector('.tab-btn[data-tab="preview"]');
      if (previewTabBtn) previewTabBtn.click();
    });

    card.querySelector('.btn-card-delete').addEventListener('click', () => {
      deleteProject(p.id);
    });

    gridEl.appendChild(card);
  });
}

function setSyncStatus(status) {
  const dot = document.getElementById('sync-status-dot');
  const text = document.getElementById('sync-status-text');
  if (!dot || !text) return;

  dot.className = 'sync-dot';

  switch(status) {
    case 'saving':
      dot.classList.add('syncing');
      text.textContent = 'Saving changes...';
      break;
    case 'saved':
      dot.classList.add('online');
      text.textContent = 'Saved to Cloud';
      break;
    case 'online':
      dot.classList.add('online');
      text.textContent = 'Supabase Connected';
      break;
    case 'offline':
      dot.classList.add('offline');
      text.textContent = 'Local Mode';
      break;
    case 'error':
      dot.classList.add('error');
      text.textContent = 'Sync Error';
      break;
  }
}

function clearFormFields() {
  botNameInput.value = '';
  avatarInput.value = '';
  welcomeInput.value = '';
  n8nUrlInput.value = '';
  suggestionsInput.value = '';
  positionSelect.value = 'right';
  activeColor = '#6366f1';
  activeTheme = 'light';
  const existingContainer = widgetHost.querySelector('.kartabot-widget-container');
  if (existingContainer) existingContainer.remove();
}

function setupModalEvents() {
  const modal = document.getElementById('supabase-modal');
  const btnSettings = document.getElementById('btn-db-settings');
  const btnClose = document.getElementById('btn-close-modal');
  const btnSave = document.getElementById('btn-save-sb-settings');
  const btnClear = document.getElementById('btn-clear-sb-settings');
  const btnCopySql = document.getElementById('btn-copy-sql');
  const inputUrl = document.getElementById('input-sb-url');
  const inputKey = document.getElementById('input-sb-key');

  if (!modal) return;

  const openModal = () => {
    const savedConfig = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        inputUrl.value = config.url || '';
        inputKey.value = config.key || '';
      } catch (e) {}
    } else {
      inputUrl.value = '';
      inputKey.value = '';
    }
    modal.style.display = 'flex';
  };

  const closeModal = () => {
    modal.style.display = 'none';
  };

  btnSettings.addEventListener('click', openModal);
  btnClose.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  btnSave.addEventListener('click', async () => {
    const url = inputUrl.value.trim();
    const key = inputKey.value.trim();

    if (!url || !key) {
      alert("Please fill in both the Supabase Project URL and Anon Key.");
      return;
    }

    btnSave.textContent = 'Connecting...';
    btnSave.disabled = true;

    try {
      if (!window.supabase) {
        throw new Error("Supabase library not loaded. Check internet connection.");
      }
      const testClient = window.supabase.createClient(url, key);
      const { error } = await testClient
        .from('kartabot_projects')
        .select('id')
        .limit(1);

      if (error) {
        throw new Error("Connected but database query failed. Check if table 'kartabot_projects' exists. Details: " + error.message);
      }

      localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify({ url, key }));
      
      supabaseClient = testClient;
      isSupabaseConnected = true;
      setSyncStatus('online');

      await loadProjects();
      closeModal();
      alert("Successfully connected to Supabase!");

    } catch (e) {
      console.error(e);
      alert("Connection failed: " + e.message);
    } finally {
      btnSave.textContent = 'Save & Connect';
      btnSave.disabled = false;
    }
  });

  btnClear.addEventListener('click', async () => {
    if (confirm("Are you sure you want to disconnect from Supabase and revert to LocalStorage mode?")) {
      localStorage.removeItem(SUPABASE_CONFIG_KEY);
      supabaseClient = null;
      isSupabaseConnected = false;
      setSyncStatus('offline');
      closeModal();
      await loadProjects();
      alert("Disconnected from Supabase. Switched to Local Mode.");
    }
  });

  btnCopySql.addEventListener('click', () => {
    const sqlCode = document.getElementById('sql-code-block').textContent;
    navigator.clipboard.writeText(sqlCode).then(() => {
      const sqlTextSpan = btnCopySql.querySelector('.btn-sql-text') || btnCopySql;
      sqlTextSpan.textContent = 'Copied!';
      btnCopySql.classList.add('copied');
      setTimeout(() => {
        sqlTextSpan.textContent = 'Copy SQL';
        btnCopySql.classList.remove('copied');
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      alert('Failed to copy SQL script to clipboard.');
    });
  });
}

function setupDashboardActions() {
  const inlineNewProjBtn = document.getElementById('btn-new-project-inline');
  const newProjBtn = document.getElementById('btn-create-project');
  const emptyNewProjBtn = document.getElementById('btn-create-project-empty');
  const emptyConnectSbBtn = document.getElementById('btn-connect-supabase-empty');
  const projectSelectEl = document.getElementById('select-project');

  if (inlineNewProjBtn) {
    inlineNewProjBtn.addEventListener('click', createNewProjectPrompt);
  }
  if (newProjBtn) {
    newProjBtn.addEventListener('click', createNewProjectPrompt);
  }
  if (emptyNewProjBtn) {
    emptyNewProjBtn.addEventListener('click', createNewProjectPrompt);
  }
  if (emptyConnectSbBtn) {
    emptyConnectSbBtn.addEventListener('click', () => {
      const btnDb = document.getElementById('btn-db-settings');
      if (btnDb) btnDb.click();
    });
  }

  if (projectSelectEl) {
    projectSelectEl.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === '__new_project__') {
        createNewProjectPrompt();
      } else {
        selectProject(val);
      }
    });
  }
}

// Log a local version snapshot on config edit if > 60s since last snapshot
function logLocalProjectVersion(oldProj, newProj) {
  if (!oldProj) return;

  const oldConf = {
    bot_name: oldProj.bot_name,
    avatar_url: oldProj.avatar_url,
    welcome_message: oldProj.welcome_message,
    n8n_url: oldProj.n8n_url,
    suggestions: oldProj.suggestions,
    theme: oldProj.theme,
    color: oldProj.color,
    position: oldProj.position
  };

  const newConf = {
    bot_name: newProj.bot_name,
    avatar_url: newProj.avatar_url,
    welcome_message: newProj.welcome_message,
    n8n_url: newProj.n8n_url,
    suggestions: newProj.suggestions,
    theme: newProj.theme,
    color: newProj.color,
    position: newProj.position
  };

  // Check if configuration fields actually differ
  const hasChanges = Object.keys(oldConf).some(key => oldConf[key] !== newConf[key]);
  if (!hasChanges) return;

  const storageKey = `${LOCAL_PROJECT_VERSIONS_KEY}_${oldProj.id}`;
  let versions = [];
  try {
    const data = localStorage.getItem(storageKey);
    versions = data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading local versions:', e);
  }

  const lastVersion = versions[0]; // Newest is at index 0
  const now = Date.now();
  const lastTime = lastVersion ? new Date(lastVersion.created_at).getTime() : 0;

  // Coalesce: Only write version if > 60s since the last snapshot
  if (!lastVersion || (now - lastTime > 60000)) {
    const nextVer = lastVersion ? lastVersion.version_number + 1 : 1;
    const newVersionLog = {
      id: 'local-ver-' + now,
      project_id: oldProj.id,
      version_number: nextVer,
      config: oldConf,
      created_at: new Date().toISOString()
    };

    versions.unshift(newVersionLog); // Add to beginning (newest first)

    // Keep only most recent 5 versions
    if (versions.length > 5) {
      versions = versions.slice(0, 5);
    }

    localStorage.setItem(storageKey, JSON.stringify(versions));
  }
}

// Fetch and open Version History Modal
async function openVersionHistoryModal() {
  if (!activeProject) {
    alert("Please select a project first.");
    return;
  }

  document.getElementById('history-project-name').textContent = activeProject.name;
  
  // Clear details panel
  document.getElementById('version-details-empty-state').style.display = 'flex';
  document.getElementById('version-details-content-panel').style.display = 'none';

  // Load versions list
  const container = document.getElementById('versions-list-container');
  container.innerHTML = '<p class="modal-desc" style="text-align: center; padding: 20px 0;">Loading history...</p>';

  document.getElementById('version-history-modal').style.display = 'flex';

  try {
    if (isSupabaseConnected && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('project_config_versions')
        .select('*')
        .eq('project_id', activeProject.id)
        .order('version_number', { ascending: false });

      if (error) throw error;
      activeVersionList = data || [];
    } else {
      const storageKey = `${LOCAL_PROJECT_VERSIONS_KEY}_${activeProject.id}`;
      const localData = localStorage.getItem(storageKey);
      activeVersionList = localData ? JSON.parse(localData) : [];
    }

    renderVersionsList();
  } catch (err) {
    console.error('Error fetching version history:', err);
    container.innerHTML = '<p class="modal-desc" style="text-align: center; color: #ef4444; padding: 20px 0;">Failed to load history.</p>';
  }
}

// Render left sidebar version item buttons
function renderVersionsList() {
  const container = document.getElementById('versions-list-container');
  container.innerHTML = '';

  if (activeVersionList.length === 0) {
    container.innerHTML = '<p class="modal-desc" style="text-align: center; padding: 20px 0;">No versions found.</p>';
    return;
  }

  activeVersionList.forEach((v, index) => {
    const item = document.createElement('div');
    item.className = 'version-item';
    item.setAttribute('data-id', v.id);

    const formattedDate = new Date(v.created_at).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    item.innerHTML = `
      <div class="version-item-header">
        <span class="version-item-title">Version ${v.version_number}</span>
        <span class="version-item-badge">v${v.version_number}</span>
      </div>
      <span class="version-item-time">${formattedDate}</span>
    `;

    item.addEventListener('click', () => {
      document.querySelectorAll('.version-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
      selectVersionDetails(v, index);
    });

    container.appendChild(item);
  });
}

// Compute diffs and display right panel version details
function selectVersionDetails(v, index) {
  selectedVersion = v;

  document.getElementById('version-details-empty-state').style.display = 'none';
  const contentPanel = document.getElementById('version-details-content-panel');
  contentPanel.style.display = 'flex';

  document.getElementById('details-version-title').textContent = `Version ${v.version_number}`;
  
  const formattedDate = new Date(v.created_at).toLocaleString([], {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  document.getElementById('details-version-time').textContent = formattedDate;

  // Build readable diff
  const diffList = document.getElementById('diff-fields-list');
  diffList.innerHTML = '';

  const propertyLabels = {
    bot_name: 'Bot Name',
    avatar_url: 'Avatar URL',
    welcome_message: 'Welcome Message',
    n8n_url: 'n8n Webhook URL',
    suggestions: 'Suggested Questions',
    theme: 'Theme',
    color: 'Accent Color',
    position: 'Launcher Position'
  };

  const oldConf = v.config;
  const newConf = (index === 0) 
    ? {
        bot_name: activeProject.bot_name,
        avatar_url: activeProject.avatar_url,
        welcome_message: activeProject.welcome_message,
        n8n_url: activeProject.n8n_url,
        suggestions: activeProject.suggestions,
        theme: activeProject.theme,
        color: activeProject.color,
        position: activeProject.position
      }
    : activeVersionList[index - 1].config;

  let changesCount = 0;

  Object.keys(propertyLabels).forEach(key => {
    const oldVal = oldConf[key] || '';
    const newVal = newConf[key] || '';

    if (oldVal !== newVal) {
      changesCount++;
      const diffItem = document.createElement('div');
      diffItem.className = 'diff-field-item';

      diffItem.innerHTML = `
        <span class="diff-field-name">${propertyLabels[key]}</span>
        <div class="diff-field-change">
          <span class="diff-removed">${escapeHtml(oldVal || '[empty]')}</span>
          <span class="diff-arrow">➔</span>
          <span class="diff-added">${escapeHtml(newVal || '[empty]')}</span>
        </div>
      `;
      diffList.appendChild(diffItem);
    }
  });

  if (changesCount === 0) {
    diffList.innerHTML = '<p class="no-changes-label">No configuration differences detected vs. the subsequent state.</p>';
  }
}

// Restore selected version configuration
async function restoreSelectedVersion() {
  if (!selectedVersion || !activeProject) return;

  if (!confirm(`Restore Version ${selectedVersion.version_number}? This will overwrite your current settings, but a snapshot of your current settings will be logged in history so you can undo.`)) {
    return;
  }

  const btn = document.getElementById('btn-restore-version');
  const originalText = btn.textContent;
  btn.textContent = 'Restoring...';
  btn.disabled = true;

  try {
    const configToRestore = selectedVersion.config;

    // Populate the form fields with the restored values
    botNameInput.value = configToRestore.bot_name || '';
    avatarInput.value = configToRestore.avatar_url || '';
    welcomeInput.value = configToRestore.welcome_message || '';
    n8nUrlInput.value = configToRestore.n8n_url || '';
    suggestionsInput.value = configToRestore.suggestions || '';
    positionSelect.value = configToRestore.position || 'right';

    // Update Theme Selection
    activeTheme = configToRestore.theme || 'light';
    themeButtons.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-theme') === activeTheme);
    });

    // Update Color Selection
    activeColor = configToRestore.color || '#6366f1';
    colorPicker.value = activeColor;
    colorHexText.textContent = activeColor.toUpperCase();
    
    presetDots.forEach(dot => {
      const dotColor = dot.getAttribute('data-color');
      dot.classList.toggle('active', dotColor.toLowerCase() === activeColor.toLowerCase());
    });

    // Save restored settings
    await saveActiveProject();

    document.getElementById('version-history-modal').style.display = 'none';
    alert(`Successfully restored Version ${selectedVersion.version_number}!`);

  } catch (err) {
    console.error('Error restoring version:', err);
    alert('Failed to restore configuration: ' + err.message);
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

// Wire up Version History Modal buttons and triggers
function setupVersionHistoryEvents() {
  const modal = document.getElementById('version-history-modal');
  const btnHistory = document.getElementById('btn-version-history');
  const btnClose = document.getElementById('btn-close-history-modal');
  const btnRestore = document.getElementById('btn-restore-version');

  if (!modal) return;

  btnHistory.addEventListener('click', openVersionHistoryModal);
  btnClose.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  btnRestore.addEventListener('click', restoreSelectedVersion);
}

// Wiki Tab Navigation show/hide section handler
function setupWikiNavigation() {
  const links = document.querySelectorAll('.wiki-nav-link');
  const sections = document.querySelectorAll('.wiki-section');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Update active nav link
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // Hide all sections and show selected
      const targetId = link.getAttribute('href').substring(1);
      sections.forEach(sec => {
        sec.style.display = (sec.id === targetId) ? 'block' : 'none';
      });
    });
  });
}

