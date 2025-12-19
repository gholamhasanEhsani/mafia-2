// ==========================================================
// LAST MOVE CARDS MANAGEMENT (LAST-MOVE.JS)
// ==========================================

let lastMoveCards = [];

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const initializeLastMoveCards = () => {
    let cardsToShuffle = LAST_MOVE_CARDS_DATA.map(card => ({
        ...card,
        seen: false,
    }));

    cardsToShuffle = shuffleArray(cardsToShuffle);

    lastMoveCards = cardsToShuffle.map((card, index) => ({
        ...card,
        index: index + 1
    }));

    renderLastMoveCards();
};

const renderLastMoveCards = () => {
    if (!lastMoveCardsContainer) return;
    lastMoveCardsContainer.innerHTML = '';

    lastMoveCards.forEach(card => {
        const div = document.createElement('div');
        div.classList.add('card-placeholder');
        div.setAttribute('data-card-index', card.index);

        if (card.seen) {
            div.classList.add('seen');
            div.textContent = card.nameFa;
        } else {
            div.textContent = `کارت ${toPersianDigits(card.index)}`;
        }

        div.addEventListener('click', () => showCardInModal(card));
        lastMoveCardsContainer.appendChild(div);
    });
};

const showCardInModal = (card) => {
    const modal = document.getElementById('generic-modal');
    if (!modal) return;

    const imagePath = `${BASE_IMAGE_URL}${card.image}`;
    const pIndex = toPersianDigits(card.index);

    if (card.seen) {
        modal.innerHTML = `
            <div class="modal-content">
                <img src="${imagePath}" class="modal-card-image" alt="${card.nameFa}">
                <p style="margin: 10px 0;">این کارت قبلاً استفاده شده است.</p>
                <button id="close-modal" class="report-btn view-btn" style="width: 100%;">بستن</button>
            </div>`;
        modal.style.display = 'flex';
        document.getElementById('close-modal').addEventListener('click', () => modal.style.display = 'none');
        return;
    }

    modal.innerHTML = `
        <div class="modal-content">
            <p>آیا مطمئن هستید که می‌خواهید کارت <b>${pIndex}</b> را نشان دهید؟</p>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button id="confirm-card" class="report-btn view-btn" style="flex: 1; background-color: #28a745;">تایید</button>
                <button id="cancel-card" class="report-btn view-btn" style="flex: 1; background-color: #dc3545;">لغو</button>
            </div>
        </div>`;
    modal.style.display = 'flex';

    document.getElementById('cancel-card').addEventListener('click', () => modal.style.display = 'none');

    document.getElementById('confirm-card').addEventListener('click', () => {
        const cardIdx = lastMoveCards.findIndex(c => c.index === card.index);
        if (cardIdx !== -1) {
            lastMoveCards[cardIdx].seen = true;
            modal.innerHTML = `
                <div class="modal-content">
                    <img src="${imagePath}" class="modal-card-image" alt="${card.nameFa}">
                    <p style="margin-bottom: 25px;">کارت <b>${card.nameFa}</b></p>
                    <button id="close-final" class="report-btn view-btn" style="width: 100%;">بستن</button>
                </div>`;
            document.getElementById('close-final').addEventListener('click', () => modal.style.display = 'none');
            renderLastMoveCards();
        }
    });
};

const initLastMove = () => initializeLastMoveCards();