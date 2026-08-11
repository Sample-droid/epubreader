const fileInput = document.getElementById('file-input');
const uploadLabel = document.getElementById('upload-label');
const viewer = document.getElementById('viewer');
const bookTitle = document.getElementById('book-title');
const chapterTitle = document.getElementById('chapter-title');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

const topBar = document.getElementById('top-bar');
const bottomBar = document.getElementById('bottom-bar');
const tocBtn = document.getElementById('toc-btn');
const closeTocBtn = document.getElementById('close-toc');
const tocDrawer = document.getElementById('toc-drawer');
const tocOverlay = document.getElementById('toc-overlay');
const tocList = document.getElementById('toc-list');

let book = null;
let rendition = null;
let lastScrollTop = 0;
let scrollBehaviorInitialized = false;

// Toggle TOC Drawer
function toggleToc(open) {
    tocDrawer.classList.toggle('open', open);
    tocOverlay.classList.toggle('active', open);
    tocDrawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    tocBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
}

tocBtn.addEventListener('click', () => toggleToc(true));
closeTocBtn.addEventListener('click', () => toggleToc(false));
tocOverlay.addEventListener('click', () => toggleToc(false));

// Handle File Selection
fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (rendition) rendition.destroy();
    if (book) book.destroy();
    viewer.innerHTML = '';

    const reader = new FileReader();
    reader.onload = function(event) {
        initReader(event.target.result, `${file.name}_${file.size}`);
    };
    reader.onerror = function() {
        alert('Unable to read EPUB file. Please try another file.');
    };
    reader.readAsArrayBuffer(file);
});

function initReader(bookData, identifier) {
    book = ePub(bookData);
    
    rendition = book.renderTo("viewer", {
        manager: "continuous",
        flow: "scrolled-doc",
        width: "100%",
        height: "100%",
        snap: false
    });

    rendition.themes.default({
        p: { "font-size": "1.1rem !important", "line-height": "1.6 !important", "padding-bottom": "1em !important" },
        body: { "padding": "0 10px !important" }
    });

    // Hide Open EPUB button once loaded
    uploadLabel.classList.add('hidden');

    const storageKey = 'epub_pos_' + identifier;
    const savedLoc = localStorage.getItem(storageKey);

    // Book Title Info
    book.loaded.metadata.then(meta => {
        bookTitle.textContent = meta.title || identifier || "Unknown Title";
    }).catch(() => {
        bookTitle.textContent = identifier || "Unknown Title";
    });

    rendition.on("relocated", function(location) {
        prevBtn.disabled = location.atStart;
        nextBtn.disabled = location.atEnd;

        if (location.start && location.start.cfi) {
            localStorage.setItem(storageKey, location.start.cfi);
        }

        book.loaded.navigation.then(nav => {
            const navItem = nav.get(location.start.href) || nav.get(location.start.cfi);
            chapterTitle.textContent = navItem && navItem.label ? navItem.label.trim() : "Reading...";
        });
    });

    rendition.display(savedLoc || undefined).catch(() => {
        rendition.display();
    });

    // Populate Table of Contents Drawer
    book.loaded.navigation.then(nav => {
        tocList.innerHTML = '';
        nav.toc.forEach(chapter => {
            const a = document.createElement('a');
            a.textContent = chapter.label.trim();
            a.href = chapter.href;
            a.className = 'toc-item';
            a.addEventListener('click', (e) => {
                e.preventDefault();
                rendition.display(chapter.href);
                toggleToc(false);
            });
            tocList.appendChild(a);
        });
    });

    // Setup Scroll Listener for Header Auto-Hide
    setupScrollBehavior();
}

// Auto-hide headers when scrolling down, show when scrolling up
function setupScrollBehavior() {
    if (scrollBehaviorInitialized) return;
    scrollBehaviorInitialized = true;

    viewer.addEventListener('scroll', () => {
        let st = viewer.scrollTop;
        
        // Threshold check to avoid overly sensitive triggers
        if (Math.abs(st - lastScrollTop) > 10) {
            if (st > lastScrollTop && st > 60) {
                // Scrolling Down
                topBar.classList.add('hidden');
                bottomBar.classList.add('hidden');
            } else {
                // Scrolling Up
                topBar.classList.remove('hidden');
                bottomBar.classList.remove('hidden');
            }
            lastScrollTop = st <= 0 ? 0 : st;
        }
    });
}

prevBtn.addEventListener('click', () => { if (rendition) rendition.prev(); });
nextBtn.addEventListener('click', () => { if (rendition) rendition.next(); });
