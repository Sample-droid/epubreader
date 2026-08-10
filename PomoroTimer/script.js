// State Management
let currentBook = null;
let currentRendition = null;
let currentFontSize = 100;
let currentTheme = 'dark';

// Element References
const sidebar = document.getElementById('sidebar');
const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
const epubFileInput = document.getElementById('epubFileInput');
const dropZone = document.getElementById('dropZone');
const viewer = document.getElementById('viewer');
const bookInfo = document.getElementById('bookInfo');
const bookTitle = document.getElementById('bookTitle');
const bookAuthor = document.getElementById('bookAuthor');
const tocList = document.getElementById('tocList');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const readerFooter = document.getElementById('readerFooter');
const pageProgress = document.getElementById('pageProgress');
const progressBarFill = document.getElementById('progressBarFill');

// Settings Elements
const tocTabBtn = document.getElementById('tocTabBtn');
const settingsTabBtn = document.getElementById('settingsTabBtn');
const tocView = document.getElementById('tocView');
const settingsView = document.getElementById('settingsView');
const themeBtns = document.querySelectorAll('.theme-btn');
const increaseFontBtn = document.getElementById('increaseFont');
const decreaseFontBtn = document.getElementById('decreaseFont');
const fontSizeDisplay = document.getElementById('fontSizeDisplay');
const fontFamilySelect = document.getElementById('fontFamilySelect');

// Theme CSS Rules for ePub Sandboxed Iframe
const themes = {
    dark: {
        body: { background: '#121215 !important', color: '#e4e4e7 !important' },
        'p, span, h1, h2, h3, h4, h5, h6, a': { color: '#e4e4e7 !important' }
    },
    sepia: {
        body: { background: '#fcf8ed !important', color: '#433422 !important' },
        'p, span, h1, h2, h3, h4, h5, h6, a': { color: '#433422 !important' }
    },
    light: {
        body: { background: '#ffffff !important', color: '#18181b !important' },
        'p, span, h1, h2, h3, h4, h5, h6, a': { color: '#18181b !important' }
    }
};

// Initialize ePub Instance from ArrayBuffer
function loadEpub(arrayBuffer) {
    if (currentBook) {
        currentBook.destroy();
    }

    // Hide Dropzone & Show Viewer Controls
    dropZone.classList.add('hidden');
    viewer.classList.remove('hidden');
    prevBtn.classList.remove('hidden');
    nextBtn.classList.remove('hidden');
    readerFooter.classList.remove('hidden');
    bookInfo.classList.remove('hidden');

    // Create Epub.js Book Object
    currentBook = ePub(arrayBuffer);

    // Render to Viewer Div
    currentRendition = currentBook.renderTo('viewer', {
        width: '100%',
        height: '100%',
        spread: 'always'
    });

    currentRendition.display();

    // Register Themes
    Object.keys(themes).forEach(themeName => {
        currentRendition.themes.register(themeName, themes[themeName]);
    });
    currentRendition.themes.select(currentTheme);

    // Metadata Extraction
    currentBook.loaded.metadata.then(meta => {
        bookTitle.textContent = meta.title || 'Untitled Book';
        bookAuthor.textContent = meta.creator || 'Unknown Author';
    });

    // Navigation / Table of Contents Extraction
    currentBook.loaded.navigation.then(nav => {
        tocList.innerHTML = '';
        if (nav.toc && nav.toc.length > 0) {
            nav.toc.forEach(chapter => {
                const item = document.createElement('div');
                item.classList.add('toc-item');
                item.textContent = chapter.label.trim();
                item.addEventListener('click', () => {
                    currentRendition.display(chapter.href);
                });
                tocList.appendChild(item);
            });
        } else {
            tocList.innerHTML = '<p class="empty-state-text">No Table of Contents available</p>';
        }
    });

    // Generate Locations for Progress Tracking
    currentBook.ready.then(() => {
        return currentBook.locations.generate(1024);
    }).then(() => {
        updateProgress();
    });

    // Location Change Listener
    currentRendition.on('relocated', (location) => {
        if (currentBook && currentBook.locations) {
            const percent = currentBook.locations.percentageFromCfi(location.start.cfi);
            const percentageText = `${Math.floor(percent * 100)}%`;
            pageProgress.textContent = percentageText;
            progressBarFill.style.width = percentageText;
        }
    });
}

function updateProgress() {
    if (currentRendition && currentRendition.location) {
        const cfi = currentRendition.location.start.cfi;
        const percent = currentBook.locations.percentageFromCfi(cfi);
        const percentageText = `${Math.floor(percent * 100)}%`;
        pageProgress.textContent = percentageText;
        progressBarFill.style.width = percentageText;
    }
}

// File Pickers & Drag and Drop
epubFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => loadEpub(event.target.result);
        reader.readAsArrayBuffer(file);
    }
});

window.addEventListener('dragover', (e) => e.preventDefault());
window.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.epub')) {
        const reader = new FileReader();
        reader.onload = (event) => loadEpub(event.target.result);
        reader.readAsArrayBuffer(file);
    }
});

// Navigation Controls
prevBtn.addEventListener('click', () => currentRendition && currentRendition.prev());
nextBtn.addEventListener('click', () => currentRendition && currentRendition.next());

window.addEventListener('keydown', (e) => {
    if (!currentRendition) return;
    if (e.key === 'ArrowLeft') currentRendition.prev();
    if (e.key === 'ArrowRight') currentRendition.next();
    if (e.key.toLowerCase() === 's') sidebar.classList.toggle('collapsed');
});

toggleSidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
});

// Tab Switching
tocTabBtn.addEventListener('click', () => {
    tocTabBtn.classList.add('active');
    settingsTabBtn.classList.remove('active');
    tocView.classList.add('active');
    settingsView.classList.remove('active');
});

settingsTabBtn.addEventListener('click', () => {
    settingsTabBtn.classList.add('active');
    tocTabBtn.classList.remove('active');
    settingsView.classList.add('active');
    tocView.classList.remove('active');
});

// Theme Selector
themeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTheme = btn.dataset.theme;
        if (currentRendition) {
            currentRendition.themes.select(currentTheme);
        }
        document.documentElement.style.setProperty('--reader-bg', themes[currentTheme].body.background.replace(' !important', ''));
    });
});

// Font Size Controls
increaseFontBtn.addEventListener('click', () => {
    currentFontSize = Math.min(currentFontSize + 10, 200);
    fontSizeDisplay.textContent = `${currentFontSize}%`;
    if (currentRendition) currentRendition.themes.fontSize(`${currentFontSize}%`);
});

decreaseFontBtn.addEventListener('click', () => {
    currentFontSize = Math.max(currentFontSize - 10, 70);
    fontSizeDisplay.textContent = `${currentFontSize}%`;
    if (currentRendition) currentRendition.themes.fontSize(`${currentFontSize}%`);
});

// Font Family Switcher
fontFamilySelect.addEventListener('change', (e) => {
    if (currentRendition) {
        currentRendition.themes.font(e.target.value);
    }
});