document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('backdrop');
    const toggleSidebarBtn = document.getElementById('toggleSidebar');
    const epubFileInput = document.getElementById('epubFileInput');
    const dropZone = document.getElementById('dropZone');
    const readerStage = document.getElementById('readerStage');
    const viewer = document.getElementById('viewer');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const bookTitleEl = document.getElementById('bookTitle');
    const bookAuthorEl = document.getElementById('bookAuthor');
    const tocListEl = document.getElementById('tocList');
    const progressBarFill = document.getElementById('progressBarFill');
    const progressPercent = document.getElementById('progressPercent');

    // Settings Elements
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const themeBtns = document.querySelectorAll('.theme-btn');
    const incFontBtn = document.getElementById('incFont');
    const decFontBtn = document.getElementById('decFont');
    const fontSizeDisplay = document.getElementById('fontSizeDisplay');
    const fontFamilySelect = document.getElementById('fontFamilySelect');

    // Reader State
    let book = null;
    let rendition = null;
    let currentFontSize = 100;
    let currentTheme = 'dark';

    // Auto-collapse sidebar on mobile screens
    function checkMobileView() {
        if (window.innerWidth <= 768) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }

    function openSidebar() {
        sidebar.classList.remove('collapsed');
        if (window.innerWidth <= 768) {
            backdrop.classList.remove('hidden');
        }
    }

    function closeSidebar() {
        sidebar.classList.add('collapsed');
        backdrop.classList.add('hidden');
    }

    toggleSidebarBtn.addEventListener('click', () => {
        if (sidebar.classList.contains('collapsed')) {
            openSidebar();
        } else {
            closeSidebar();
        }
    });

    backdrop.addEventListener('click', closeSidebar);

    // Tab Navigation
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        });
    });

    // File Upload Handlers
    epubFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) loadEpub(file);
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--accent)';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'var(--border-strong)';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.epub')) {
            loadEpub(file);
        } else {
            alert('Please drop a valid .epub file.');
        }
    });

    // Load EPUB
    function loadEpub(file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const arrayBuffer = event.target.result;

            if (book) book.destroy();

            viewer.innerHTML = '';
            dropZone.classList.add('hidden');
            viewer.classList.remove('hidden');
            prevPageBtn.classList.remove('hidden');
            nextPageBtn.classList.remove('hidden');

            book = ePub(arrayBuffer);
            rendition = book.renderTo("viewer", {
                width: "100%",
                height: "100%",
                spread: "always"
            });

            rendition.display();

            // Load Metadata & TOC
            book.loaded.metadata.then(meta => {
                bookTitleEl.textContent = meta.title || 'Untitled Book';
                bookAuthorEl.textContent = meta.creator || 'Unknown Author';
            });

            book.loaded.navigation.then(nav => {
                renderTOC(nav.toc);
            });

            // Handle Progress Updates
            book.ready.then(() => {
                return book.locations.generate(1000);
            }).then(() => {
                rendition.on('relocated', location => {
                    const percent = book.locations.percentageFromCfi(location.start.cfi);
                    const formatted = Math.floor(percent * 100);
                    progressBarFill.style.width = `${formatted}%`;
                    progressPercent.textContent = `${formatted}%`;
                });
            });

            applyTheme(currentTheme);

            // Auto close menu on mobile after picking a book
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        };

        reader.readAsArrayBuffer(file);
    }

    // Render Table of Contents
    function renderTOC(toc) {
        tocListEl.innerHTML = '';
        if (!toc || toc.length === 0) {
            tocListEl.innerHTML = '<p class="empty-state-text">No chapter outline found.</p>';
            return;
        }

        toc.forEach(chapter => {
            const item = document.createElement('div');
            item.className = 'toc-item';
            item.textContent = chapter.label.trim();
            item.addEventListener('click', () => {
                if (rendition) rendition.display(chapter.href);
                if (window.innerWidth <= 768) closeSidebar();
            });
            tocListEl.appendChild(item);
        });
    }

    // Navigation Buttons
    prevPageBtn.addEventListener('click', () => rendition && rendition.prev());
    nextPageBtn.addEventListener('click', () => rendition && rendition.next());

    // Keyboard Arrow Controls
    document.addEventListener('keydown', (e) => {
        if (!rendition) return;
        if (e.key === 'ArrowRight') rendition.next();
        if (e.key === 'ArrowLeft') rendition.prev();
    });

    // Theme Switcher
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            themeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTheme = btn.dataset.theme;
            document.documentElement.setAttribute('data-app-theme', currentTheme);
            applyTheme(currentTheme);
        });
    });

    function applyTheme(theme) {
        if (!rendition) return;

        let textColor = '#e4e4e7';
        let bgColor = '#121215';

        if (theme === 'sepia') {
            textColor = '#42321e';
            bgColor = '#fbf0d9';
        } else if (theme === 'light') {
            textColor = '#09090b';
            bgColor = '#ffffff';
        }

        rendition.themes.default({
            'body': {
                'color': `${textColor} !important`,
                'background': `${bgColor} !important`
            }
        });
    }

    // Font Size Adjustments
    incFontBtn.addEventListener('click', () => {
        if (currentFontSize < 200) {
            currentFontSize += 10;
            updateFontSize();
        }
    });

    decFontBtn.addEventListener('click', () => {
        if (currentFontSize > 70) {
            currentFontSize -= 10;
            updateFontSize();
        }
    });

    function updateFontSize() {
        fontSizeDisplay.textContent = `${currentFontSize}%`;
        if (rendition) {
            rendition.themes.fontSize(`${currentFontSize}%`);
        }
    }

    fontFamilySelect.addEventListener('change', (e) => {
        if (rendition) {
            rendition.themes.font(e.target.value);
        }
    });

    // Run view check on load
    checkMobileView();
});
