document.addEventListener('DOMContentLoaded', () => {
    const citizenContainer = document.getElementById('citizen-roles-container');
    const mafiaContainer = document.getElementById('mafia-roles-container');
    const neutralContainer = document.getElementById('neutral-roles-container');
    const selectedRolesCount = document.getElementById('selected-roles-count');
    const confirmButton = document.getElementById('confirm-roles');
    const backButton = document.getElementById('back-to-tab2');
    const infoButton = document.getElementById('info-button');
    const modal = document.getElementById('role-modal');
    const closeButton = modal.querySelector('.close-button');
    const roleListContainer = document.createElement('div');

    // اطلاعات نقش‌ها
    const roles = {
        citizen: ['دکتر واتسون', 'لئون حرفه ای', 'همشهری کین', 'کنستانتین', 'شهروند ساده'],
        mafia: ['پدرخوانده', 'ماتادور', 'ساول گودمن', 'مافیای ساده'],
        neutral: ['نوستراداموس', 'جک اسپارو', 'شرلوک هولمز']
    };

    let selectedRoles = [];
    let maxRolesCount = 0;
    let simpleCitizenCount = 0;

    // بازگشت به تب دوم
    backButton.addEventListener('click', () => {
        window.location.href = '../tab2';
    });

    // بارگذاری نقش‌ها
    const loadRoles = () => {
        roles.citizen.forEach(role => createRoleButton(role, 'citizen', citizenContainer));
        roles.mafia.forEach(role => createRoleButton(role, 'mafia', mafiaContainer));
        roles.neutral.forEach(role => createRoleButton(role, 'neutral', neutralContainer));
    };

    // ساخت دکمه نقش‌ها
    const createRoleButton = (role, type, container) => {
        const button = document.createElement('button');
        button.classList.add('role-button', type);
        button.dataset.role = role;

        if (role === 'شهروند ساده') {
            button.dataset.count = 0;
            button.innerHTML = `
                ${role} 
                <span class="citizen-count" style="margin-left: 8px;">× 0</span>
                <button class="remove-simple-citizen" style="display:none;">
                    <img src="https://gholamhasan.sirv.com/clear-x.png" alt="حذف">
                </button>`;
        } else {
            button.textContent = role;
        }

        button.addEventListener('click', () => toggleRoleSelection(button));
        container.appendChild(button);
    };

    // تغییر وضعیت انتخاب نقش
    const toggleRoleSelection = (button) => {
        const role = button.dataset.role;

        if (role === 'شهروند ساده') {
            handleSimpleCitizenSelection(button);
        } else {
            if (button.classList.contains('selected')) {
                deselectRole(button, role);
            } else if (selectedRoles.length < maxRolesCount && !button.disabled) {
                selectRole(button, role);
            }
        }

        checkStatus();
    };

    // مدیریت انتخاب شهروند ساده
    const handleSimpleCitizenSelection = (button) => {
        const maxSimpleCitizen = 4;
        const countSpan = button.querySelector('.citizen-count');
        const removeButton = button.querySelector('.remove-simple-citizen');

        if (simpleCitizenCount < maxSimpleCitizen && selectedRoles.length < maxRolesCount) {
            simpleCitizenCount++;
            selectedRoles.push('شهروند ساده');
            countSpan.textContent = `× ${simpleCitizenCount}`;
            button.classList.add('selected');
            removeButton.style.display = 'inline-block';

            removeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                handleRemoveSimpleCitizen(button);
            });
        }
    };

    // مدیریت حذف شهروند ساده
    const handleRemoveSimpleCitizen = (button) => {
        const countSpan = button.querySelector('.citizen-count');
        const removeButton = button.querySelector('.remove-simple-citizen');

        if (simpleCitizenCount > 0) {
            simpleCitizenCount--;
            selectedRoles.splice(selectedRoles.indexOf('شهروند ساده'), 1);

            countSpan.textContent = `× ${simpleCitizenCount}`;

            if (simpleCitizenCount === 0) {
                button.classList.remove('selected');
                removeButton.style.display = 'none';
            }
        }

        checkStatus();
    };

    // انتخاب نقش
    const selectRole = (button, role) => {
        button.classList.add('selected');
        selectedRoles.push(role);
    };

    // لغو انتخاب نقش
    const deselectRole = (button, role) => {
        button.classList.remove('selected');
        selectedRoles = selectedRoles.filter(r => r !== role);
    };

    // بررسی محدودیت‌ها
    const checkStatus = () => {
        const buttons = document.querySelectorAll('.role-button');
        buttons.forEach(button => {
            const role = button.dataset.role;

            if (role === 'دکتر واتسون' || role === 'پدرخوانده') {
                button.disabled = false;
            } else if (['لئون حرفه ای', 'همشهری کین', 'کنستانتین'].includes(role)) {
                if (!selectedRoles.includes('دکتر واتسون')) {
                    deselectRole(button, role);
                    button.disabled = true;
                } else {
                    button.disabled = false;
                }
            } else if (role === 'شهروند ساده') {
                const requiredCitizens = ['دکتر واتسون', 'لئون حرفه ای', 'همشهری کین', 'کنستانتین'];
                if (!requiredCitizens.every(r => selectedRoles.includes(r))) {
                    resetSimpleCitizen();
                    button.disabled = true;
                } else {
                    button.disabled = simpleCitizenCount >= 4 || selectedRoles.length >= maxRolesCount;
                }
            } else if (role === 'ماتادور') {
                if (!selectedRoles.includes('پدرخوانده')) {
                    deselectRole(button, role);
                    button.disabled = true;
                } else {
                    button.disabled = false;
                }
            } else if (role === 'ساول گودمن') {
                if (!selectedRoles.includes('شهروند ساده') || !selectedRoles.includes('ماتادور')) {
                    deselectRole(button, role);
                    button.disabled = true;
                } else {
                    button.disabled = false;
                }
            } else if (role === 'مافیای ساده') {
                if (!selectedRoles.includes('ساول گودمن')) {
                    deselectRole(button, role);
                    button.disabled = true;
                } else {
                    button.disabled = false;
                }
            } else if (['نوستراداموس', 'جک اسپارو', 'شرلوک هولمز'].includes(role)) {
                const otherNeutrals = ['نوستراداموس', 'جک اسپارو', 'شرلوک هولمز'].filter(r => r !== role);
                button.disabled = selectedRoles.some(r => otherNeutrals.includes(r));
            }
        });
        updateSelectedRolesCount();
    };

    // بازنشانی شهروند ساده
    const resetSimpleCitizen = () => {
        const simpleCitizenButton = document.querySelector('.role-button[data-role="شهروند ساده"]');
        const countSpan = simpleCitizenButton.querySelector('.citizen-count');
        const removeButton = simpleCitizenButton.querySelector('.remove-simple-citizen');

        if (simpleCitizenButton.classList.contains('selected')) {
            simpleCitizenButton.classList.remove('selected');
        }

        simpleCitizenCount = 0;
        selectedRoles = selectedRoles.filter(r => r !== 'شهروند ساده');
        countSpan.textContent = '× 0';
        if (removeButton) {
            removeButton.style.display = 'none';
        }
    };

    // به‌روزرسانی شمارش نقش‌های انتخاب‌شده
    const updateSelectedRolesCount = () => {
        selectedRolesCount.textContent = `تعداد نقش‌های انتخاب شده: ${selectedRoles.length} از ${maxRolesCount}`;
        const hasKeyRoles = selectedRoles.includes('دکتر واتسون') && selectedRoles.includes('پدرخوانده');
        confirmButton.disabled = !(selectedRoles.length === maxRolesCount && hasKeyRoles);
    };

    confirmButton.addEventListener('click', () => {
        localStorage.setItem('selectedRoles', JSON.stringify(selectedRoles));
        window.location.href = '../tab4/';
    });
    

    const loadMaxRolesCount = () => {
        const players = JSON.parse(localStorage.getItem('players')) || [];
        maxRolesCount = players.length;
        updateSelectedRolesCount();
    };

    roleListContainer.id = 'role-list';
    modal.querySelector('.modal-content').appendChild(roleListContainer);

    // دریافت اطلاعات JSON از URL
    const fetchRoleInfo = async () => {
        try {
            const response = await fetch('https://gholamhasan.sirv.com/desc-2.json');
            if (!response.ok) throw new Error('Failed to fetch data');
            const rolesData = await response.json();
            displayAllRoles(rolesData); // نمایش نقش‌ها
        } catch (error) {
            console.error('Error fetching roles data:', error);
            roleListContainer.innerHTML = '<p style="color: red;">مشکلی در دریافت اطلاعات رخ داد.</p>';
        }
    };

    // نمایش اطلاعات همه نقش‌ها
    const displayAllRoles = (rolesData) => {
        roleListContainer.innerHTML = ''; // پاک کردن اطلاعات قبلی
        rolesData.forEach(role => {
            // ایجاد کارت برای هر نقش
            const roleCard = document.createElement('div');
            roleCard.classList.add('role-card');

            // افزودن تصویر نقش‌ها
            const roleImagesContainer = document.createElement('div');
            roleImagesContainer.classList.add('role-images');
            if (role['role-images'].length > 1) {
                roleImagesContainer.classList.add('multiple-images');
            }
            role['role-images'].forEach(imageUrl => {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = role['role-name'];
                img.style.maxWidth = '200px';
                img.style.marginBottom = '10px';
                roleImagesContainer.appendChild(img);
            });
            roleCard.appendChild(roleImagesContainer);

            // افزودن نام نقش
            const roleName = document.createElement('h3');
            roleName.textContent = role['role-name'];
            roleCard.appendChild(roleName);

            // افزودن توضیحات نقش
            const roleExplanation = document.createElement('p');
            roleExplanation.textContent = role['role-explanation'];
            roleCard.appendChild(roleExplanation);

            // افزودن کارت به لیست
            roleListContainer.appendChild(roleCard);
            console.log(roleListContainer);
        });

        // نمایش مودال
        modal.style.display = 'flex';
    };

    // بستن مودال
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // باز کردن مودال با کلیک روی دکمه
    infoButton.addEventListener('click', fetchRoleInfo);

    loadMaxRolesCount();
    loadRoles();
    checkStatus();
});