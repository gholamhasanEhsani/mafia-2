// ==========================================================
// APPLICATION ENTRY POINT (APP.JS)
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.createElement('div');
    modal.id = 'generic-modal';
    modal.classList.add('modal');
    modal.style.display = 'none';
    document.body.appendChild(modal);

    // 1. Timer Initialization
    if (typeof initTimer === 'function') {
        initTimer();
    }

    // 2. Players/Roles Initialization
    if (typeof initPlayers === 'function') {
        initPlayers();
    }

    // 3. Last Move Cards Initialization
    if (typeof initLastMove === 'function') {
        initLastMove();
    }

    // 4. Night Report/Notes Initialization
    if (typeof initNightReport === 'function') {
        initNightReport();
    }

    // 5. Populate Night Selects
    if (typeof updateNightSelects === 'function') {
        updateNightSelects();
    }

    // 6. SFX Buttons and Tips Initialization
    if (typeof initSfxTips === 'function') {
        initSfxTips();
    }
});