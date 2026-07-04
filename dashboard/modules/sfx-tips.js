// ==========================================================
// SOUND EFFECTS AND TIPS MANAGEMENT (SFX-TIPS.JS)
// ==========================================================

// Audio pool for simultaneous SFX playback (supports up to 8 concurrent sounds)
let sfxAudioPool = [];
const SFX_POOL_SIZE = 8;
let atmosphereProgressInterval = null;

const initAudioPool = () => {
    const poolContainer = document.getElementById('sfx-players-pool');
    if (!poolContainer) return;
    
    for (let i = 0; i < SFX_POOL_SIZE; i++) {
        const audio = document.createElement('audio');
        audio.volume = 1;
        poolContainer.appendChild(audio);
        sfxAudioPool.push(audio);
    }
};

const getAvailableAudioFromPool = () => {
    // Find first stopped audio element or reuse the oldest one
    let availableAudio = sfxAudioPool.find(audio => audio.paused);
    
    if (!availableAudio) {
        // All are playing, reuse the first one
        availableAudio = sfxAudioPool[0];
        availableAudio.pause();
        availableAudio.currentTime = 0;
    }
    
    return availableAudio;
};

const updateProgressUI = (row, player) => {
    const seekBar = row.querySelector('.sfx-seekbar');
    const progressContainer = row.querySelector('.sfx-progress-container');

    if (!seekBar || !progressContainer) return;

    if (player.duration > 10) {
        progressContainer.classList.add('visible');
        const percentage = (player.currentTime / player.duration) * 100 || 0;
        seekBar.value = percentage;

        seekBar.style.background = `linear-gradient(to left, #212121 ${percentage}%, #cfcfcf ${percentage}%)`;
    } else {
        progressContainer.classList.remove('visible');
    }
};

const playSfxFile = (fileName, label = "افکت صوتی", row) => {
    if (!fileName) return;

    // Get an available audio element from the pool
    const audioElement = getAvailableAudioFromPool();
    const iconImg = row?.querySelector('.sfx-play-icon');

    audioElement.src = `../audio/${fileName}`;
    
    audioElement.play()
        .then(() => {
            if (iconImg) iconImg.src = window.STOP_ICON;
            if (window.notyf) window.notyf.success(`در حال پخش: ${label}`);
        })
        .catch(error => {
            if (window.notyf) window.notyf.error(`خطا در پخش فایل صوتی`);
            console.error('Audio playback failed:', error);
        });

    audioElement.ontimeupdate = () => {
        if (row) updateProgressUI(row, audioElement);
    };

    audioElement.onended = () => {
        if (iconImg) iconImg.src = window.PLAY_ICON;
        if (row) row.querySelector('.sfx-progress-container')?.classList.remove('visible');
    };
};

const playAtmosphere = (fileName, label = "اتمسفر شب", row) => {
    const atmospherePlayer = document.getElementById('atmosphere-player');
    if (!atmospherePlayer) return;

    atmospherePlayer.src = `../audio/${fileName}`;
    atmospherePlayer.loop = true;
    atmospherePlayer.volume = 0.6; // Slightly lower volume for background
    
    atmospherePlayer.play()
        .then(() => {
            if (window.notyf) window.notyf.success(`در حال پخش: ${label}`);
            // Start updating progress bar for atmosphere
            if (row) startAtmosphereProgress(atmospherePlayer, row);
        })
        .catch(error => {
            if (window.notyf) window.notyf.error(`خطا در پخش اتمسفر`);
            console.error('Atmosphere playback failed:', error);
        });
};

const startAtmosphereProgress = (atmospherePlayer, row) => {
    // Clear any existing interval
    if (atmosphereProgressInterval) clearInterval(atmosphereProgressInterval);
    
    atmosphereProgressInterval = setInterval(() => {
        if (atmospherePlayer.paused) {
            clearInterval(atmosphereProgressInterval);
            return;
        }
        updateProgressUI(row, atmospherePlayer);
    }, 100);
};

const stopAtmosphere = (row) => {
    const atmospherePlayer = document.getElementById('atmosphere-player');
    if (atmospherePlayer) {
        atmospherePlayer.pause();
        atmospherePlayer.currentTime = 0;
    }
    if (atmosphereProgressInterval) {
        clearInterval(atmosphereProgressInterval);
    }
    if (row) {
        const progressContainer = row.querySelector('.sfx-progress-container');
        if (progressContainer) progressContainer.classList.remove('visible');
    }
};

const renderSFXButtons = () => {
    if (!sfxButtonsContainer || !window.SOUND_EFFECTS_DATA) return;

    sfxButtonsContainer.innerHTML = '';

    for (const [groupName, files] of Object.entries(window.SOUND_EFFECTS_DATA)) {
        const row = document.createElement('div');
        row.className = 'sfx-row';
        row.setAttribute('data-group', groupName);

        const mainControls = document.createElement('div');
        mainControls.className = 'sfx-main-controls';

        const label = document.createElement('span');
        label.className = 'sfx-label';
        label.textContent = groupName;

        const select = document.createElement('select');
        select.className = 'sfx-select';

        files.forEach(f => {
            const option = document.createElement('option');
            option.value = f.file;
            option.textContent = f.label;
            select.appendChild(option);
        });

        const playBtn = document.createElement('button');
        playBtn.className = 'sfx-play-btn';
        const iconImg = document.createElement('img');
        iconImg.src = window.PLAY_ICON;
        iconImg.className = 'sfx-play-icon';
        playBtn.appendChild(iconImg);

        const progressContainer = document.createElement('div');
        progressContainer.className = 'sfx-progress-container';

        const seekBar = document.createElement('input');
        seekBar.type = 'range';
        seekBar.className = 'sfx-seekbar';
        seekBar.min = '0';
        seekBar.max = '100';
        seekBar.value = '0';

        seekBar.addEventListener('input', () => {
            // Check if this is an atmosphere group
            if (groupName === 'اتمسفر شب') {
                const atmospherePlayer = document.getElementById('atmosphere-player');
                if (atmospherePlayer && atmospherePlayer.duration) {
                    const percentage = seekBar.value;
                    atmospherePlayer.currentTime = (percentage / 100) * atmospherePlayer.duration;
                    seekBar.style.background = `linear-gradient(to left, #212121 ${percentage}%, #cfcfcf ${percentage}%)`;
                }
            } else {
                // For SFX, find from pool
                const currentPlayingAudio = sfxAudioPool.find(a => a.src.includes(select.value) && !a.paused);
                if (currentPlayingAudio) {
                    const percentage = seekBar.value;
                    currentPlayingAudio.currentTime = (percentage / 100) * currentPlayingAudio.duration;
                    seekBar.style.background = `linear-gradient(to left, #212121 ${percentage}%, #cfcfcf ${percentage}%)`;
                }
            }
        });

        progressContainer.appendChild(seekBar);
        mainControls.appendChild(playBtn);
        mainControls.appendChild(select);
        mainControls.appendChild(label);

        playBtn.addEventListener('click', () => {
            const selectedFile = select.value;
            const selectedLabel = select.options[select.selectedIndex].text;

            // Check if this is an atmosphere group
            if (groupName === 'اتمسفر شب') {
                const atmospherePlayer = document.getElementById('atmosphere-player');
                if (atmospherePlayer.src.includes(selectedFile) && !atmospherePlayer.paused) {
                    stopAtmosphere(row);
                    iconImg.src = window.PLAY_ICON;
                } else {
                    playAtmosphere(selectedFile, selectedLabel, row);
                    iconImg.src = window.STOP_ICON;
                }
            } else {
                // For SFX, use the pool system
                playSfxFile(selectedFile, selectedLabel, row);
            }
        });

        row.appendChild(mainControls);
        row.appendChild(progressContainer);
        sfxButtonsContainer.appendChild(row);
    }
};

const startTipRotation = () => {
    if (!tipText || !window.TIPS || window.TIPS.length === 0) return;
    let tipIndex = 0;
    tipText.textContent = window.TIPS[tipIndex];
    setInterval(() => {
        tipIndex = (tipIndex + 1) % window.TIPS.length;
        tipText.textContent = window.TIPS[tipIndex];
    }, 10000);
};

const initSfxTips = () => {
    initAudioPool();
    renderSFXButtons();
    if (window.TIPS && window.TIPS.length > 0) startTipRotation();
};

const playSfx = (fileName, label) => {
    const audioElement = getAvailableAudioFromPool();
    audioElement.src = `../audio/${fileName}`;
    audioElement.play().catch(error => console.error('SFX playback failed:', error));
};
