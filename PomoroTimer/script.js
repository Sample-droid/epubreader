:root {
    --bg-main: #09090b;
    --bg-surface: #121215;
    --bg-surface-hover: #1c1c21;
    --bg-element: #222228;
    
    --border-subtle: rgba(255, 255, 255, 0.08);
    --border-strong: rgba(255, 255, 255, 0.16);
    
    --text-primary: #f4f4f5;
    --text-secondary: #a1a1aa;
    --text-muted: #71717a;
    
    --accent: #38bdf8;
    --accent-glow: rgba(56, 189, 248, 0.2);

    --reader-bg: #121215;
    --reader-text: #e4e4e7;
}

/* Sepia Theme */
[data-app-theme="sepia"] {
    --bg-main: #f4ebd0;
    --bg-surface: #fbf0d9;
    --bg-surface-hover: #f0e3c4;
    --bg-element: #e6d7b8;
    --border-subtle: rgba(95, 75, 50, 0.12);
    --text-primary: #42321e;
    --text-secondary: #6e5941;
    --text-muted: #947e65;
    --accent: #c07d31;
    --reader-bg: #fbf0d9;
    --reader-text: #42321e;
}

/* Light Theme */
[data-app-theme="light"] {
    --bg-main: #f4f4f5;
    --bg-surface: #ffffff;
    --bg-surface-hover: #f4f4f5;
    --bg-element: #e4e4e7;
    --border-subtle: rgba(0, 0, 0, 0.08);
    --text-primary: #09090b;
    --text-secondary: #71717a;
    --text-muted: #a1a1aa;
    --accent: #0284c7;
    --reader-bg: #ffffff;
    --reader-text: #09090b;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
}

body {
    background-color: var(--bg-main);
    color: var(--text-primary);
    height: 100vh;
    overflow: hidden;
}

.app-container {
    display: flex;
    height: 100vh;
    width: 100vw;
    position: relative;
}

/* Backdrop for Mobile Sidebar */
.backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 90;
    transition: opacity 0.25s ease;
}

/* Sidebar */
.sidebar {
    width: 320px;
    background-color: var(--bg-surface);
    border-right: 1px solid var(--border-subtle);
    display: flex;
    flex-direction: column;
    padding: 20px;
    gap: 16px;
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 100;
}

.sidebar.collapsed {
    margin-left: -320px;
}

.brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-subtle);
}

.brand-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--accent), #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
}

.brand span {
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 1px;
}

.book-info {
    padding: 8px 0;
    border-bottom: 1px solid var(--border-subtle);
}

.book-info h2 {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.3;
}

.book-info p {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 4px;
}

/* Tabs */
.tab-controls {
    display: flex;
    background-color: var(--bg-main);
    padding: 4px;
    border-radius: 8px;
    border: 1px solid var(--border-subtle);
}

.tab-btn {
    flex: 1;
    padding: 6px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 500;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
}

.tab-btn.active {
    background-color: var(--bg-element);
    color: var(--text-primary);
}

.tab-content {
    display: none;
    flex: 1;
    overflow-y: auto;
}

.tab-content.active {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

/* TOC List */
.toc-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.toc-item {
    padding: 10px 12px;
    font-size: 13px;
    color: var(--text-secondary);
    border-radius: 6px;
    cursor: pointer;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    transition: all 0.15s ease;
}

.toc-item:hover {
    background-color: var(--bg-surface-hover);
    color: var(--text-primary);
}

.empty-state-text {
    font-size: 12px;
    color: var(--text-muted);
    text-align: center;
    margin-top: 20px;
}

/* Settings Controls */
.control-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.group-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-muted);
}

.theme-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
}

.theme-btn {
    padding: 8px;
    border-radius: 6px;
    border: 1px solid var(--border-subtle);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.15s ease;
}

.theme-btn.active {
    border-color: var(--accent);
    box-shadow: 0 0 10px var(--accent-glow);
}

.font-size-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--bg-main);
    border: 1px solid var(--border-subtle);
    padding: 6px 12px;
    border-radius: 8px;
}

.select-input {
    width: 100%;
    padding: 8px 12px;
    background-color: var(--bg-main);
    border: 1px solid var(--border-subtle);
    color: var(--text-primary);
    border-radius: 8px;
    font-size: 12px;
    outline: none;
}

/* Viewport Area */
.viewport {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100vh;
    position: relative;
    overflow: hidden;
}

.top-bar {
    height: 56px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--border-subtle);
    z-index: 5;
}

.icon-btn, .primary-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 12px;
    background-color: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    color: var(--text-primary);
    border-radius: 8px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.15s ease;
}

.primary-btn {
    background-color: var(--accent);
    color: #000;
    font-weight: 600;
    border: none;
}

#epubFileInput { display: none; }

/* Stage */
.reader-stage {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--reader-bg);
    overflow: hidden;
    transition: background-color 0.25s ease;
}

.drop-zone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 24px;
    margin: 16px;
    border: 2px dashed var(--border-strong);
    border-radius: 16px;
    color: var(--text-muted);
    text-align: center;
}

.drop-icon {
    font-size: 32px;
}

.drop-zone h3 { font-size: 15px; color: var(--text-primary); }
.drop-zone p { font-size: 12px; }

/* Epub View Container */
.epub-viewer {
    width: 100%;
    height: 100%;
    max-width: 900px;
    margin: 0 auto;
}

.nav-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background-color: rgba(18, 18, 21, 0.7);
    backdrop-filter: blur(8px);
    border: 1px solid var(--border-subtle);
    color: var(--text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s ease;
    font-size: 24px;
    z-index: 5;
}

.nav-arrow.left { left: 16px; }
.nav-arrow.right { right: 16px; }

/* Footer Progress Bar */
.reader-footer {
    height: 40px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    border-top: 1px solid var(--border-subtle);
    font-size: 12px;
    color: var(--text-muted);
}

.progress-bar-track {
    flex: 1;
    height: 4px;
    background-color: var(--bg-element);
    border-radius: 2px;
    overflow: hidden;
}

.progress-bar-fill {
    width: 0%;
    height: 100%;
    background-color: var(--accent);
    transition: width 0.2s ease;
}

.hidden { display: none !important; }

/* ----------------------------------------------------
   MOBILE RESPONSIVE OVERRIDES (< 768px)
---------------------------------------------------- */
@media (max-width: 768px) {
    .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: 80%;
        max-width: 300px;
        box-shadow: 10px 0 30px rgba(0, 0, 0, 0.8);
        margin-left: 0 !important;
        transform: translateX(0); /* Opened */
    }

    .sidebar.collapsed {
        transform: translateX(-100%) !important; /* Fully hidden off-screen */
    }

    .nav-arrow {
        width: 38px;
        height: 38px;
        top: auto;
        bottom: 16px;
        transform: none;
    }

    .nav-arrow.left { left: 16px; }
    .nav-arrow.right { right: 16px; }
}
