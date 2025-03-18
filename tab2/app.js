document.addEventListener('DOMContentLoaded', () => {
    const playerContainer = document.getElementById('player-container');
    const nextStepButton = document.getElementById('next-step');
    const MAX_PLAYERS = 13;
    const MIN_PLAYERS = 5;

    const loadPlayers = () => {
        const players = JSON.parse(localStorage.getItem('players')) || [];
        players.forEach((player, index) => addPlayerInput(index + 1, player));
        checkAndAddInput();
        toggleNextStepButton();
    };

    const savePlayers = () => {
        const playerInputs = playerContainer.querySelectorAll('input');
        const players = Array.from(playerInputs)
            .map(input => input.value.trim())
            .filter(value => value !== '');
        localStorage.setItem('players', JSON.stringify(players));
    };

    const addPlayerInput = (playerCount, value = '') => {
        if (playerCount > MAX_PLAYERS) return;

        const playerInput = document.createElement('div');
        playerInput.className = 'player-input';
        playerInput.innerHTML = `
            <label for="player${playerCount}">${playerCount}:</label>
            <input type="text" id="player${playerCount}" value="${value}">
            <button class="remove-player"><img src="https://gholamhasan.sirv.com/clear-x.png" alt="حذف"></button>
        `;
        playerContainer.appendChild(playerInput);

        playerInput.querySelector('.remove-player').addEventListener('click', () => {
            playerInput.remove();
            checkAndAddInput();
            updateLabels();
            savePlayers();
            toggleNextStepButton();
        });
    };

    const updateLabels = () => {
        const playerInputs = playerContainer.querySelectorAll('.player-input');
        playerInputs.forEach((input, index) => {
            const label = input.querySelector('label');
            label.textContent = `${index + 1}:`;
        });
    };

    const checkAndAddInput = () => {
        const playerInputs = playerContainer.querySelectorAll('input');
        if (playerInputs.length < MAX_PLAYERS) {
            const lastInput = playerInputs[playerInputs.length - 1];
            if (!lastInput || lastInput.value.trim() !== '') {
                addPlayerInput(playerInputs.length + 1);
            }
        }
    };

    const checkDuplicateNames = () => {
        const playerInputs = playerContainer.querySelectorAll('input');
        const names = Array.from(playerInputs)
            .map(input => input.value.trim())
            .filter(value => value !== '');
        playerInputs.forEach(input => {
            const name = input.value.trim();
            if (name && names.indexOf(name) !== names.lastIndexOf(name)) {
                input.classList.add('duplicate-error');
            } else {
                input.classList.remove('duplicate-error');
            }
        });
        return new Set(names).size !== names.length;
    };

    const checkEmptyInputs = () => {
        const playerInputs = playerContainer.querySelectorAll('input');
        let hasEmptyInputs = false;
        playerInputs.forEach((input, index) => {
            if (!input.value.trim() && index !== playerInputs.length - 1) {
                input.classList.add('empty-error');
                hasEmptyInputs = true;
            } else {
                input.classList.remove('empty-error');
            }
        });
        return hasEmptyInputs;
    };

    const toggleNextStepButton = () => {
        const playerInputs = playerContainer.querySelectorAll('input');
        const filledInputs = Array.from(playerInputs).filter(input => input.value.trim() !== '');
        const hasDuplicates = checkDuplicateNames();
        const hasEmptyInputs = checkEmptyInputs();
        nextStepButton.disabled = filledInputs.length < MIN_PLAYERS || filledInputs.length > MAX_PLAYERS || hasDuplicates || hasEmptyInputs;
    };

    nextStepButton.addEventListener('click', () => {
        savePlayers();
        localStorage.setItem('currentTab', '3');
        window.location.href = '../tab3';
    });

    playerContainer.addEventListener('input', () => {
        checkAndAddInput();
        savePlayers();
        toggleNextStepButton();
    });

    loadPlayers();
});