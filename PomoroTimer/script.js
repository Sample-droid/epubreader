document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('backdrop');
    const menuBtn = document.getElementById('menuBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const fileInput = document.getElementById('fileInput');
    const emptyState = document.getElementById('emptyState');
    const viewer = document.getElementById('viewer');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const bookTitle = document.getElementById('bookTitle');
    const bookAuthor = document.getElementById('bookAuthor');
    const tocList = document.getElementById('tocList');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    // Controls
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const themeBtns = document.querySelectorAll('.theme-btn');
    const incFontBtn = document.getElementById('incFontBtn');
    const decFontBtn = document.getElementById('decFontBtn');
    const fontSizeVal = document.getElementById('fontSizeVal');

    // State
    let book = null;
    let rendition = null;
    let fontSize = 100;

    // Mobile Sidebar Toggle
    function openSidebar() {
        sidebar.classList.add('open');
        backdrop.classList.add('open');
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        backdrop.classList.remove('open');
    }

    menuBtn.addEventListener('click', () => {
        if (sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    closeSidebarBtn.addEventListener('click', closeSidebar);
    backdrop.addEventListener('click', closeSidebar);

    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        });
    });

    // File Upload
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) loadBook(file);
    });

    function loadBook(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const buffer = e.target.result;

            if (book) book.destroy();

            viewer.innerHTML = '';
            emptyState.classList.add('hidden');
            viewer.classList.remove('hidden');
            prevBtn.classList.remove('hidden');
            nextBtn.classList.remove('hidden');

            book = ePub(buffer);
            
            // Single page flow prevents mobile scaling breakage
            rendition = book.renderTo("viewer", {
                width: "100%",
                height: "100%",
                spread: "none",
                flow: "paginated"
            });

            rendition.display();

            // Load Metadata
            book.loaded.metadata.then(meta => {
                bookTitle.textContent = meta.title || 'Untitled Book';
                bookAuthor.textContent = meta.creator || 'Unknown Author';
            });

            // Load TOC
            book.loaded.navigation.then(nav => {
                renderTOC(nav.toc);
            });

            // Handle Progress
            book.ready.then(() => {
                return book.locations.generate(1000);
            }).then(() => {
                rendition.on('relocated', location => {
                    const percent = book.locations.percentageFromCfi(location.start.cfi);
                    const formatted = Math.floor(percent * 100);
                    progressBar.style.width = `${formatted}%`;
                    progressText.textContent = `${formatted}%`;
                });
            });

            closeSidebar();
        };

        reader.readAsArrayBuffer(file);
    }

    // Render TOC
    function renderTOC(toc) {
        tocList.innerHTML = '';
        if (!toc || toc.length === 0) {
            tocList.innerHTML = '<p class="placeholder-text">No chapters available.</p>';
            return;
        }

        toc.forEach(item => {
            const div = document.createElement('div');
            div.className = 'toc-item';
            div.textContent = item.label.trim();
            div.addEventListener('click', () => {
                if (rendition) rendition.display(item.href);
                closeSidebar();
            });
            tocList.appendChild(div);
        });
    }

    // Navigation
    prevBtn.addEventListener('click', () => rendition && rendition.prev());
    nextBtn.addEventListener('click', () => rendition && rendition.next());

    document.addEventListener('keydown', (e) => {
        if (!rendition) return;
        if (e.key === 'ArrowRight') rendition.next();
        if (e.key === 'ArrowLeft') rendition.prev();
    });

    // Theme Selector
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            themeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const theme = btn.dataset.theme;
            document.body.setAttribute('data-theme', theme);
            
            if (rendition) {
                let color = theme === 'dark' ? '#f3f3f5' : (theme === 'sepia' ? '#42321e' : '#09090b');
                let bg = theme === 'dark' ? '#141418' : (theme === 'sepia' ? '#fbf0d9' : '#ffffff');
                
                rendition.themes.default({
                    'body': {
                        'color': `${color} !important`,
                        'background': `${bg} !important`
                    }
                });
            }
        });
    });

    // Font Controls
    incFontBtn.addEventListener('click', () => {
        if (fontSize < 180) {
            fontSize += 10;
            fontSizeVal.textContent = `${fontSize}%`;
            if (rendition) rendition.themes.fontSize(`${fontSize}%`);
        }
    });

    decFontBtn.addEventListener('click', () => {
        if (fontSize > 80) {
            fontSize -= 10;
            fontSizeVal.textContent = `${fontSize}%`;
            if (rendition) rendition.themes.fontSize(`${fontSize}%`);
        }
    });

    // Window Resize Handling
    window.addEventListener('resize', () => {
        if (rendition) rendition.resize();
    });
});
