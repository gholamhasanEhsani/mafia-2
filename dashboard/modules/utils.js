// ==========================================================
// CONSTANTS, DOM ELEMENTS, AND GLOBAL UTILITIES (UTILS.JS)
// ==========================================================

// **********************************************
// 1. Global Constants & Keys
// **********************************************
window.NIGHT_NOTES_KEY = 'mafiaNightNotes';
window.ROLES_STORAGE_KEY = 'dashboardRoles';
window.NIGHT_HISTORY_KEY = 'mafiaNightHistory';
window.LS_ROLES_VISIBLE_KEY = 'rolesVisibilityState';

window.PLAY_ICON = "https://gholamhasan.sirv.com/play-button.png";
window.STOP_ICON = "https://gholamhasan.sirv.com/pause.png";

window.LS_KEY = {
    NORMAL: 'timerModeNormalTime',
    CHALLENGE: 'timerModeChallengeTime',
    INTRO: 'timerModeIntroTime'
};

window.DEFAULT_TIMES = {
    NORMAL: 60,
    CHALLENGE: 45,
    INTRO: 25
};

window.MODE_NAME_TO_KEY = {
    'صحبت عادی': 'NORMAL',
    'چالش': 'CHALLENGE',
    'معارفه': 'INTRO'
};

window.VISIBLE_ICON = 'https://gholamhasan.sirv.com/visible.png';
window.HIDDEN_ICON = 'https://gholamhasan.sirv.com/hidden.png';

window.ROLE_KEY_MAPPING = {
    'mafia': 'گروه مافیا',
    'matador': 'ماتادور',
    'doctor': 'دکتر واتسون',
    'leon': 'لئون حرفه ای',
    'kin': 'همشهری کین',
    'konstantin': 'کنستانتین'
};

window.ROLE_SIDE_MAPPING = {
    "شهروند ساده": "citizen", "دکتر واتسون": "citizen", "لئون حرفه ای": "citizen", "همشهری کین": "citizen", "کنستانتین": "citizen",
    "پدرخوانده": "mafia", "ماتادور": "mafia", "ساول گودمن": "mafia", "مافیا ساده": "mafia",
    "نوستراداموس": "neutral", "شرلوک هولمز": "neutral", "جک اسپارو": "neutral"
}

window.LOCKED_TEXT = ' (قفل شده توسط ماتادور)';
window.LOCKED_PLACEHOLDER = `🔒 ${window.LOCKED_TEXT}`;

// Updated sound data structure for category-based selection
window.SOUND_EFFECTS_DATA = {
    'زنگ پایان تایمر': [
        { label: 'زنگ ۱', file: 'bell-330333.mp3' },
        { label: 'زنگ ۲', file: 'bell-430417.mp3' },
        { label: 'زنگ ۳', file: 'bell-98033.mp3' }
    ],
    'صدای شلیک': [
        { label: 'شلیک ۱', file: 'shot-10069.mp3' }, { label: 'شلیک ۲', file: 'shot-13207.mp3' },
        { label: 'شلیک ۳', file: 'shot-14566.mp3' }, { label: 'شلیک ۴', file: 'shot-14649.mp3' },
        { label: 'شلیک ۵', file: 'shot-23053.mp3' }, { label: 'شلیک ۶', file: 'shot-307467.mp3' },
        { label: 'شلیک ۷', file: 'shot-318127.mp3' }, { label: 'شلیک ۸', file: 'shot-384451.mp3' },
        { label: 'شلیک ۹', file: 'shot-39722.mp3' }, { label: 'شلیک ۱۰', file: 'shot-39789.mp3' },
        { label: 'شلیک ۱۱', file: 'shot-43852.mp3' }, { label: 'شلیک ۱۲', file: 'shot-90286.mp3' },
        { label: 'شلیک ۱۳', file: 'shot-94951.mp3' }, { label: 'شلیک ۱۴', file: 'shot-98831.mp3' },
        { label: 'پوکه ۱', file: 'shot-39791.mp3' }
    ],
    'اتمسفر شب': [
        { label: 'شب ۱', file: 'night-24868.mp3' }, { label: 'شب ۲', file: 'night-28450.mp3' },
        { label: 'شب ۳', file: 'night-33030.mp3' }, { label: 'شب ۴', file: 'night-37327.mp3' },
        { label: 'شب ۵', file: 'night-55629.mp3' }, { label: 'شب ۶', file: 'night-59094.mp3' },
        { label: 'شب ۷', file: 'night-64747.mp3' }, { label: 'شب ۸', file: 'night-65691.mp3' },
        { label: 'شب ۹', file: 'night-70424.mp3' }, { label: 'شب ۱۰', file: 'night-74392.mp3' },
        { label: 'شب ۱۱', file: 'night-77928.mp3' }, { label: 'شب ۱۲', file: 'night-84637.mp3' },
        { label: 'شب ۱۳', file: 'night-92111.mp3' }, { label: 'شب ۱۴', file: 'night-93576.mp3' },
        { label: 'شب ۱۵', file: 'night-95826.mp3' }, { label: 'شب ۱۶', file: 'night-96739.mp3' },
        { label: 'شب ۱۷', file: 'night-97216.mp3' }
    ],
    'تیک‌تاک و زمان': [
        { label: 'تیک‌تاک ۱', file: 'time-10840.mp3' },
        { label: 'تیک‌تاک ۲', file: 'time-376897.mp3' }
    ]
};

window.TIPS = [
    'برای شروع، روی دکمه شروع تایمر کلیک کنید.',
    'برای تغییر حالت تایمر (چالش، معارفه و...) از دکمه‌های بالا استفاده کنید.',
    'در شب، حتماً بعد از انجام تمام اقدامات، گزارش شب را ذخیره کنید.',
    'قبل از شروع روز، وضعیت بازیکنان (زنده/مرده) را به‌روزرسانی کنید.',
    'برای مشاهده جزئیات کارت‌ها، روی آن‌ها کلیک کنید.',
    'برای مدیریت افکت‌های صوتی، از بخش افکت‌های صوتی استفاده کنید.'
];

window.BASE_IMAGE_URL = "https://gholamhasan.sirv.com/mafia-images/final-move/";
window.LAST_MOVE_CARDS_DATA = [
    { id: 1, nameFa: "ذهن زیبا", nameEn: "Beautiful Mind", image: "bm.png" },
    { id: 2, nameFa: "تغییر چهره", nameEn: "Face Off", image: "fo.png" },
    { id: 3, nameFa: "دست بند", nameEn: "Hand Cuffs", image: "hc.png" },
    { id: 4, nameFa: "افشای هویت", nameEn: "Identity Disclosure", image: "id.png" },
    { id: 5, nameFa: "سکوت بره ها", nameEn: "Silence Of The Lambs", image: "sl.png" },
];

// **********************************************
// 2. DOM Elements (Caching)
// **********************************************
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
const tipText = document.getElementById('tip-text');
const nightNotesTextarea = document.getElementById('night-notes-textarea');
const saveNightNotesBtn = document.getElementById('save-night-notes-btn');
const saveNightReportBtn = document.getElementById('save-night-report-btn');
const allMafiaActionBtns = document.querySelectorAll('.mafia-action-btn');
const viewPastReportsBtn = document.getElementById('view-past-reports-btn');
const mafiaTargetSelect = document.getElementById('mafia-target-select');
const matadorControlSelect = document.getElementById('matador-control-select');
const doctorTargetSelect = document.getElementById('doctor-target-select');
const leonTargetSelect = document.getElementById('leon-target-select');
const kinTargetSelect = document.getElementById('kin-target-select');
const konstantinTargetSelect = document.getElementById('konstantin-target-select');
const sfxPlayer = document.getElementById('sfx-player');
const sfxButtonsContainer = document.getElementById('sfx-buttons-container');

// **********************************************
// 3. Global Helper Functions (Utilities)
// **********************************************
window.notyf = new Notyf({
    duration: 3000,
    position: { x: 'left', y: 'top' },
    dismissible: false
});

window.getOriginalLabels = (id) => {
    const labels = {
        'matador-control-select': 'قفل ماتادور',
        'doctor-target-select': 'نجات دکتر واتسون',
        'leon-target-select': 'شلیک لئون',
        'kin-target-select': 'استعلام همشهری کین',
        'konstantin-target-select': 'تولد مجدد کنستانتین',
    };
    return labels[id];
};

window.getOriginalSelectPlaceholders = (id) => {
    const placeholders = {
        'mafia-target-select': 'انتخاب هدف شلیک...',
        'matador-control-select': 'انتخاب بازیکن برای قفل...',
    };
    return placeholders[id] || 'انتخاب هدف / بازیکن...';
};

window.getLocalStorageItem = (key) => {
    const item = localStorage.getItem(key);
    try {
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.error(`Error reading Local Storage (Key: ${key}):`, e);
        return null;
    }
};

window.getLocalStorageString = (key) => localStorage.getItem(key);

window.setLocalStorageItem = (key, value) => {
    if (key === window.NIGHT_NOTES_KEY && typeof value === 'string') {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.error(`Error saving raw string Local Storage (Key: ${key}):`, e);
        }
        return;
    }
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error(`Error saving JSON Local Storage (Key: ${key}):`, e);
    }
};

window.formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const secStr = remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;
    return `${minStr}:${secStr}`;
};

window.showModal = (title, content) => {
    const modal = document.getElementById('generic-modal');
    if (!modal) return;

    modal.innerHTML = `
        <div class="modal-content">
            <h3>${title}</h3>
            <div style="max-height: 400px; overflow-y: auto; text-align: right; padding: 10px 0;">${content}</div>
            <button id="close-generic-modal" class="report-btn view-btn" style="margin-top: 15px; width: 100%;">بستن</button>
        </div>
    `;
    modal.style.display = 'flex';

    document.getElementById('close-generic-modal')?.addEventListener('click', () => modal.style.display = 'none');
};

const toPersianDigits = t => { let e = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]; return t.toString().replace(/[0-9]/g, t => e[+t]) };

// **********************************************
// 4. General Event Listeners (Navigation)
// **********************************************
if (backButton) {
    backButton.addEventListener('click', () => {
        window.location.href = '../tab4/index.html';
    });
}