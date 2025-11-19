document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const backButton = document.getElementById('back-to-tab4');
    const timerDisplay = document.getElementById('timer-display');
    const timerToggleButton = document.getElementById('timer-toggle-button');
    const timerIcon = document.getElementById('timer-icon');

    const modeButtons = document.querySelectorAll('.timer-mode-btn');
    const timeIncreaseBtn = document.getElementById('time-increase-btn');
    const timeDecreaseBtn = document.getElementById('time-decrease-btn');

    const playersListContainer = document.getElementById('players-list');
    const toggleRolesButton = document.getElementById('toggle-roles-visibility');
    const toggleRolesIcon = document.getElementById('toggle-roles-icon');

    const lastMoveCardsContainer = document.getElementById('last-move-cards-container');

    // Modal setup
    const modal = document.createElement('div');
    modal.id = 'generic-modal';
    modal.classList.add('modal');
    document.body.appendChild(modal);

    // 1. Navigation
    backButton.addEventListener('click', () => window.location.href = '../tab4/index.html');

    // 2. Timer Management Logic
    let countdown;
    let time = 0;
    const PLAY_ICON = "https://gholamhasan.sirv.com/play-button.png";
    const STOP_ICON = "https://gholamhasan.sirv.com/stop-button.png";

    const LS_KEY = {
        NORMAL: 'timerModeNormalTime',
        CHALLENGE: 'timerModeChallengeTime',
        INTRO: 'timerModeIntroTime'
    };

    const DEFAULT_TIMES = {
        NORMAL: 60,
        CHALLENGE: 45,
        INTRO: 25
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
        const secStr = remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;
        return `${minStr}:${secStr}`;
    };

    const updateTimerDisplay = () => {
        timerDisplay.textContent = formatTime(time);
    };

    const resetTimer = (newTime) => {
        clearInterval(countdown);
        time = newTime;
        updateTimerDisplay();
        timerToggleButton.dataset.status = 'stopped';
        timerIcon.src = PLAY_ICON;
    };

    const saveModeTime = (modeKey, newTime) => {
        localStorage.setItem(modeKey, newTime.toString());
    };

    const loadModeTime = (modeKey, defaultTime) => {
        const savedTime = localStorage.getItem(modeKey);
        return savedTime ? parseInt(savedTime) : defaultTime;
    };

    const initializeModeButtons = () => {
        modeButtons.forEach(btn => {
            const btnName = btn.textContent.split('(')[0].trim();
            let modeKey;
            let defaultTime;

            if (btnName.includes('عادی')) {
                modeKey = LS_KEY.NORMAL;
                defaultTime = DEFAULT_TIMES.NORMAL;
            } else if (btnName.includes('چالش')) {
                modeKey = LS_KEY.CHALLENGE;
                defaultTime = DEFAULT_TIMES.CHALLENGE;
            } else if (btnName.includes('معارفه')) {
                modeKey = LS_KEY.INTRO;
                defaultTime = DEFAULT_TIMES.INTRO;
            } else {
                return;
            }

            const currentTime = loadModeTime(modeKey, defaultTime);
            btn.dataset.time = currentTime;
            btn.dataset.modeKey = modeKey;
            btn.textContent = `${btnName} (${currentTime})`;
        });

        const defaultModeBtn = document.querySelector('.timer-mode-btn.solid');
        if (defaultModeBtn) {
            resetTimer(parseInt(defaultModeBtn.dataset.time));
        }
    };


    const toggleTimer = () => {
        const status = timerToggleButton.dataset.status;

        if (status === 'stopped' || status === 'finished') {
            timerToggleButton.dataset.status = 'running';
            timerIcon.src = STOP_ICON;

            if (status === 'finished') {
                const currentModeBtn = document.querySelector('.timer-mode-btn.solid');
                time = parseInt(currentModeBtn.dataset.time);
            }

            countdown = setInterval(() => {
                time--;
                updateTimerDisplay();

                if (time <= 0) {
                    clearInterval(countdown);
                    timerDisplay.textContent = "⏱️ پایان!";
                    timerToggleButton.dataset.status = 'finished';
                    timerIcon.src = PLAY_ICON;
                }
            }, 1000);

        } else if (status === 'running') {
            clearInterval(countdown);
            timerToggleButton.dataset.status = 'stopped';
            timerIcon.src = PLAY_ICON;
        }
    };

    const handleModeChange = (event) => {
        const newTime = parseInt(event.target.dataset.time);

        modeButtons.forEach(btn => btn.classList.remove('solid', 'outline'));
        modeButtons.forEach(btn => btn.classList.add('outline'));
        event.target.classList.remove('outline');
        event.target.classList.add('solid');

        resetTimer(newTime);
    };

    const handleTimeAdjust = (amount) => {
        const currentModeBtn = document.querySelector('.timer-mode-btn.solid');
        let currentModeTime = parseInt(currentModeBtn.dataset.time);

        if (currentModeTime + amount >= 5) {
            currentModeTime += amount;

            currentModeBtn.dataset.time = currentModeTime;
            currentModeBtn.textContent = `${currentModeBtn.textContent.split('(')[0].trim()} (${currentModeTime})`;

            const modeKey = currentModeBtn.dataset.modeKey;
            saveModeTime(modeKey, currentModeTime);

            resetTimer(currentModeTime);
        } else {
            alert("زمان نباید کمتر از ۵ ثانیه باشد!");
        }
    }

    timerToggleButton.addEventListener('click', toggleTimer);
    modeButtons.forEach(button => {
        button.addEventListener('click', handleModeChange);
    });
    timeIncreaseBtn.addEventListener('click', () => handleTimeAdjust(5));
    timeDecreaseBtn.addEventListener('click', () => handleTimeAdjust(-5));


    // 3. Player Status and Role Management
    let gameRoles = [];
    let rolesVisible = true;

    const ROLES_SIDES = {
        citizen: ['دکتر واتسون', 'لئون حرفه ای', 'همشهری کین', 'کنستانتین', 'شهروند ساده'],
        mafia: ['پدرخوانده', 'ماتادور', 'ساول گودمن', 'مافیای ساده'],
        neutral: ['نوستراداموس', 'جک اسپارو', 'شرلوک هولمز']
    };

    const getPlayerSide = (role) => {
        if (ROLES_SIDES.citizen.includes(role)) return 'citizen';
        if (ROLES_SIDES.mafia.includes(role)) return 'mafia';
        if (ROLES_SIDES.neutral.includes(role)) return 'neutral';
        return 'unknown';
    };

    const loadAndDisplayRoles = () => {
        const storedRoles = localStorage.getItem('dashboardRoles');
        if (storedRoles) {
            gameRoles = JSON.parse(storedRoles).map(p => ({
                name: p.name,
                role: p.role,
                isAlive: p.isAlive !== undefined ? p.isAlive : true,
                side: getPlayerSide(p.role)
            }));
        } else {
            playersListContainer.innerHTML = '<p class="status-placeholder" style="color: #dc3545;">❌ نقش‌های بازیکنان یافت نشد. به تب ۴ بازگردید.</p>';
            return;
        }

        renderPlayersList();
    };

    const renderPlayersList = () => {
        playersListContainer.innerHTML = '';

        // Update list class based on visibility
        if (rolesVisible) {
            playersListContainer.classList.remove('roles-hidden');
        } else {
            playersListContainer.classList.add('roles-hidden');
        }

        gameRoles.forEach((player, index) => {
            const button = document.createElement('button');
            button.classList.add('player-status-button');
            button.dataset.index = index;
            button.dataset.side = player.side;

            if (!player.isAlive) {
                button.classList.add('dead');
            } else {
                button.classList.remove('dead');
            }

            const roleText = rolesVisible ? player.role : '';

            button.innerHTML = `
                <div class="player-name">${player.name}</div>
                <div class="player-role">${roleText}</div>
            `;
            playersListContainer.appendChild(button);
        });

        attachStatusToggleListeners();
    };

    const attachStatusToggleListeners = () => {
        document.querySelectorAll('.player-status-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const index = parseInt(event.currentTarget.dataset.index);
                togglePlayerStatus(index);
            });
        });
    };

    const togglePlayerStatus = (index) => {
        if (gameRoles[index]) {
            gameRoles[index].isAlive = !gameRoles[index].isAlive;
            // Save state to preserve on refresh
            localStorage.setItem('dashboardRoles', JSON.stringify(gameRoles));
            renderPlayersList();
        }
    };

    const toggleRolesVisibility = () => {
        rolesVisible = !rolesVisible;

        if (rolesVisible) {
            toggleRolesIcon.src = 'https://gholamhasan.sirv.com/visible.png';
        } else {
            toggleRolesIcon.src = 'https://gholamhasan.sirv.com/hidden.png';
        }

        renderPlayersList();
    };

    toggleRolesButton.addEventListener('click', toggleRolesVisibility);


    // 4. Tip Box Management
    const tipText = document.getElementById('tip-text');
    const TIPS = [
        "نکته ۱: همیشه مطمئن شوید فاز شب با سکوت مطلق برگزار می‌شود.",
        "نکته ۲: نقش‌های بازیکنان را پیش از شروع، یکبار مرور کنید.",
        "نکته ۳: برای حفظ هیجان بازی زمان رأی‌گیری‌، صحبت و چالش‌ها را کنترل کنید.",
        "نکته ۴: برای کشتن یک بازیکن، روی دکمه آن در باکس « 👥 وضعیت بازیکنان» کلیک کنید.",
        "نکته ۵: از دکمه سوئیچ نقش‌ها برای پنهان کردن هویت بازیکنان در طول روز استفاده کنید.",
        "نکته ۶: وضعیت زنده/مرده بودن بازیکن را بلافاصله پس از خروج به‌روزرسانی کنید.",
        "نکته ۷: با بازگشتن به صفحه قبلی (توزیع نقش) و یا رفرش کردن، نقش‌های بازیکنان مجدداً به صورت تصادفی پخش و عوض خواهند شد.",
        "نکته ۸: ترتیب بیدار شدن در شب: نوستراداموس (فقط شب معارفه) ← گروه مافیا ← دکتر واتسون ← لئون حرفه‌ای ← همشهری کین ← کنستانتین.",
    ];
    let currentTipIndex = 0;

    const displayNextTip = () => {
        tipText.textContent = TIPS[currentTipIndex];
        currentTipIndex = (currentTipIndex + 1) % TIPS.length;
    };

    displayNextTip();
    setInterval(displayNextTip, 15000);

    // 5. Last Move Cards Management
    const LAST_MOVE_CARDS_DATA = [
        { nameFa: "ذهن زیبا", nameEn: "Beautiful Mind", image: "bm.png" },
        { nameFa: "تغییر چهره", nameEn: "Face Off", image: "fo.png" },
        { nameFa: "دست بند", nameEn: "Hand Cuffs", image: "hc.png" },
        { nameFa: "افشای هویت", nameEn: "Identity Disclosure", image: "id.png" },
        { nameFa: "سکوت بره ها", nameEn: "Silence Of The Lambs", image: "sl.png" },
    ];
    const BASE_IMAGE_URL = "https://gholamhasan.sirv.com/mafia-images/final-move/";

    let assignedCards = [];

    const cardsToAssign = [...LAST_MOVE_CARDS_DATA].sort(() => Math.random() - 0.5);

    assignedCards = cardsToAssign.map((card, index) => ({
        id: index + 1,
        nameFa: card.nameFa,
        nameEn: card.nameEn,
        image: card.image,
        isSeen: false
    }));


    const initializeLastMoveCards = () => {
        if (!lastMoveCardsContainer) return;

        lastMoveCardsContainer.innerHTML = '';

        assignedCards.forEach(card => {
            const cardButton = document.createElement('div');
            cardButton.classList.add('card-placeholder');
            cardButton.dataset.cardIndex = card.id;
            cardButton.dataset.isSeen = card.isSeen;

            cardButton.textContent = `کارت ${card.id}`;

            cardButton.addEventListener('click', () => {

                const cardInArray = assignedCards.find(c => c.id === card.id);

                if (cardInArray.isSeen) {
                    alert(`کارت "${cardInArray.nameFa}" قبلاً در این دور باز شده است.`);
                    return;
                }

                showCardInModal(cardInArray);
            });
            lastMoveCardsContainer.appendChild(cardButton);
        });
    };

    const showCardInModal = (card) => {
        modal.innerHTML = `
            <div class="modal-content">
                <h3>${card.nameFa}</h3>
                <p>(${card.nameEn})</p>
                <img src="${BASE_IMAGE_URL}${card.image}" alt="${card.nameFa}" class="modal-card-image">
                <p style="font-size: 0.9em; color: #555;">این کارت یک بار مصرف است و توسط گرداننده مدیریت می‌شود.</p>
                <button id="confirm-card-open" style="background-color: #dc3545; margin-top: 15px;">تأیید مشاهده و مصرف کارت</button>
            </div>
        `;
        modal.style.display = 'flex';

        const closeModal = () => modal.style.display = 'none';

        document.getElementById('confirm-card-open').addEventListener('click', () => {
            card.isSeen = true;

            const cardButton = document.querySelector(`.card-placeholder[data-card-index="${card.id}"]`);
            if (cardButton) {
                cardButton.classList.add('seen');
                cardButton.textContent = card.nameFa;
                cardButton.dataset.isSeen = 'true';
            }

            closeModal();
        });
    };

    // Initial execution
    initializeModeButtons();
    loadAndDisplayRoles();
    initializeLastMoveCards();
});