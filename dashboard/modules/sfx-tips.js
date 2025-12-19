// ==========================================================
// SOUND EFFECTS AND TIPS MANAGEMENT (SFX-TIPS.JS)
// ==========================================================

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
    if (!sfxPlayer || !fileName) return;

    if (!sfxPlayer.paused) {
        sfxPlayer.pause();
        sfxPlayer.currentTime = 0;
        document.querySelectorAll('.sfx-play-icon').forEach(img => img.src = window.PLAY_ICON);
        document.querySelectorAll('.sfx-progress-container').forEach(div => div.classList.remove('visible'));
    }

    sfxPlayer.src = `../audio/${fileName}`;
    const iconImg = row.querySelector('.sfx-play-icon');

    sfxPlayer.play()
        .then(() => {
            if (iconImg) iconImg.src = window.STOP_ICON;
            if (window.notyf) window.notyf.success(`در حال پخش: ${label}`);
        })
        .catch(error => {
            if (window.notyf) window.notyf.error(`خطا در پخش فایل صوتی`);
            console.error('Audio playback failed:', error);
        });

    sfxPlayer.ontimeupdate = () => updateProgressUI(row, sfxPlayer);

    sfxPlayer.onended = () => {
        if (iconImg) iconImg.src = window.PLAY_ICON;
        row.querySelector('.sfx-progress-container').classList.remove('visible');
    };
};

const renderSFXButtons = () => {
    if (!sfxButtonsContainer || !window.SOUND_EFFECTS_DATA) return;

    sfxButtonsContainer.innerHTML = '';

    for (const [groupName, files] of Object.entries(window.SOUND_EFFECTS_DATA)) {
        const row = document.createElement('div');
        row.className = 'sfx-row';

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
            if (sfxPlayer.src.includes(select.value)) {
                const percentage = seekBar.value;
                sfxPlayer.currentTime = (percentage / 100) * sfxPlayer.duration;
                seekBar.style.background = `linear-gradient(to left, #212121 ${percentage}%, #cfcfcf ${percentage}%)`;
            }
        });

        progressContainer.appendChild(seekBar);
        mainControls.appendChild(playBtn);
        mainControls.appendChild(select);
        mainControls.appendChild(label);

        playBtn.addEventListener('click', () => {
            const selectedFile = select.value;
            const selectedLabel = select.options[select.selectedIndex].text;

            if (sfxPlayer.src.includes(selectedFile) && !sfxPlayer.paused) {
                sfxPlayer.pause();
                iconImg.src = window.PLAY_ICON;
            } else {
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
    renderSFXButtons();
    if (window.TIPS && window.TIPS.length > 0) startTipRotation();
};

const playSfx = (fileName, label) => playSfxFile(fileName, label);