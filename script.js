/**
 * Toolbox101 - Core Application Logic
 */

// --- State Management ---
const state = {
    currentToolId: null,
    searchQuery: '',
    isMobileMenuOpen: false,
    isSidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true',
    collapsedCategories: JSON.parse(localStorage.getItem('collapsedCategories') || '[]'),
    theme: localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
};

// --- DOM Elements ---
const elements = {
    sidebarNav: document.getElementById('sidebarNav'),
    toolContent: document.getElementById('toolContent'),
    globalSearch: document.getElementById('globalSearch'),
    mobileSearch: document.getElementById('mobileSearch'),
    themeToggle: document.getElementById('themeToggle'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    sidebarToggle: document.getElementById('sidebarToggle'),
    sidebar: document.getElementById('sidebar'),
    mobileOverlay: document.getElementById('mobileOverlay'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// --- Initialization ---
function init() {
    renderSidebar();
    setupEventListeners();
    applyTheme();

    // Check for tool in URL hash
    const hash = window.location.hash.substring(1);
    if (hash && toolsRegistry.find(t => t.id === hash)) {
        loadTool(hash);
    }

    // Command + K for search
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            elements.globalSearch.focus();
        }
    });
}

// --- Sidebar Rendering ---
function renderSidebar() {
    const query = state.searchQuery.toLowerCase();
    elements.sidebarNav.innerHTML = '';

    categories.forEach(category => {
        const categoryTools = toolsRegistry.filter(t =>
            t.category === category.id &&
            (t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query))
        );

        if (categoryTools.length > 0) {
            let isCollapsed = state.collapsedCategories.includes(category.id) && !query;
            const hasActiveTool = categoryTools.some(t => t.id === state.currentToolId);

            if (hasActiveTool && isCollapsed) {
                isCollapsed = false;
                state.collapsedCategories = state.collapsedCategories.filter(id => id !== category.id);
                localStorage.setItem('collapsedCategories', JSON.stringify(state.collapsedCategories));
            }

            const categoryHeading = document.createElement('div');
            categoryHeading.className = 'nav-category';
            categoryHeading.innerHTML = `
                <div class="flex items-center gap-2"><i data-lucide="${category.icon}" class="w-3 h-3"></i> ${category.name}</div>
                <i data-lucide="${isCollapsed ? 'chevron-right' : 'chevron-down'}" class="w-3 h-3 transition-transform"></i>
            `;
            categoryHeading.onclick = () => toggleCategory(category.id);
            elements.sidebarNav.appendChild(categoryHeading);

            const categoryContent = document.createElement('div');
            categoryContent.className = `category-content ${isCollapsed ? 'collapsed' : ''}`;

            categoryTools.forEach(tool => {
                const toolItem = document.createElement('div');
                toolItem.className = `nav-item ${state.currentToolId === tool.id ? 'active' : ''}`;
                toolItem.innerHTML = `
                    <i data-lucide="${tool.icon}" class="w-4 h-4"></i>
                    <span class="truncate">${tool.title}</span>
                `;
                toolItem.onclick = () => loadTool(tool.id);
                categoryContent.appendChild(toolItem);
            });
            elements.sidebarNav.appendChild(categoryContent);
        }
    });
    lucide.createIcons();
}

function toggleCategory(categoryId) {
    if (state.collapsedCategories.includes(categoryId)) {
        state.collapsedCategories = state.collapsedCategories.filter(id => id !== categoryId);
    } else {
        state.collapsedCategories.push(categoryId);
    }
    localStorage.setItem('collapsedCategories', JSON.stringify(state.collapsedCategories));
    renderSidebar();
}

// --- Tool Loading ---
function loadTool(toolId) {
    const tool = toolsRegistry.find(t => t.id === toolId);
    if (!tool) return;

    state.currentToolId = toolId;
    window.location.hash = toolId;

    // Update active state in sidebar
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    renderSidebar();

    // Render Tool UI
    elements.toolContent.innerHTML = `
        <div class="animate-fade-in">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <i data-lucide="${tool.icon}" class="w-8 h-8 text-primary-600"></i>
                        ${tool.title}
                    </h2>
                    <p class="text-slate-500 dark:text-gray-400 mt-1">${tool.description}</p>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="shareTool('${tool.id}')" class="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-gray-800 transition-colors" title="Share Tool">
                        <i data-lucide="share-2" class="w-5 h-5"></i>
                    </button>
                    <button onclick="clearTool()" class="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-gray-800 transition-colors" title="Clear Tool">
                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>

            <div id="toolUI" class="space-y-6">
                <!-- Tool specific fields will be injected here -->
            </div>
        </div>
    `;

    // Call the tool's specific renderer (implemented in tools.js)
    if (window.renderToolUI) {
        window.renderToolUI(toolId);
    }

    lucide.createIcons();

    // Close mobile menu
    if (state.isMobileMenuOpen) toggleMobileMenu();
}

// --- Event Listeners ---
function setupEventListeners() {
    elements.globalSearch.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderSidebar();
    });

    elements.mobileSearch.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderSidebar();
    });

    elements.themeToggle.addEventListener('click', () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', state.theme);
        applyTheme();
    });

    elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    elements.mobileOverlay.addEventListener('click', toggleMobileMenu);

    elements.sidebarToggle.addEventListener('click', () => {
        state.isSidebarCollapsed = !state.isSidebarCollapsed;
        localStorage.setItem('sidebarCollapsed', state.isSidebarCollapsed);
        applySidebarState();
    });
}

// --- Theme Management ---
function applyTheme() {
    if (state.theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    applySidebarState();
}

function applySidebarState() {
    if (state.isSidebarCollapsed) {
        elements.sidebar.classList.add('lg:hidden');
        elements.sidebarToggle.innerHTML = '<i data-lucide="panel-left-open" class="w-6 h-6"></i>';
    } else {
        elements.sidebar.classList.remove('lg:hidden');
        elements.sidebarToggle.innerHTML = '<i data-lucide="panel-left-close" class="w-6 h-6"></i>';
    }
    lucide.createIcons();
}

// --- Mobile Menu ---
function toggleMobileMenu() {
    state.isMobileMenuOpen = !state.isMobileMenuOpen;
    if (state.isMobileMenuOpen) {
        elements.sidebar.classList.remove('-translate-x-full');
        elements.mobileOverlay.classList.remove('hidden');
    } else {
        elements.sidebar.classList.add('-translate-x-full');
        elements.mobileOverlay.classList.add('hidden');
    }
}

// --- Helper Functions ---
window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!');
    });
};

function showToast(message) {
    elements.toastMessage.textContent = message;
    elements.toast.classList.remove('translate-y-24', 'opacity-0');
    elements.toast.classList.add('translate-y-0', 'opacity-100');
    setTimeout(() => {
        elements.toast.classList.remove('translate-y-0', 'opacity-100');
        elements.toast.classList.add('translate-y-24', 'opacity-0');
    }, 2000);
}

window.shareTool = function(toolId) {
    const url = window.location.origin + window.location.pathname + '#' + toolId;
    copyToClipboard(url);
    showToast('Link copied to clipboard!');
};

window.clearTool = function() {
    const inputs = document.querySelectorAll('textarea, input:not([type="checkbox"]):not([type="radio"])');
    inputs.forEach(input => input.value = '');
    const outputs = document.querySelectorAll('.output-area');
    outputs.forEach(output => output.textContent = '');
    if (window.onToolClear) window.onToolClear();
};

// Boot
window.addEventListener('DOMContentLoaded', init);
