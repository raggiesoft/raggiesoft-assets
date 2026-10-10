function initOceanViewReader() {

    // --- SIDEBAR ---
    const sidebar = document.getElementById('stardust-sidebar');
    const toggleBtn = document.getElementById('stardust-sidebar-toggle');
    const backdrop = document.getElementById('reader-sidebar-backdrop');

    function toggleSidebar() {
        if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            if (backdrop) backdrop.style.display = 'none';
        } else if (sidebar) {
            sidebar.classList.add('open');
            if (backdrop) backdrop.style.display = 'block';
        }
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
    }
    if (backdrop) {
        backdrop.addEventListener('click', toggleSidebar);
    }


    // --- OLIVER DATETIME ---
    const dtEl = document.getElementById('story-datetime-display');
    if (dtEl) {
        const iso = dtEl.getAttribute('data-iso');
        if (iso) {
            try {
                const d = new Date(iso);
                const iana = dtEl.getAttribute('data-iana');
                const options = { 
                    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', 
                    hour: 'numeric', minute: '2-digit', timeZoneName: 'short' 
                };
                if (iana) {
                    options.timeZone = iana;
                }
                const formatter = new Intl.DateTimeFormat('en-US', options);
                const txt = dtEl.querySelector('.dt-text');
                if(txt) txt.textContent = formatter.format(d);
            } catch(e) {}
        }
    }


    // --- OLIVER AUDIO ---
    const audioEl = document.getElementById('narrative-audio-element');
    const loopBtn = document.getElementById('narrative-audio-loop-toggle');
    const lyricsBtn = document.getElementById('narrative-audio-lyrics-toggle');
    const lyricsDialog = document.getElementById('narrative-lyrics-dialog');
    const lyricsTitle = document.getElementById('narrative-lyrics-title');
    const lyricsContent = document.getElementById('narrative-lyrics-content');
    const playToggleBtn = document.getElementById('narrative-audio-play-toggle');
    const playIcon = document.getElementById('narrative-audio-play-icon');
    const scrubber = document.getElementById('narrative-audio-scrubber');
    const currentTimeDisplay = document.getElementById('narrative-audio-current');
    const durationDisplay = document.getElementById('narrative-audio-duration');
    
    if (audioEl && playToggleBtn) {
        const startTime = parseFloat(audioEl.getAttribute('data-start-time') || 0);

        function formatTime(secs) {
            if (isNaN(secs)) return '0:00';
            const m = Math.floor(secs / 60);
            const s = Math.floor(secs % 60);
            return m + ':' + (s < 10 ? '0' : '') + s;
        }
        
        playToggleBtn.addEventListener('click', () => {
            if (audioEl.paused) {
                audioEl.play().catch(e => console.warn(e));
            } else {
                audioEl.pause();
            }
        });
        
        audioEl.addEventListener('play', () => {
            if(playIcon) {
                playIcon.classList.remove('ph-play');
                playIcon.classList.add('ph-pause');
            }
        });
        audioEl.addEventListener('pause', () => {
            if(playIcon) {
                playIcon.classList.remove('ph-pause');
                playIcon.classList.add('ph-play');
            }
        });
        
        audioEl.addEventListener('loadedmetadata', () => {
            if(scrubber) scrubber.max = audioEl.duration;
            if(durationDisplay) durationDisplay.textContent = formatTime(audioEl.duration);
            if (startTime > 0 && audioEl.currentTime < startTime) {
                audioEl.currentTime = startTime;
            }
        });
        
        audioEl.addEventListener('timeupdate', () => {
            if (scrubber && !scrubber.matches(':active')) {
                scrubber.value = audioEl.currentTime;
                if(currentTimeDisplay) currentTimeDisplay.textContent = formatTime(audioEl.currentTime);
            }
        });
        
        if (scrubber) {
            scrubber.addEventListener('input', () => {
                if(currentTimeDisplay) currentTimeDisplay.textContent = formatTime(scrubber.value);
            });
            scrubber.addEventListener('change', () => {
                audioEl.currentTime = scrubber.value;
            });
        }
    }
    const lyricsClose = document.getElementById('narrative-lyrics-close');
    
    if (lyricsClose && lyricsDialog) {
        lyricsClose.addEventListener('click', () => {
            lyricsDialog.close();
        });
    }
    
    if (lyricsBtn && lyricsDialog) {
        lyricsBtn.addEventListener('click', () => {
            const title = lyricsBtn.getAttribute('data-title');
            const url = lyricsBtn.getAttribute('data-url');
            
            if(lyricsTitle) lyricsTitle.textContent = title;
            if(lyricsContent) lyricsContent.innerHTML = '<div style="text-align: center; padding: 1rem; opacity: 0.7;">Retrieving data from the Vault...</div>';
            lyricsDialog.showModal();
            
            fetch(url + "?v=" + Date.now())
                .then(res => {
                    if (!res.ok) throw new Error("Lore file not found.");
                    return res.text();
                })
                .then(text => {
                    let rawBlocks = text.split(/\n\s*\n/);
                    let htmlOutput = rawBlocks.map(block => {
                        if (block.trim() === '') return '';
                        let lines = block.split('\n');
                        let headerHtml = '';
                        let contentLines = [];
                        
                        lines.forEach(line => {
                            line = line.trim();
                            if (line === '') return;
                            
                            if (line.match(/^#+\s+/)) {
                                let headerLevel = line.match(/^#+/)[0].length;
                                let headerText = line.replace(/^#+\s+/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                                if (headerLevel === 1) return;
                                let hClass = (headerLevel === 3 && line.includes('LORE NOTE:')) 
                                    ? 'style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; color: var(--rs-primary); letter-spacing: 1px; margin-bottom: 0.5rem;"' 
                                    : 'style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;"';
                                headerHtml += `<div ${hClass}>${headerText}</div>`;
                            } else {
                                contentLines.push(line);
                            }
                        });
                        
                        let processedBody = contentLines.map(line => {
                            let parsedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                            parsedLine = parsedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
                            parsedLine = parsedLine.replace(/~~(.*?)~~/g, '<del>$1</del>');
                            return parsedLine;
                        });
                        
                        if (contentLines.length === 0) return `<div style="margin-bottom: 1.5rem;">${headerHtml}</div>`;
                        
                        return `
                            <div style="margin-bottom: 1.5rem;">
                                ${headerHtml}
                                <div style="line-height: 1.6;">${processedBody.join('<br>')}</div>
                            </div>`;
                    }).join('');
                    
                    if(lyricsContent) lyricsContent.innerHTML = htmlOutput;
                })
                .catch(err => {
                    if(lyricsContent) lyricsContent.innerHTML = '<div style="color: #dc3545; padding: 1rem; border: 1px solid #dc3545; border-radius: 6px; background: rgba(220,53,69,0.1);">Data Corrupted. Unable to retrieve lyrics.</div>';
                });
        });
    }
    
    if (audioEl) {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: audioEl.getAttribute('data-title') || '',
                artist: audioEl.getAttribute('data-artist') || '',
                album: audioEl.getAttribute('data-album') || '',
                artwork: [
                    { src: audioEl.getAttribute('data-artwork') || '', sizes: '512x512', type: 'image/jpeg' }
                ]
            });
            navigator.mediaSession.setActionHandler('play', () => audioEl.play());
            navigator.mediaSession.setActionHandler('pause', () => audioEl.pause());
        }
        
        const lsSettings = localStorage.getItem('reader-settings');
        if (lsSettings) {
            try {
                const parsed = JSON.parse(lsSettings);
                if (parsed.autoPlayAudio === 'true') {
                    audioEl.play().catch(err => {
                        console.warn("Autoplay blocked by browser. User must interact first.", err);
                    });
                }
            } catch(e) {}
        }
    }

    if (audioEl && loopBtn) {
        const icon = loopBtn.querySelector('i');
        loopBtn.addEventListener('click', () => {
            audioEl.loop = !audioEl.loop;
            if (audioEl.loop) {
                if(icon) {
                    icon.classList.remove('ph-repeat');
                    icon.classList.add('ph-repeat-once');
                }
                loopBtn.style.borderColor = 'var(--rs-primary)';
                loopBtn.style.color = 'var(--rs-primary)';
                loopBtn.style.background = 'rgba(0,0,0,0.05)';
                loopBtn.setAttribute('title', 'Repeat 1 Track: ON');
                loopBtn.setAttribute('aria-label', 'Toggle Repeat: ON');
            } else {
                if(icon) {
                    icon.classList.remove('ph-repeat-once');
                    icon.classList.add('ph-repeat');
                }
                loopBtn.style.borderColor = 'var(--rs-border)';
                loopBtn.style.color = 'inherit';
                loopBtn.style.background = 'transparent';
                loopBtn.setAttribute('title', 'Repeat 1 Track: OFF');
                loopBtn.setAttribute('aria-label', 'Toggle Repeat: OFF');
            }
        });
    }


    // --- SETTINGS DIALOG ---
    const dialog = document.getElementById('reader-settings-dialog');
    const btnOpen = document.getElementById('reader-settings-toggle');
    const btnClose = document.getElementById('close-settings-btn');
    
    const contentBody = document.querySelector('.story-content');
    const themeSelect = document.getElementById('reader-theme-select');
    const widthSelect = document.getElementById('reader-width-select');
    const fontSelect = document.getElementById('reader-font-select');
    const audioSelect = document.getElementById('reader-audio-select');
    const customThemeToggle = document.getElementById('reader-custom-theme-toggle');
    const readerPage = document.querySelector('.reader-page');
    const btnResetAll = document.getElementById('reader-settings-reset-all');
    const btnRunWizard = document.getElementById('reader-run-wizard-btn');
    const tabBtns = document.querySelectorAll('.settings-tab');
    const tabContents = document.querySelectorAll('.settings-tab-content');
    
    if (tabBtns) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => { e.preventDefault();
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.style.display = 'none');
                btn.classList.add('active');
                document.getElementById('settings-tab-' + btn.dataset.tab).style.display = 'block';
            });
        });
    }
    
    const btnIncrease = document.getElementById('btn-text-increase');
    const btnDecrease = document.getElementById('btn-text-decrease');
    const btnReset = document.getElementById('btn-text-reset');

    let currentFontSize = 1.15; 
    let currentWidth = 'default';
    let currentFontFamily = 'system-ui, -apple-system, sans-serif';
    let currentAutoPlayAudio = 'false';
    let currentCustomThemeEnabled = true;

    try {
        const stored = localStorage.getItem('reader-settings');
        if (stored) {
            const settings = JSON.parse(stored);
            if (settings.theme) { applyTheme(settings.theme, settings.customThemeEnabled !== false); } else { applyTheme('auto', settings.customThemeEnabled !== false); }
            if (settings.fontSize) applyFontSize(settings.fontSize);
            if (settings.width) { applyWidth(settings.width); } else { applyWidth('default'); }
            if (settings.fontFamily) { applyFontFamily(settings.fontFamily); } else { applyFontFamily('system-ui, -apple-system, sans-serif'); }
            if (settings.autoPlayAudio) { applyAudioSetting(settings.autoPlayAudio); } else { applyAudioSetting('false'); }
        } else {
            applyTheme('auto', true);
            applyWidth('default');
            applyFontFamily('system-ui, -apple-system, sans-serif');
            applyAudioSetting('false');
        }
    } catch (e) {
        applyTheme('auto', true);
        applyWidth('default');
        applyFontFamily('system-ui, -apple-system, sans-serif');
        applyAudioSetting('false');
    }

    function applyFontSize(size) {
        currentFontSize = size;
        if (contentBody) contentBody.style.fontSize = `${size}rem`;
        saveSettings();
    }

    if (btnIncrease) btnIncrease.addEventListener('click', () => applyFontSize(Math.min(currentFontSize + 0.1, 2.5)));
    if (btnDecrease) btnDecrease.addEventListener('click', () => applyFontSize(Math.max(currentFontSize - 0.1, 0.8)));
    if (btnReset) btnReset.addEventListener('click', () => applyFontSize(1.15));

    function applyTheme(theme, customEnabled = true) {
        currentCustomThemeEnabled = customEnabled;
        if (customThemeToggle) customThemeToggle.checked = customEnabled;
        const wizCustomTheme = document.getElementById('wizard-custom-theme-toggle');
        if (wizCustomTheme) wizCustomTheme.checked = customEnabled;
        
        document.body.classList.remove('theme-light', 'theme-dark', 'theme-sepia', 'theme-dark-sepia', 'theme-sepia-system', 'theme-auto', 'theme-custom');
        
        const customThemeMeta = document.querySelector('meta[name="stardust-narrative-theme"]');
        const narrativeTheme = customThemeMeta ? customThemeMeta.getAttribute('content') : null;
        const customThemeLink = document.getElementById('narrative-theme-css');
        
        if (narrativeTheme) {
            document.body.classList.remove(`theme-${narrativeTheme}`);
        }
        document.body.className = document.body.className.replace(/narrative-theme-[a-zA-Z0-9_-]+/g, '').trim();

        // ALWAYS apply the base theme class (e.g. theme-auto, theme-dark) as a fallback
        document.body.classList.add(`theme-${theme}`);

        if (currentCustomThemeEnabled && narrativeTheme && narrativeTheme.trim() !== '') {
            document.body.classList.add('theme-custom');
            document.body.classList.add(`theme-${narrativeTheme}`);
            if (customThemeLink) customThemeLink.disabled = false;
        } else {
            if (customThemeLink) customThemeLink.disabled = true;
        }
        
        if (themeSelect) themeSelect.value = theme;
        saveSettings();
    }

    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => applyTheme(e.target.value, currentCustomThemeEnabled));
    }
    if (customThemeToggle) {
        customThemeToggle.addEventListener('change', (e) => applyTheme(themeSelect ? themeSelect.value : 'auto', e.target.checked));
    }

    function applyWidth(width) {
        currentWidth = width;
        if (readerPage) {
            if (width === 'wide') {
                readerPage.style.maxWidth = '1200px';
            } else if (width === 'full') {
                readerPage.style.maxWidth = '100%';
            } else {
                readerPage.style.maxWidth = '800px';
            }
        }
        if (widthSelect) widthSelect.value = width;
        saveSettings();
    }
    
    if (widthSelect) widthSelect.addEventListener('change', (e) => applyWidth(e.target.value));

    function applyFontFamily(font) {
        currentFontFamily = font;
        if (contentBody) contentBody.style.fontFamily = font;
        if (fontSelect) fontSelect.value = font;
        saveSettings();
    }

    if (fontSelect) fontSelect.addEventListener('change', (e) => applyFontFamily(e.target.value));

    function applyAudioSetting(val) {
        currentAutoPlayAudio = val;
        if (audioSelect) audioSelect.value = val;
        saveSettings();
    }
    if (audioSelect) audioSelect.addEventListener('change', (e) => applyAudioSetting(e.target.value));
    
    if (btnResetAll) {
        btnResetAll.addEventListener('click', () => {
            applyFontSize(1.15);
            applyTheme('auto', true);
            applyWidth('default');
            applyFontFamily('system-ui, -apple-system, sans-serif');
            applyAudioSetting('false');
            if (dialog) dialog.close();
        });
    }

    function saveSettings() {
        localStorage.setItem('reader-settings', JSON.stringify({
            theme: themeSelect ? themeSelect.value : 'auto',
            customThemeEnabled: currentCustomThemeEnabled,
            fontSize: currentFontSize,
            width: currentWidth,
            fontFamily: currentFontFamily,
            autoPlayAudio: currentAutoPlayAudio
        }));
    }

    const wizardDialog = document.getElementById('reader-wizard-dialog');
    const hasCompletedWizard = localStorage.getItem('rs-wizard-completed');

    if (btnOpen) {
        btnOpen.addEventListener('click', () => {
            if (localStorage.getItem('rs-wizard-completed')) {
                if (dialog) dialog.showModal();
            } else {
                if (wizardDialog) {
                    wizardDialog.showModal();
                    updateWizardState();
                }
            }
        });
    }
    if (btnClose && dialog) btnClose.addEventListener('click', () => dialog.close());

    let currentStep = 1;
    const totalSteps = 6;
    const wizardSidebar = document.getElementById('wizard-sidebar-graphic');
    const btnNext = document.getElementById('wizard-btn-next');
    const btnPrev = document.getElementById('wizard-btn-prev');
    const btnFinish = document.getElementById('wizard-btn-finish');
    
    window.runWelcomeWizard = function() {
        localStorage.removeItem('rs-wizard-completed');
        if (dialog && dialog.open) dialog.close();
        currentStep = 1;
        if (wizardDialog) {
            wizardDialog.showModal();
            updateWizardState();
        }
    };
    
    const wizTheme = document.getElementById('wizard-theme-select');
    const wizWidth = document.getElementById('wizard-width-select');
    const wizFont = document.getElementById('wizard-font-select');
    const wizAudio = document.getElementById('wizard-audio-select');
    const wizCustomTheme = document.getElementById('wizard-custom-theme-toggle');
    
    if (wizTheme) wizTheme.value = themeSelect ? themeSelect.value : 'auto';
    if (wizWidth) wizWidth.value = widthSelect ? widthSelect.value : 'default';
    if (wizFont) wizFont.value = fontSelect ? fontSelect.value : 'system-ui, -apple-system, sans-serif';
    if (wizAudio) wizAudio.value = audioSelect ? audioSelect.value : 'false';
    if (wizCustomTheme && customThemeToggle) wizCustomTheme.checked = customThemeToggle.checked;

    if (wizTheme) wizTheme.addEventListener('change', (e) => applyTheme(e.target.value, currentCustomThemeEnabled));
    if (wizWidth) wizWidth.addEventListener('change', (e) => applyWidth(e.target.value));
    if (wizFont) wizFont.addEventListener('change', (e) => applyFontFamily(e.target.value));
    if (wizAudio) wizAudio.addEventListener('change', (e) => applyAudioSetting(e.target.value));
    if (wizCustomTheme) wizCustomTheme.addEventListener('change', (e) => applyTheme(themeSelect ? themeSelect.value : 'auto', e.target.checked));

    function updateWizardState() {
        for(let i = 1; i <= totalSteps; i++) {
            const stepEl = document.getElementById('wizard-step-' + i);
            if (stepEl) stepEl.style.display = 'none';
        }
        const currentEl = document.getElementById('wizard-step-' + currentStep);
        if (currentEl) currentEl.style.display = 'block';
        
        let cdnUrl = '';
        if (wizardDialog) cdnUrl = wizardDialog.getAttribute('data-cdn-url');
        const stepImages = {
            1: cdnUrl + '/stardust-engine-library/images/wizard/isabel_oliver_hug.jpg',
            2: cdnUrl + '/stardust-engine-library/images/wizard/eleanor_oliver_hug.jpg',
            3: cdnUrl + '/stardust-engine-library/images/wizard/sophia_oliver_hug.jpg',
            4: cdnUrl + '/stardust-engine-library/images/wizard/sophia_isabel_audio.jpg',
            5: cdnUrl + '/stardust-engine-library/images/wizard/eleanor_isabel_twins.jpg',
            6: cdnUrl + '/stardust-engine-library/images/wizard/isabel_oliver_hug.jpg'
        };

        if (wizardSidebar && stepImages[currentStep]) {
            wizardSidebar.style.backgroundImage = `url('${stepImages[currentStep]}')`;
        }

        if (btnPrev) btnPrev.style.visibility = currentStep > 1 ? 'visible' : 'hidden';
        
        if (currentStep === totalSteps) {
            if (btnNext) btnNext.style.display = 'none';
            if (btnFinish) btnFinish.style.display = 'block';
        } else {
            if (btnNext) btnNext.style.display = 'block';
            if (btnFinish) btnFinish.style.display = 'none';
        }
    }

    if (btnNext) {
        btnNext.addEventListener('click', () => {
            if (currentStep < totalSteps) {
                currentStep++;
                updateWizardState();
            }
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateWizardState();
            }
        });
    }

    if (btnFinish) {
        btnFinish.addEventListener('click', () => {
            localStorage.setItem('rs-wizard-completed', 'true');
            if (wizardDialog) wizardDialog.close();
        });
    }

    const readerTitle = document.getElementById('reader-settings-title');
    const devTesterDialog = document.getElementById('dev-theme-tester-dialog');
    const btnCloseDevTester = document.getElementById('close-dev-tester-btn');
    
    if (readerTitle && devTesterDialog) {
        let clickCount = 0;
        let clickTimer = null;
        
        readerTitle.addEventListener('click', () => {
            clickCount++;
            if (clickCount >= 5) {
                if (dialog) dialog.close();
                devTesterDialog.showModal();
                clickCount = 0;
            }
            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => { clickCount = 0; }, 2000);
        });
        
        const revertTheme = () => {
            devTesterDialog.close();
            let meta = document.querySelector('meta[name="stardust-narrative-theme"]');
            if (meta) meta.remove();
            let link = document.getElementById('narrative-theme-css');
            if (link) link.remove();
            applyTheme(themeSelect ? themeSelect.value : 'auto', customToggle ? customToggle.checked : true);
        };
        
        if (btnCloseDevTester) btnCloseDevTester.addEventListener('click', revertTheme);
        devTesterDialog.addEventListener('close', revertTheme);
    }
    
    const devThemeInput = document.getElementById('dev-theme-select');
    const devThemeApply = document.getElementById('dev-theme-apply');
    const devThemeForceMode = document.getElementById('dev-theme-force-mode');
    
    if (devThemeApply && devThemeInput && devThemeForceMode) {
        devThemeInput.addEventListener('change', () => {
            const selectedOption = devThemeInput.options[devThemeInput.selectedIndex];
            if (selectedOption && selectedOption.dataset.supportsModes === 'false') {
                devThemeForceMode.disabled = true;
                devThemeForceMode.value = 'auto';
                devThemeForceMode.title = "This theme has a fixed aesthetic and does not support toggling light/dark modes.";
                devThemeForceMode.style.opacity = '0.5';
            } else {
                devThemeForceMode.disabled = false;
                devThemeForceMode.title = "";
                devThemeForceMode.style.opacity = '1';
            }
        });

        devThemeApply.addEventListener('click', () => {
            const themeName = devThemeInput.value.trim();
            if (themeName) {
                let meta = document.querySelector('meta[name="stardust-narrative-theme"]');
                if (!meta) {
                    meta = document.createElement('meta');
                    meta.name = 'stardust-narrative-theme';
                    document.head.appendChild(meta);
                }
                meta.setAttribute('content', themeName);
                
                let link = document.getElementById('narrative-theme-css');
                if (!link) {
                    link = document.createElement('link');
                    link.id = 'narrative-theme-css';
                    link.rel = 'stylesheet';
                    document.head.appendChild(link);
                }
                let cdnUrl = '';
                if (devTesterDialog) cdnUrl = devTesterDialog.getAttribute('data-cdn-url');
                link.href = cdnUrl + '/raggiesoft-books/css/themes/' + themeName + '.css';
                
                setTimeout(() => {
                    applyTheme(themeSelect ? themeSelect.value : 'auto', customThemeToggle ? customThemeToggle.checked : true);
                    
                    if (devThemeForceMode.value === 'light') {
                        document.body.classList.add('theme-light');
                        document.body.classList.remove('theme-dark', 'theme-auto');
                    } else if (devThemeForceMode.value === 'dark') {
                        document.body.classList.add('theme-dark');
                        document.body.classList.remove('theme-light', 'theme-auto');
                    } else {
                        document.body.classList.remove('theme-light', 'theme-dark');
                    }
                }, 50);
            }
        });
    }

    // --- Library Management Logic ---
    const libraryList = document.getElementById('library-management-list');
    
    // Always apply hidden books to the catalog if cards exist
    const applyHiddenBooks = () => {
        let hiddenBooks = [];
        try {
            hiddenBooks = JSON.parse(localStorage.getItem('rs-hidden-books') || '[]');
        } catch(e) {}
        
        const cards = document.querySelectorAll('.rs-book-card');
        cards.forEach(card => {
            if (hiddenBooks.includes(card.dataset.slug)) {
                card.style.display = 'none';
            } else {
                card.style.display = 'flex';
            }
        });
    };
    
    // Call it immediately so books hide on catalog load
    applyHiddenBooks();

    // Offline caching functions
    async function downloadBookForOffline(slug) {
        const cdnBase = document.body.dataset.cdnUrl || 'https://assets.raggiesoft.com';
        try {
            console.log('Downloading book for offline: ' + slug);
            const res = await fetch(`${cdnBase}/raggiesoft-books/books/${slug}/toc.json`);
            if (!res.ok) return;
            const toc = await res.json();
            
            let files = [
                `${cdnBase}/raggiesoft-books/images/covers/2x3/${slug}.jpg`,
                `${cdnBase}/raggiesoft-books/books/${slug}/__SERIES_LANDING__`,
                `${cdnBase}/raggiesoft-books/books/${slug}/__TOC__`
            ];
            
            if (toc.books) {
                toc.books.forEach(b => {
                    files.push(`${cdnBase}/raggiesoft-books/books/${slug}/${b.id}/__BOOK_TOC__|${b.id}`);
                    if (b.chapters) {
                        b.chapters.forEach(c => {
                            files.push(`${cdnBase}/raggiesoft-books/books/${slug}/${b.id}/${c.id}/__CHAP_TOC__|${b.id}|${c.id}`);
                            if (c.parts) {
                                c.parts.forEach(p => {
                                    files.push(`${cdnBase}/raggiesoft-books/books/${slug}/${b.id}/${c.id}/${p.file}`);
                                });
                            }
                        });
                    }
                });
            }
            
            // Prefetch each file, allowing SW to cache it
            for (let url of files) {
                fetch(url, { mode: 'cors' }).catch(e => console.log('Offline fetch error:', e));
            }
        } catch(e) {
            console.error('Failed to download book for offline:', e);
        }
    }

    async function removeBookFromOffline(slug) {
        try {
            console.log('Removing book from offline cache: ' + slug);
            const cacheKeys = ['ova-dynamic-v4', 'ova-images-v4'];
            for (let cName of cacheKeys) {
                const cache = await caches.open(cName);
                const reqs = await cache.keys();
                for (let req of reqs) {
                    if (req.url.includes(`/books/${slug}/`) || req.url.includes(`covers/2x3/${slug}.jpg`)) {
                        await cache.delete(req);
                    }
                }
            }
        } catch(e) {
            console.error('Failed to remove book from cache:', e);
        }
    }

    if (libraryList) {
        // Populate the list (only once)
        if (libraryList.children.length === 0) {
            const cdnBase = document.body.dataset.cdnUrl || 'https://assets.raggiesoft.com';
            fetch(`${cdnBase}/raggiesoft-books/books/catalog.json`)
                .then(res => res.json())
                .then(books => {
                    let hiddenBooks = [];
                    try { hiddenBooks = JSON.parse(localStorage.getItem('rs-hidden-books') || '[]'); } catch(e) {}
                    
                    books.forEach(book => {
                        const isHidden = hiddenBooks.includes(book.slug);
                        
                        const item = document.createElement('div');
                        item.style = 'display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--rs-surface); border: 1px solid var(--rs-border); border-radius: 8px;';
                        
                        const titleDiv = document.createElement('div');
                        titleDiv.style = 'font-weight: 600; color: var(--rs-heading); font-size: 0.95rem;';
                        titleDiv.textContent = book.title;
                        
                        // Create a toggle switch
                        const label = document.createElement('label');
                        label.style = 'position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer;';
                        
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.checked = !isHidden;
                        checkbox.style = 'opacity: 0; width: 0; height: 0;';
                        
                        const slider = document.createElement('span');
                        slider.style = 'position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--rs-border); transition: .4s; border-radius: 24px;';
                        
                        const knob = document.createElement('span');
                        knob.style = 'position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%;';
                        
                        const updateSwitchUI = () => {
                            if (checkbox.checked) {
                                slider.style.backgroundColor = 'var(--rs-primary)';
                                knob.style.transform = 'translateX(20px)';
                            } else {
                                slider.style.backgroundColor = 'var(--rs-border)';
                                knob.style.transform = 'translateX(0)';
                            }
                        };
                        updateSwitchUI();
                        
                        checkbox.addEventListener('change', async (e) => {
                            updateSwitchUI();
                            let currentHidden = [];
                            try { currentHidden = JSON.parse(localStorage.getItem('rs-hidden-books') || '[]'); } catch(e) {}
                            
                            if (!e.target.checked) {
                                if (!currentHidden.includes(book.slug)) currentHidden.push(book.slug);
                                await removeBookFromOffline(book.slug);
                            } else {
                                currentHidden = currentHidden.filter(s => s !== book.slug);
                                await downloadBookForOffline(book.slug);
                            }
                            localStorage.setItem('rs-hidden-books', JSON.stringify(currentHidden));
                            applyHiddenBooks();
                        });
                        
                        slider.appendChild(knob);
                        label.appendChild(checkbox);
                        label.appendChild(slider);
                        
                        item.appendChild(titleDiv);
                        item.appendChild(label);
                        libraryList.appendChild(item);
                    });
                })
                .catch(err => console.error("Could not load catalog for management", err));
        }
    }
    // --- KEYBOARD SHORTCUTS ---
    function showShortcutToast(msg) {
        let toast = document.getElementById('shortcut-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'shortcut-toast';
            toast.style.position = 'fixed';
            toast.style.bottom = '2rem';
            toast.style.left = '50%';
            toast.style.transform = 'translateX(-50%)';
            toast.style.backgroundColor = 'var(--rs-primary)';
            toast.style.color = '#fff';
            toast.style.padding = '0.5rem 1rem';
            toast.style.borderRadius = '30px';
            toast.style.fontWeight = '600';
            toast.style.fontSize = '0.9rem';
            toast.style.zIndex = '9999';
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.2s';
            toast.style.pointerEvents = 'none';
            toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.style.opacity = '1';
        
        if (toast.hideTimeout) clearTimeout(toast.hideTimeout);
        toast.hideTimeout = setTimeout(() => {
            toast.style.opacity = '0';
        }, 1500);
    }

    document.addEventListener('keydown', (e) => {
        // Ignore if typing in an input
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) {
            return;
        }

        // Ignore if modifier keys are pressed
        if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
            return;
        }

        // T: Toggle Theme
        if (e.key.toLowerCase() === 't') {
            e.preventDefault();
            const customThemeMeta = document.querySelector('meta[name="stardust-narrative-theme"]');
            const hasCustom = customThemeMeta !== null;
            
            let currentTheme = themeSelect ? themeSelect.value : 'auto';
            let customOn = currentCustomThemeEnabled;
            
            // Define the sequence of states: {theme: '...', custom: boolean, label: '...'}
            let sequence = [];
            if (hasCustom) {
                sequence.push({theme: 'auto', custom: true, label: 'Immersive Story Theme'});
            }
            sequence.push({theme: 'auto', custom: false, label: 'System Default Theme'});
            sequence.push({theme: 'sepia-system', custom: false, label: 'System Sepia Theme'});
            sequence.push({theme: 'light', custom: false, label: 'Light Mode'});
            sequence.push({theme: 'dark', custom: false, label: 'Dark Mode'});
            sequence.push({theme: 'sepia', custom: false, label: 'Sepia Mode'});
            sequence.push({theme: 'dark-sepia', custom: false, label: 'Dark Sepia Mode'});
            
            // Find current index
            let currentIndex = sequence.findIndex(s => s.theme === currentTheme && s.custom === customOn);
            if (currentIndex === -1) currentIndex = 0; // Fallback
            
            let nextIndex = (currentIndex + 1) % sequence.length;
            let nextState = sequence[nextIndex];
            
            applyTheme(nextState.theme, nextState.custom);
            showShortcutToast(nextState.label);
        }

        // N or Right Arrow: Next Chapter
        if (e.key.toLowerCase() === 'n' || e.key === 'ArrowRight') {
            const nextBtn = document.getElementById('reader-btn-next');
            if (nextBtn && nextBtn.tagName === 'A' && nextBtn.href) {
                showShortcutToast("Next Chapter \u2192");
                window.location.href = nextBtn.href;
            }
        }

        // P or Left Arrow: Previous Chapter
        if (e.key.toLowerCase() === 'p' || e.key === 'ArrowLeft') {
            const prevBtn = document.getElementById('reader-btn-prev');
            if (prevBtn && prevBtn.tagName === 'A' && prevBtn.href) {
                showShortcutToast("\u2190 Previous Chapter");
                window.location.href = prevBtn.href;
            }
        }

        // F: Toggle Fullscreen
        if (e.key.toLowerCase() === 'f') {
            e.preventDefault();
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.warn(`Error attempting to enable full-screen mode: ${err.message}`);
                });
                showShortcutToast("Fullscreen Mode");
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                    showShortcutToast("Exited Fullscreen");
                }
            }
        }

        // Esc: Return to library (only if not in a dialog or fullscreen)
        if (e.key === 'Escape') {
            // Check if any dialog is open
            const dialogs = document.querySelectorAll('dialog[open]');
            if (dialogs.length > 0) return; // Let default Escape behavior close the dialog
            
            if (document.fullscreenElement) return; // Let default Escape behavior exit fullscreen

            const sidebar = document.getElementById('stardust-sidebar');
            if (sidebar && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                const backdrop = document.getElementById('reader-sidebar-backdrop');
                if (backdrop) backdrop.style.display = 'none';
                return;
            }
        }
    });
} // end initOceanViewReader()

// Prevent duplicate event listeners
if (!window.oceanViewReaderInitialized) {
    document.addEventListener('DOMContentLoaded', initOceanViewReader);
    document.addEventListener('stardust:loaded', initOceanViewReader);
    window.oceanViewReaderInitialized = true;
}


// Update last read location (except on catalog root)
if (window.location.pathname !== '/' && window.location.pathname !== '/catalog') {
    localStorage.setItem('rs-last-read', window.location.pathname);
}
