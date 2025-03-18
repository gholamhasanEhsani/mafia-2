document.addEventListener('DOMContentLoaded', () => {
    const startGameButton = document.getElementById('start-game');
    const resetGameButton = document.getElementById('reset-game');

    startGameButton.addEventListener('click', () => {
        localStorage.setItem('currentTab', '2');
        window.location.href = '../tab2';
    });

    resetGameButton.addEventListener('click', () => {
        localStorage.clear();
        window.location.reload();
    });

    localStorage.setItem('currentTab', '1');
});