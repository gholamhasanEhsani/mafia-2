// ==========================================================
// TIMER CONTROL MODULE (TIMER.JS)
// Requires constants and helper functions from utils.js
// ==========================================================

// Global Timer Variables
let timerInterval;
let currentModeKey = 'NORMAL';
let currentTime = DEFAULT_TIMES.NORMAL;
let isRunning = false;
let isPausedByUser = false;
const MIN_TIMER_SECONDS = 5;
const TIME_STEP = 5;

// Utility to extract mode name from button text
const extractModeName = fullText => fullText.split('(')[0].trim();

const loadTimeForMode = (modeKey) => {
    const key = LS_KEY[modeKey];
    const savedTime = getLocalStorageItem(key);

    if (savedTime !== null && typeof savedTime === 'number' && savedTime > 0) {
        return savedTime;
    }
    return DEFAULT_TIMES[modeKey] || 60;
};

// Saves the user-adjusted time to Local Storage
const saveCurrentTime = () => {
    const key = LS_KEY[currentModeKey];
    setLocalStorageItem(key, currentTime);
};

const updateDisplay = () => {
    if (timerDisplay) {
        timerDisplay.textContent = formatTime(currentTime);
    }
};

// Updates timer icon source and alt text
const updateToggleButton = () => {
    if (timerIcon) {
        timerIcon.src = isRunning ? STOP_ICON : PLAY_ICON;
        timerIcon.alt = isRunning ? 'مکث' : 'شروع';
    }
};

// --- Core Timer Logic ---

const tick = () => {
    if (!isRunning) return;

    currentTime--;
    updateDisplay();

    if (currentTime <= 0) {
        stopTimer(false);
        notyf.success('🔔 زمان به پایان رسید!', 5000);
        // Play sound effect logic
        if (typeof playSfxFile === 'function' && window.SOUND_EFFECTS_DATA) {
            const bellGroup = window.SOUND_EFFECTS_DATA['زنگ پایان تایمر'];
            const bellSfx = bellGroup && bellGroup.find(s => s.file === 'bell-98033.mp3');
            if (bellSfx) {
                playSfxFile(bellSfx.file, bellSfx.label, undefined, true);
            }
        }
    }
};

const startTimer = () => {
    if (isRunning) return;

    // If timer already finished (time is at 0), reset to the active mode's duration before starting again
    if (currentTime <= 0) {
        const activeModeBtn = document.querySelector('.timer-mode-btn.solid');
        currentTime = activeModeBtn ? parseInt(activeModeBtn.getAttribute('data-time')) : DEFAULT_TIMES[currentModeKey];
        updateDisplay();
    }

    isRunning = true;
    isPausedByUser = false;
    timerInterval = setInterval(tick, 1000);
    updateToggleButton();
};

const stopTimer = (isManualPause = true) => {
    if (!isRunning && !isManualPause) return;

    clearInterval(timerInterval);
    isRunning = false;
    isPausedByUser = isManualPause;
    updateToggleButton();
};

const toggleTimer = () => {
    if (isRunning) {
        stopTimer(true);
    } else {
        startTimer();
    }
};

// --- Mode and Time Management ---

const handleModeChange = (newModeKey, clickedButton) => {
    stopTimer(false);

    currentModeKey = newModeKey;
    currentTime = parseInt(clickedButton.getAttribute('data-time'));

    updateDisplay();
    updateToggleButton();

    // Update styles for mode buttons
    modeButtons.forEach(btn => {
        btn.classList.remove('solid');
        btn.classList.add('outline');
    });
    clickedButton.classList.add('solid');
    clickedButton.classList.remove('outline');
};

const adjustTime = (deltaSeconds) => {
    if (isRunning) {
        notyf.error('نمی‌توانید زمان را در حین اجرا تغییر دهید.');
        return;
    }

    let newTime;
    if (deltaSeconds > 0) {
        // Snap up to the next multiple of 5 (if already a multiple, move to the next one)
        newTime = Math.ceil(currentTime / TIME_STEP) * TIME_STEP;
        if (newTime === currentTime) newTime += TIME_STEP;
    } else {
        // Snap down to the previous multiple of 5 (if already a multiple, move to the previous one)
        newTime = Math.floor(currentTime / TIME_STEP) * TIME_STEP;
        if (newTime === currentTime) newTime -= TIME_STEP;
    }

    currentTime = Math.max(MIN_TIMER_SECONDS, newTime);
    saveCurrentTime();

    const currentModeBtn = document.querySelector('.timer-mode-btn.solid');
    if (currentModeBtn) {
        currentModeBtn.setAttribute('data-time', currentTime);
        const name = extractModeName(currentModeBtn.textContent);
        currentModeBtn.textContent = `${name} (${currentTime})`;
    }

    updateDisplay();
};

// --- Initialization and Event Listeners ---

const initializeModeButtons = () => {
    modeButtons.forEach(button => {
        const fullText = button.textContent;
        const name = extractModeName(fullText);
        const modeKey = MODE_NAME_TO_KEY[name];

        if (modeKey) {
            button.setAttribute('data-mode-key', modeKey);

            const initialTime = loadTimeForMode(modeKey);
            button.setAttribute('data-time', initialTime);
            button.textContent = `${name} (${initialTime})`;
        }

        button.addEventListener('click', (e) => {
            const modeKeyToSwitch = e.target.getAttribute('data-mode-key');
            if (modeKeyToSwitch) {
                handleModeChange(modeKeyToSwitch, e.target);
            }
        });
    });
};

const initTimer = () => {
    initializeModeButtons();

    const defaultModeBtn = document.querySelector('.timer-mode-btn.solid');
    if (defaultModeBtn) {
        currentModeKey = defaultModeBtn.getAttribute('data-mode-key');
        currentTime = parseInt(defaultModeBtn.getAttribute('data-time'));
    } else {
        currentModeKey = 'NORMAL';
        currentTime = loadTimeForMode('NORMAL');
    }

    updateDisplay();
    updateToggleButton();

    if (timerToggleButton) {
        timerToggleButton.addEventListener('click', toggleTimer);
    }

    if (timeIncreaseBtn) {
        timeIncreaseBtn.addEventListener('click', () => adjustTime(5));
    }
    if (timeDecreaseBtn) {
        timeDecreaseBtn.addEventListener('click', () => adjustTime(-5));
    }
};