document.addEventListener('DOMContentLoaded', () => {
    const epubInput = document.getElementById('epubInput');
    const scrollContainer = document.getElementById('scrollContainer');
    const emptyState = document.getElementById('emptyState');
    const bookContent = document.getElementById('bookContent');
    const bookTitle = document.getElementById('bookTitle');
    
    // Drawer Elements
    const tocDrawer = document.getElementById('tocDrawer');
    const drawerBackdrop = document.getElementById('drawerBackdrop');
    const openDrawerBtn = document.getElementById('openDrawerBtn');
    const closeDrawerBtn = document.getElementById('closeDrawerBtn');
    const tocList = document.getElementById('tocList');

    // Drawer Controls
    function openDrawer() {
        tocDrawer.classList.add('open');
        drawerBackdrop.classList.add('open');
    }

    function closeDrawer() {
        tocDrawer.classList.remove('open');
        drawerBackdrop.classList.remove('open');
    }

    openDrawerBtn.addEventListener('click', openDrawer);
    closeDrawerBtn.addEventListener('click', closeDrawer);
    drawerBackdrop.addEventListener('click', closeDrawer);

    // File Input Change
    epubInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            await processEpubFile(file);
        }
    });

    // Main EPUB Unpacking & Parsing Function
    async function processEpubFile(file) {
        try {
            emptyState.classList.add('hidden');
            bookContent.classList.remove('hidden');
            bookContent.innerHTML = '<p style="text-align:center; padding:40px; color:#888;">Unpacking book...</p>';
            
            const zip = await JSZip.loadAsync(file);

            // 1. Locate root OPF file from container.xml
            const containerXmlStr = await zip.file("META-INF/container.xml").async("text");
            const parser = new DOMParser();
            const containerDoc = parser.parseFromString(containerXmlStr, "text/xml");
            const opfPath = containerDoc.querySelector("rootfile").getAttribute("full-path");
            const opfDir = opfPath.includes("/") ? opfPath.substring(0, opfPath.lastIndexOf("/") + 1) : "";

            // 2. Parse OPF file
            const opfStr = await zip.file(opfPath).async("text");
            const opfDoc = parser.parseFromString(opfStr, "text/xml");

            // Metadata Title
            const titleEl = opfDoc.querySelector("title");
            if (titleEl) {
                bookTitle.textContent = titleEl.textContent;
            }

            // Manifest map (id -> href)
            const manifestItems = {};
            opfDoc.querySelectorAll("manifest > item").forEach(item => {
                manifestItems[item.getAttribute("id")] = item.getAttribute("href");
            });

            // Spine order (array of IDs)
            const spineItemIds = [];
            opfDoc.querySelectorAll("spine > itemref").forEach(item => {
                spineItemIds.push(item.getAttribute("idref"));
            });

            // Clear display
            bookContent.innerHTML = '';
            tocList.innerHTML = '';

            // 3. Process each chapter in spine order
            for (let i = 0; i < spineItemIds.length; i++) {
                const id = spineItemIds[i];
                const relativeHref = manifestItems[id];
                if (!relativeHref) continue;

                const fullPath = resolvePath(opfDir, relativeHref);
                const fileRef = zip.file(fullPath);
                
                if (!fileRef) continue;

                const htmlContent = await fileRef.async("text");
                const chapterDoc = parser.parseFromString(htmlContent, "text/html");

                // Extract Chapter Title for TOC
                let chapterHeading = `Chapter ${i + 1}`;
                const headingEl = chapterDoc.querySelector('h1, h2, h3, title');
                if (headingEl && headingEl.textContent.trim()) {
                    chapterHeading = headingEl.textContent.trim();
                }

                // Convert images to Object URLs directly from ZIP
                const images = chapterDoc.querySelectorAll('img');
                for (let img of images) {
                    const src = img.getAttribute('src');
                    if (src && !src.startsWith('http') && !src.startsWith('data:')) {
                        const chapterDir = fullPath.includes("/") ? fullPath.substring(0, fullPath.lastIndexOf("/") + 1) : "";
                        const imgFullPath = resolvePath(chapterDir, src);
                        const imgFile = zip.file(imgFullPath);
                        
                        if (imgFile) {
                            const blob = await imgFile.async("blob");
                            const blobUrl = URL.createObjectURL(blob);
                            img.setAttribute('src', blobUrl);
                        }
                    }
                }

                // Create Chapter Section Block
                const chapterBlock = document.createElement('section');
                chapterBlock.className = 'chapter-block';
                chapterBlock.id = `chapter-${i}`;
                chapterBlock.innerHTML = chapterDoc.body ? chapterDoc.body.innerHTML : htmlContent;

                bookContent.appendChild(chapterBlock);

                // Add to TOC Drawer
                const tocItem = document.createElement('div');
                tocItem.className = 'toc-item';
                tocItem.textContent = chapterHeading;
                tocItem.addEventListener('click', () => {
                    chapterBlock.scrollIntoView({ behavior: 'smooth' });
                    closeDrawer();
                });
                tocList.appendChild(tocItem);
            }

            // Scroll container back to top
            scrollContainer.scrollTop = 0;

        } catch (err) {
            console.error(err);
            bookContent.innerHTML = `<p style="color:#ff5555; text-align:center; padding:20px;">Failed to load ePub: ${err.message}</p>`;
        }
    }

    // Path resolution helper for internal ePub paths
    function resolvePath(base, relative) {
        const stack = base.split("/").filter(p => p.length > 0);
        const parts = relative.split("/");
        
        for (const part of parts) {
            if (part === ".") continue;
            if (part === "..") {
                if (stack.length > 0) stack.pop();
            } else {
                stack.push(part);
            }
        }
        return stack.join("/");
    }
});
