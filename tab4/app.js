document.addEventListener('DOMContentLoaded', () => {
    const backButton = document.getElementById('back-to-tab3');
    const assignedRolesResult = document.getElementById('assigned-roles-result');
    const modal = document.getElementById('role-modal');
    const modalContent = modal.querySelector('.modal-content');

    let shuffledRoles = [];
    let rolesData = [];

    backButton.addEventListener('click', () => {
        window.location.href = '../tab3/';
    });

    const selectedRoles = JSON.parse(localStorage.getItem('selectedRoles')) || [];
    const playerNames = JSON.parse(localStorage.getItem('playerNames')) || [];

    if (selectedRoles.length === 0 || playerNames.length === 0) {
        assignedRolesResult.innerHTML = '<p style="color: red;">هیچ نقشی انتخاب نشده یا بازیکنی تعریف نشده است!</p>';
        return;
    }

    const fetchRolesData = async () => {
        try {
            const response = await fetch('https://gholamhasan.sirv.com/desc-2.json');
            rolesData = await response.json();
        } catch (error) {
            console.error('Error fetching roles data:', error);
        }
    };

    const shuffleRoles = () => {
        shuffledRoles = [...selectedRoles].sort(() => Math.random() - 0.5);
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

    fetchRolesData().then(() => {
        shuffleRoles();
        createPlayerButtons();
    });
});