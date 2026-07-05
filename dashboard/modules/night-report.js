// ==========================================================
// NIGHT REPORT MANAGEMENT (NIGHT-REPORT.JS)
// ==========================================================

let nightReportHistory = [];
let currentNightNumber = 1;

// --- Player Filtering Logic ---

// از getPlayersData بدون پیشوند window. استفاده شده است
const getPlayerFilter = (filterType, selfRole = null) => {
    const allPlayers = getPlayersData();
    const alivePlayers = allPlayers.filter(p => p.status === 'alive');

    switch (filterType) {
        case 'self':
            return alivePlayers.filter(p => p.role !== selfRole);
        case 'nonMafia':
            return alivePlayers.filter(p => p.side !== 'mafia');
        case 'simpleCitizen':
            return alivePlayers.filter(p => p.role === 'شهروند ساده');
        case 'dead':
            return allPlayers.filter(p => p.status === 'dead');
        default:
            return alivePlayers;
    }
};

const getRoleStatus = (roleKey, allRoles) => {
    // استفاده از ROLE_KEY_MAPPING سراسری (تعریف شده در utils.js)
    if (roleKey === 'mafia') {
        return allRoles.some(p => p.side === 'mafia' && p.status === 'alive');
    }
    const roleName = window.ROLE_KEY_MAPPING[roleKey];
    const player = allRoles.find(p => p.role === roleName && p.status === 'alive');
    return !!player;
};


// --- Core UI Update Function (Global) ---

window.updateNightSelects = (resetCache = false) => {
    // از getPlayersData بدون پیشوند window. استفاده شده است
    const allRoles = getPlayersData();

    // 1. Preserve current selected values
    const currentSelections = {};
    if (!resetCache) {
        document.querySelectorAll('.night-target-select').forEach(select => {
            currentSelections[select.id] = select.value;
        });
    }

    const allAlivePlayers = getPlayerFilter('default');

    const rolesConfig = [
        { id: 'mafia-target-select', isMafia: true },
        { id: 'matador-control-select', targetList: getPlayerFilter('nonMafia'), roleKey: 'ماتادور' },
        { id: 'doctor-target-select', targetList: allAlivePlayers, roleKey: 'دکتر واتسون' },
        { id: 'leon-target-select', targetList: getPlayerFilter('self', 'لئون حرفه ای'), roleKey: 'لئون حرفه ای' },
        { id: 'kin-target-select', targetList: getPlayerFilter('self', 'همشهری کین'), roleKey: 'همشهری کین' },
        { id: 'konstantin-target-select', targetList: getPlayerFilter('dead'), roleKey: 'کنستانتین', isDeadTarget: true },
    ];

    const matadorControlSelect = document.getElementById('matador-control-select');
    const lockedTargetName = matadorControlSelect ? matadorControlSelect.value : '';

    // Update Selects based on restrictions and role status
    rolesConfig.forEach(item => {
        const select = document.getElementById(item.id);
        if (!select || item.isMafia) return;

        const roleDiv = select.closest('.night-role-action');
        const label = roleDiv.querySelector('label');
        // استفاده از توابع سراسری
        const originalLabelText = window.getOriginalLabels(select.id);
        const correctPlaceholderText = window.getOriginalSelectPlaceholders(select.id);

        const playerWithRole = allRoles.find(p => p.role === item.roleKey);

        const rolePlayerIsAlive = playerWithRole ? playerWithRole.status === 'alive' : true;
        const isRoleLockedByMatador = rolePlayerIsAlive && lockedTargetName === playerWithRole?.name;

        if (originalLabelText) {
            label.innerHTML = originalLabelText;
        }

        if (!rolePlayerIsAlive) {
            select.innerHTML = `<option value="" selected disabled>❌ بازیکن حذف شده</option>`;
            select.disabled = true;
            if (originalLabelText) {
                label.innerHTML += ' <span style="color: #dc3545; font-weight: normal;">(حذف شده)</span>';
            }
        }
        else if (isRoleLockedByMatador) {
            // استفاده از متغیرهای سراسری
            select.innerHTML = `<option value="" selected disabled>${window.LOCKED_PLACEHOLDER}</option>`;
            select.disabled = true;
            if (originalLabelText) {
                label.innerHTML += ` <span style="color: #ffc107; font-weight: normal;">${window.LOCKED_TEXT}</span>`;
            }
        }
        else {
            const targetList = item.id === 'matador-control-select' ? getPlayerFilter('nonMafia') : item.targetList;

            const targetOptions = targetList.map(p =>
                `<option value="${window.escapeHTML(p.name)}">${window.escapeHTML(p.name)} (${p.role})</option>`
            ).join('');

            select.innerHTML = `<option value="" selected disabled>${correctPlaceholderText}</option>` + targetOptions;
            select.disabled = false;
        }
    });

    // 2. Restore saved values
    document.querySelectorAll('.night-target-select').forEach(select => {
        const cachedValue = currentSelections[select.id];

        if (!select.disabled && cachedValue && !resetCache && select.querySelector(`option[value="${cachedValue}"]`)) {
            select.value = cachedValue;
        } else if (select.disabled) {
            select.value = '';
        } else {
            select.value = '';
        }
    });

    // Mafia Controls
    const hasGodfather = allRoles.some(p => p.role === 'پدرخوانده' && p.status === 'alive');
    const hasSaulGoodman = allRoles.some(p => p.role === 'ساول گودمن' && p.status === 'alive');
    const atLeastOneMafiaIsDead = allRoles.some(p => p.side === 'mafia' && p.status === 'dead');

    const mafiaTargetSelect = document.getElementById('mafia-target-select');

    const hsBtn = document.querySelector('.mafia-action-btn[data-action="hssheshom"]');
    const khBtn = document.querySelector('.mafia-action-btn[data-action="kharidari"]');

    if (hsBtn) hsBtn.style.display = hasGodfather ? 'block' : 'none';
    if (khBtn) khBtn.style.display = (hasSaulGoodman && atLeastOneMafiaIsDead) ? 'block' : 'none';

    // Function to update Mafia Select based on selected action
    const updateMafiaTargetList = (action) => {
        const placeholder = mafiaTargetSelect.options[0] ? mafiaTargetSelect.options[0].outerHTML : '<option value="" selected disabled>انتخاب هدف / بازیکن...</option>';
        const failureOption = '<option value="FAILED" style="color: red;">عملیات ناموفق بود</option>';

        let targetOptionsHTML;

        if (action === 'kharidari') {
            const simpleCitizens = getPlayerFilter('simpleCitizen').map(p =>
                `<option value="${window.escapeHTML(p.name)}">${window.escapeHTML(p.name)} (${p.role})</option>`
            ).join('');
            targetOptionsHTML = placeholder + failureOption + simpleCitizens;
        } else if (action === 'hssheshom') {
            const nonMafiaOptions = getPlayerFilter('nonMafia').map(p =>
                `<option value="${window.escapeHTML(p.name)}">${window.escapeHTML(p.name)} (${p.role})</option>`
            ).join('');
            targetOptionsHTML = placeholder + failureOption + nonMafiaOptions;
        } else { // shot (default)
            const allPlayersOptions = allAlivePlayers.map(p =>
                `<option value="${window.escapeHTML(p.name)}">${window.escapeHTML(p.name)} (${p.role})</option>`
            ).join('');
            targetOptionsHTML = placeholder + allPlayersOptions;
        }

        mafiaTargetSelect.innerHTML = targetOptionsHTML;

        if (currentSelections['mafia-target-select'] && mafiaTargetSelect.querySelector(`option[value="${currentSelections['mafia-target-select']}"]`)) {
            mafiaTargetSelect.value = currentSelections['mafia-target-select'];
        } else {
            mafiaTargetSelect.value = '';
        }
    };

    // Control Mafia Action Buttons
    const allMafiaActionBtns = document.querySelectorAll('.mafia-action-btn');

    const handleMafiaActionSelect = (event) => {
        const selectedBtn = event.currentTarget;
        const action = selectedBtn.dataset.action;

        const isGodfatherAlive = allRoles.some(p => p.role === 'پدرخوانده' && p.status === 'alive');
        const isSaulGoodmanAlive = allRoles.some(p => p.role === 'ساول گودمن' && p.status === 'alive');
        const isKharidariConditionMet = isSaulGoodmanAlive && allRoles.some(p => p.side === 'mafia' && p.status === 'dead');

        if (action === 'hssheshom' && !isGodfatherAlive) {
            window.notyf.error('این قابلیت به دلیل خروج بازیکن مربوطه، غیرفعال است.');
            const shotBtn = document.querySelector('.mafia-action-btn[data-action="shot"]');
            if (shotBtn && selectedBtn.dataset.action !== 'shot') {
                shotBtn.click();
            }
            return;
        }

        if (action === 'kharidari' && !isKharidariConditionMet) {
            window.notyf.error('قابلیت خریداری ساول گودمن تنها پس از خروج حداقل یک عضو مافیا فعال می‌شود.');
            const shotBtn = document.querySelector('.mafia-action-btn[data-action="shot"]');
            if (shotBtn && selectedBtn.dataset.action !== 'shot') {
                shotBtn.click();
            }
            return;
        }

        allMafiaActionBtns.forEach(btn => {
            btn.classList.remove('solid');
            btn.classList.add('outline');
        });

        selectedBtn.classList.remove('outline');
        selectedBtn.classList.add('solid');

        updateMafiaTargetList(action);
    };

    allMafiaActionBtns.forEach(btn => {
        btn.removeEventListener('click', handleMafiaActionSelect);
        btn.addEventListener('click', handleMafiaActionSelect);
    });

    const previouslySelectedActionBtn = document.querySelector('.mafia-action-btn.solid');
    let previousAction = previouslySelectedActionBtn ? previouslySelectedActionBtn.dataset.action : 'shot';

    updateMafiaTargetList(previousAction);

    allMafiaActionBtns.forEach(btn => {
        btn.classList.remove('solid');
        btn.classList.add('outline');
        if (btn.dataset.action === previousAction) {
            btn.classList.remove('outline');
            btn.classList.add('solid');
        }
    });

    if (matadorControlSelect) {
        matadorControlSelect.removeEventListener('change', window.updateNightSelects);
        matadorControlSelect.addEventListener('change', () => window.updateNightSelects(false));
    }
};


// --- Action and Validation Logic ---

const collectNightReport = () => {
    const actions = {};
    const mafiaTargetSelect = document.getElementById('mafia-target-select');
    const mafiaActionBtn = document.querySelector('.mafia-action-btn.solid');
    let mafiaActionName = mafiaActionBtn ? mafiaActionBtn.dataset.action : 'shot';

    let storageActionKey;
    if (mafiaActionName === 'hssheshom') {
        storageActionKey = 'slaughter';
    } else if (mafiaActionName === 'kharidari') {
        storageActionKey = 'purchase';
    } else {
        storageActionKey = 'shot';
    }

    if (mafiaTargetSelect && mafiaTargetSelect.value) {
        actions.mafia = {
            action: storageActionKey,
            target: mafiaTargetSelect.value === 'FAILED' ? 'failed' : mafiaTargetSelect.value,
        };
    }

    const collectAction = (id, key, action) => {
        const select = document.getElementById(id);
        if (select && select.value) {
            actions[key] = {
                action: action,
                target: select.value === 'FAILED' ? 'failed' : select.value,
            };
        }
    };

    collectAction('matador-control-select', 'matador', 'control');
    collectAction('doctor-target-select', 'doctor', 'save');
    collectAction('leon-target-select', 'leon', 'shot');
    collectAction('kin-target-select', 'kin', 'inquiry');
    collectAction('konstantin-target-select', 'konstantin', 'revive');

    return { actions };
};

const validateNightActions = (currentNightActions) => {
    // از getPlayersData بدون پیشوند window. استفاده شده است
    const allRoles = getPlayersData();
    const matadorPlayer = allRoles.find(p => p.role === 'ماتادور');
    const doctorPlayer = allRoles.find(p => p.role === 'دکتر واتسون');
    const matadorTarget = currentNightActions.matador?.target;

    const isDoctorLocked = matadorPlayer?.status === 'alive' && doctorPlayer && matadorTarget === doctorPlayer.name;

    if (matadorPlayer?.status === 'alive' && matadorTarget && matadorTarget !== '') {
        const targetPlayer = allRoles.find(p => p.name === matadorTarget);
        if (targetPlayer?.side === 'mafia') {
            return {
                isValid: false,
                errorMessage: '❌ ماتادور نمی‌تواند بازیکنان گروه مافیا را قفل کند.'
            };
        }
    }

    const requiredRoles = [
        { key: 'mafia', persianName: 'گروه مافیا' },
        { key: 'matador', persianName: 'ماتادور' },
        { key: 'doctor', persianName: 'دکتر واتسون' }
    ];

    for (const roleInfo of requiredRoles) {
        const key = roleInfo.key;
        const name = roleInfo.persianName;

        const isRoleActive = getRoleStatus(key, allRoles);
        const actionIsRegistered = currentNightActions[key] && currentNightActions[key].target && currentNightActions[key].target !== '';

        if (!isRoleActive) continue;

        if (key === 'doctor' && isDoctorLocked) continue;

        if (!actionIsRegistered) {
            if (key === 'mafia') {
                return {
                    isValid: false,
                    errorMessage: '❌ گروه مافیا فعال است و باید یک عملیات (شلیک، حس ششم، یا خریداری) را با تعیین هدف ثبت کند.'
                };
            }
            return {
                isValid: false,
                errorMessage: `❌ بازیکن نقش ${name} زنده است و باید یک نفر را انتخاب کند.`
            };
        }
    }

    return { isValid: true, errorMessage: '' };
};

const saveNightReport = () => {
    const reportActions = collectNightReport().actions;
    const validation = validateNightActions(reportActions);

    if (!validation.isValid) {
        window.notyf.error(validation.errorMessage);
        return;
    }

    const report = {
        actions: reportActions,
        night: currentNightNumber,
        timestamp: new Date().toLocaleString('fa-IR'),
        outcome: []
    };

    const targets = Object.values(report.actions).map(a => a.target).filter(t => t);
    if (targets.length === 0) {
        window.notyf.error("لطفاً حداقل یک عملیات شب را برای ذخیره ثبت کنید.");
        return;
    }

    nightReportHistory.push(report);
    currentNightNumber++;

    window.notyf.success(`گزارش شب ${report.night} با موفقیت ذخیره شد. آماده برای شب ${currentNightNumber}.`);

    document.querySelectorAll('.night-target-select').forEach(select => select.value = '');

    const shotBtn = document.querySelector('.mafia-action-btn[data-action="shot"]');
    if (shotBtn) {
        shotBtn.click();
    }

    window.updateNightSelects(true);
};

const generateReportHTML = (nightReport) => {
    let reportHTML = `<h3>گزارش شب ${nightReport.night}</h3>`;

    if (!nightReport) {
        reportHTML += '<p class="text-secondary">❌ گزارش شب در دسترس نیست.</p>';
        return reportHTML;
    }

    let reportActions = [];
    if (nightReport.actions && typeof nightReport.actions === 'object' && !Array.isArray(nightReport.actions)) {
        for (const [key, value] of Object.entries(nightReport.actions)) {
            if (value && value.action && value.target && value.target !== '') {
                const roleName = window.ROLE_KEY_MAPPING[key] || key;
                reportActions.push({
                    role: roleName,
                    name: value.action,
                    target: value.target,
                    status: value.status || (value.target === 'failed' ? 'ناموفق' : 'موفق')
                });
            }
        }
    }

    // --- Section 1: Display Recorded Actions ---
    if (reportActions.length === 0) {
        reportHTML += '<p class="text-secondary">در این شب هیچ عملیاتی ثبت نشده است.</p>';
    } else {
        reportHTML += '<ul class="list-group list-group-flush">';

        reportActions.forEach(action => {
            let actionText = '';
            const getTargetNameBold = (name) => name && name !== 'failed' ? `<b>${window.escapeHTML(name)}</b>` : '';
            const targetName = getTargetNameBold(action.target);

            if (action.role === 'گروه مافیا' || action.role === 'مافیا') {
                if (action.target === 'failed') {
                    actionText = '☠️ گروه مافیا در عملیاتش ناموفق بود.';
                } else if (action.name === 'shot') {
                    actionText = `☠️ گروه مافیا به ${targetName} شلیک کردند.`;
                } else if (action.name === 'slaughter') {
                    actionText = `☠️ گروه مافیا ${targetName} را با حس ششم سلاخی کردند.`;
                } else if (action.name === 'purchase') {
                    actionText = `☠️ گروه مافیا ${targetName} را به عنوان مافیای ساده خریداری کردند.`;
                }
            } else if (action.role === 'ماتادور') {
                actionText = `⚔️ ماتادور ${targetName} را قفل کرد و او نتوانست کارش را انجام دهد.`;
            } else if (action.role === 'دکتر واتسون') {
                actionText = `🛡️ دکتر واتسون ${targetName} را نجات داد.`;
            } else if (action.role === 'لئون حرفه ای') {
                actionText = `🛡️ لئون حرفه ای به ${targetName} شلیک کرد.`;
            } else if (action.role === 'همشهری کین') {
                actionText = `🕵️ همشهری کین استعلام ${targetName} را گرفت.`;
            } else if (action.role === 'کنستانتین') {
                actionText = `✨ کنستانتین ${targetName} را مجدداً متولد کرد.`;
            }

            if (actionText) {
                reportHTML += `<li class="list-group-item">${actionText}</li>`;
            }
        });

        reportHTML += '</ul>';
    }

    // --- Section 2: Final Night Results (Outcomes) ---
    if (nightReport.outcome && Array.isArray(nightReport.outcome) && nightReport.outcome.length > 0) {
        reportHTML += '<h4 class="mt-4">نتایج نهایی</h4><ul class="list-unstyled">';

        let killedPlayers = [];
        let slaughteredPlayers = [];
        let revivedPlayers = [];
        let kinMafiaInquiry = null;

        nightReport.outcome.forEach(outcome => {
            if (outcome.type === 'Killed') {
                killedPlayers.push(outcome.message.replace('کشته شد', '').trim());
            } else if (outcome.type === 'Slaughtered') {
                slaughteredPlayers.push(outcome.message.replace('سلاخی شد', '').trim());
            } else if (outcome.type === 'Revived') {
                revivedPlayers.push(outcome.message.replace('مجدداً متولد شد', '').trim());
            } else if (outcome.type === 'MafiaInquiry') {
                kinMafiaInquiry = outcome.message;
            }
        });

        if (revivedPlayers.length > 0) {
            const revivedList = revivedPlayers.map(p => `<b>${window.escapeHTML(p)}</b>`).join(' و ');
            reportHTML += `<li>✨ شب گذشته ${revivedList} مجدداً متولد شد.</li>`;
        }

        const allCasualties = [...slaughteredPlayers, ...killedPlayers];

        if (allCasualties.length === 0) {
            if (revivedPlayers.length === 0) {
                reportHTML += `<li>💤 شب گذشته هیچ کشته و اتفاق مهمی نداشتیم.</li>`;
            }
        } else {
            let casualtyMessage = '💀 شب گذشته ';

            if (slaughteredPlayers.length > 0) {
                const slaughtList = slaughteredPlayers.map(p => `<b>${window.escapeHTML(p)}</b>`).join(' و ');
                casualtyMessage += `${slaughtList} سلاخی شد`;

                if (killedPlayers.length > 0) {
                    const killedList = killedPlayers.map(p => `<b>${window.escapeHTML(p)}</b>`).join(' و ');
                    casualtyMessage += ` و ${killedList} کشته شد.`;
                } else {
                    casualtyMessage += `.`;
                }
            } else if (killedPlayers.length > 0) {
                const killedList = killedPlayers.map(p => `<b>${window.escapeHTML(p)}</b>`).join(' و ');
                casualtyMessage += `${killedList} کشته شد.`;
            }
            reportHTML += `<li>${casualtyMessage}</li>`;
        }

        if (kinMafiaInquiry) {
            reportHTML += `<li>🕵️‍♀️ طبق استعلامات همشهری کین <b>${window.escapeHTML(kinMafiaInquiry)}</b> مافیا است.</li>`;
        }

        reportHTML += '</ul>';
    }

    return reportHTML;
};

const showPastReports = () => {
    if (nightReportHistory.length === 0) {
        window.showModal('گزارش شب‌ها', '<p>هنوز گزارشی برای نمایش ثبت نشده است.</p>');
        return;
    }

    let reportsHTML = nightReportHistory.map(generateReportHTML).reverse().join('');
    window.showModal('گزارش شب‌های گذشته', reportsHTML);
};


// --- Initialization Function (Global) ---

window.initNightReport = () => {
    const saveNightReportBtn = document.getElementById('save-night-report-btn');
    const viewPastReportsBtn = document.getElementById('view-past-reports-btn');

    if (saveNightReportBtn) {
        saveNightReportBtn.addEventListener('click', saveNightReport);
    }
    if (viewPastReportsBtn) {
        viewPastReportsBtn.addEventListener('click', showPastReports);
    }
};