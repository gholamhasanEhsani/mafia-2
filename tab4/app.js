document.addEventListener('DOMContentLoaded', () => {
    const backButton = document.getElementById('back-to-tab3');
    const manualAdjustmentButton = document.getElementById('manual-adjustment-button');
    const goDashboardButton = document.getElementById('go-dashboard-button');
    const assignedRolesResult = document.getElementById('assigned-roles-result');
    const modal = document.getElementById('role-modal');
    const modalContent = modal.querySelector('.modal-content');

    let shuffledRoles = [];
    let rolesData = [];
    let selectedRoles = [];
    let playerNames = [];

    const currentHash = window.location.hash;

    if (currentHash == '#manual') {
        executeManualMode();
    } else {
        window.location.hash = '#random';
        executeRandomMode();
    }

    backButton.addEventListener('click', () => window.location.href = '../tab3/');

    goDashboardButton.addEventListener('click', () => {
        let finalRolesToSave = [];

        if (window.location.hash === '#manual') {
            const assignedRolesManual = JSON.parse(localStorage.getItem('AssignedRoles')) || [];

            finalRolesToSave = assignedRolesManual.map(item => ({
                name: item.playerName,
                role: item.roleName,
                isAlive: true
            }));

        } else if (window.location.hash === '#random') {
            if (playerNames.length === 0 || shuffledRoles.length === 0) {
                alert("خطا: نقش‌ها یا بازیکنان برای ذخیره سازی نهایی در دسترس نیستند.");
                return;
            }

            finalRolesToSave = playerNames.map((name, index) => ({
                name: name,
                role: shuffledRoles[index],
                isAlive: true
            }));
        }

        if (finalRolesToSave.length > 0) {
            localStorage.setItem('dashboardRoles', JSON.stringify(finalRolesToSave));
            console.log("نقش‌های نهایی برای داشبورد ذخیره شدند:", finalRolesToSave);

            window.location.href = '../dashboard/index.html';
        } else {
            alert("هیچ نقشی برای ذخیره‌سازی یافت نشد.");
        }
    });

    function executeRandomMode() {
        console.log("random mode");
        selectedRoles = JSON.parse(localStorage.getItem('selectedRoles')) || [];
        playerNames = JSON.parse(localStorage.getItem('playerNames')) || [];

        if (selectedRoles.length === 0 || playerNames.length === 0) {
            assignedRolesResult.innerHTML = '<p style="color: red;">هیچ نقشی انتخاب نشده یا بازیکنی تعریف نشده است!</p>';
            return;
        }

        fetchRolesData().then(() => {
            shuffleRoles();
            createPlayerButtons();
        });
    }

    function executeManualMode() {
        console.log("manual mode");
        // AssignedRoles ساختارش: {playerName, roleName}
        const assignedRoles = JSON.parse(localStorage.getItem('AssignedRoles')) || [];
        if (assignedRoles.length === 0) {
            assignedRolesResult.innerHTML = '<p style="color: red;">هیچ نقشی در حالت دستی تخصیص نیافته است!</p>';
            return;
        }

        assignedRolesResult.innerHTML = '';
        assignedRoles.forEach(role => {
            const button = document.createElement('button');
            button.classList.add('role-display-button');
            button.textContent = role.playerName;
            button.addEventListener('click', () => {
                showRoleInModal(role.playerName, role.roleName);
                button.classList.add('seen');
            });
            assignedRolesResult.appendChild(button);
        });
    }

    async function fetchRolesData() {
        try {
            const response = await fetch('https://gholamhasan.sirv.com/desc-2.json');
            rolesData = await response.json();
        } catch (error) {
            console.error('Error fetching roles data:', error);
        }
    };

    const shuffleRoles = () => {
        const arr = [...selectedRoles];
        let m = arr.length;
        while (m > 1) {
            const i = (Math.random() * m--) | 0;
            [arr[m], arr[i]] = [arr[i], arr[m]];
        }
        shuffledRoles = arr;
    };

    const createPlayerButtons = () => {
        assignedRolesResult.innerHTML = '';
        playerNames.forEach((playerName, index) => {
            const button = document.createElement('button');
            button.classList.add('role-display-button');
            button.textContent = `${playerName}`;
            button.addEventListener('click', () => {
                showRoleInModal(playerName, shuffledRoles[index]);
                button.classList.add("seen");
            });
            assignedRolesResult.appendChild(button);
        });
    };

    const showRoleInModal = (playerName, role) => {
        modalContent.innerHTML = '<span class="close-button">&times;</span>';
        
        const roleImage = document.createElement('img');
        roleImage.alt = role;
        roleImage.style.maxWidth = '50%';
        roleImage.style.marginBottom = '20px';
        
        const roleHeader = document.createElement('h3');
        roleHeader.textContent = `${playerName}: ${role}`;
        roleHeader.style.marginBottom = '10px';
        
        const roleExplanation = document.createElement('p');
        roleExplanation.style.textAlign = 'justify';
        
        const roleData = rolesData.find(r => r['role-name'] === role);

        if (roleData) {
            roleImage.src = roleData['role-images'][0];
            roleExplanation.textContent = roleData['role-explanation'];
        } else {
            roleImage.src = "https://gholamhasan.sirv.com/mafia-images/default.png";
            roleExplanation.textContent = "توضیحات نقش یافت نشد.";
            roleExplanation.style.color = 'red';
        }
        
        modalContent.appendChild(roleImage);
        modalContent.appendChild(roleHeader);
        modalContent.appendChild(roleExplanation);
        modal.style.display = 'flex';

        const closeButton = modal.querySelector('.close-button');
        closeButton.addEventListener('click', () => modal.style.display = 'none');
    };

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});