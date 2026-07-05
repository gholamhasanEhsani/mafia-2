// ==========================================================
// PLAYER STATUS MANAGEMENT (PLAYERS.JS)
// ==========================================================

let playersData = [];
let rolesVisible = true;

const saveRolesVisibilityState = () => {
    setLocalStorageItem(LS_ROLES_VISIBLE_KEY, rolesVisible);
};

const renderPlayersList = () => {
    if (!playersListContainer) return;

    playersListContainer.innerHTML = '';

    // Apply/Remove the roles-hidden class on the container for CSS styling
    if (!rolesVisible) {
        playersListContainer.classList.add('roles-hidden');
    } else {
        playersListContainer.classList.remove('roles-hidden');
    }

    const sortedPlayers = [...playersData].sort((a, b) => {
        if (a.status === 'dead' && b.status !== 'dead') return 1;
        if (a.status !== 'dead' && b.status === 'dead') return -1;
        return a.name.localeCompare(b.name, 'fa');
    });

    sortedPlayers.forEach(player => {
        player.side = ROLE_SIDE_MAPPING[player.role] || "unknown";
        const button = document.createElement('button');
        button.classList.add('player-status-button');
        button.setAttribute('data-name', player.name);
        button.setAttribute('data-side', player.side);

        // Add the side class for coloring (citizen, mafia, neutral)
        button.classList.add(player.side);

        if (player.status === 'dead') {
            button.classList.add('dead');
        }

        // Conditionally hide the role text
        const roleText = rolesVisible ? player.role : '';

        const nameDiv = document.createElement('div');
        nameDiv.className = 'player-name';
        nameDiv.textContent = player.name;

        const roleDiv = document.createElement('div');
        roleDiv.className = 'player-role';
        roleDiv.textContent = roleText;

        button.innerHTML = '';
        button.appendChild(nameDiv);
        button.appendChild(roleDiv);

        button.addEventListener('click', () => {
            togglePlayerStatus(player.name);
        });

        playersListContainer.appendChild(button);
    });
};

const togglePlayerStatus = (playerName) => {
    const playerIndex = playersData.findIndex(p => p.name === playerName);
    if (playerIndex === -1) return;

    // 1. Change State in Data Array
    const isNowDead = playersData[playerIndex].status === 'alive';
    playersData[playerIndex].status = isNowDead ? 'dead' : 'alive';

    // 2. Save State
    setLocalStorageItem(ROLES_STORAGE_KEY, playersData);

    const buttonToUpdate = document.querySelector(`.player-status-button[data-name="${playerName}"]`);
    if (buttonToUpdate) {
        if (isNowDead) {
            buttonToUpdate.classList.add('dead');
        } else {
            buttonToUpdate.classList.remove('dead');
        }
    }
    // 3. Update other modules
    if (typeof updateNightSelects === 'function') {
        updateNightSelects();
    }
};

const resetPlayersStatus = () => {
    // Reset all players to 'alive' status
    playersData.forEach(player => {
        player.status = 'alive';
    });
    setLocalStorageItem(ROLES_STORAGE_KEY, playersData);
    renderPlayersList();
    if (typeof updateNightSelects === 'function') {
        updateNightSelects();
    }
};

const loadAndDisplayRoles = () => {
    const storedRoles = getLocalStorageItem(ROLES_STORAGE_KEY);
    const storedVisibility = getLocalStorageItem(LS_ROLES_VISIBLE_KEY);

    // Load Roles
    if (storedRoles && storedRoles.length > 0) {
        playersData = storedRoles;
        // Ensure all players start as alive (reset any dead status from previous game)
        playersData.forEach(player => {
            if (!player.status) {
                player.status = 'alive';
            }
        });
    } else {
        // Fallback for testing/initial run
        playersData = [
            { name: 'بازیکن ۱', role: 'شهروند', side: 'citizen', status: 'alive' },
            { name: 'بازیکن ۲', role: 'دکتر واتسون', side: 'citizen', status: 'alive' },
            { name: 'بازیکن ۳', role: 'مافیا', side: 'mafia', status: 'alive' },
            { name: 'بازیکن ۴', role: 'گادفادر', side: 'mafia', status: 'alive' },
            { name: 'بازیکن ۵', role: 'ناشناس', side: 'unknown', status: 'alive' },
        ];
    }

    // Load Visibility State
    if (storedVisibility !== null && typeof storedVisibility === 'boolean') {
        rolesVisible = storedVisibility;
    } else {
        rolesVisible = true;
        saveRolesVisibilityState();
    }

    // Ensure icon matches the loaded state
    if (toggleRolesIcon) {
        toggleRolesIcon.src = rolesVisible ? VISIBLE_ICON : HIDDEN_ICON;
        toggleRolesIcon.alt = rolesVisible ? 'پنهان‌سازی نقش‌ها' : 'نمایش نقش‌ها';
    }

    renderPlayersList();
};

const toggleRolesVisibility = () => {
    if (!playersListContainer || !toggleRolesIcon) return;

    rolesVisible = !rolesVisible;
    saveRolesVisibilityState();

    renderPlayersList();

    // Update icon after state change
    if (!rolesVisible) {
        toggleRolesIcon.src = HIDDEN_ICON;
        toggleRolesIcon.alt = 'نمایش نقش‌ها';
    } else {
        toggleRolesIcon.src = VISIBLE_ICON;
        toggleRolesIcon.alt = 'پنهان‌سازی نقش‌ها';
    }
};

const initPlayers = () => {
    loadAndDisplayRoles();

    if (toggleRolesButton) {
        toggleRolesButton.addEventListener('click', toggleRolesVisibility);
    }
};

const getPlayersData = () => playersData;
const getAlivePlayers = () => playersData.filter(p => p.status === 'alive');
