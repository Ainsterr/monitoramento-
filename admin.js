document.addEventListener('DOMContentLoaded', function() {
    // Verificar se é admin
    const session = checkAuth();
    if (!session || !session.isAdmin) {
        window.location.href = 'index.html';
        return;
    }
    
    // Carregar lista de usuários
    loadUsers();
    
    // Configurar modal de adicionar usuário
    const modal = document.getElementById('add-user-modal');
    const addUserButton = document.getElementById('add-user-button');
    const closeModal = document.querySelector('.close-modal');
    
    addUserButton.addEventListener('click', function() {
        modal.style.display = 'block';
        
        // Definir data mínima como hoje
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('expires-at').min = today;
    });
    
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Configurar formulário de adicionar usuário
    document.getElementById('add-user-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userData = {
            username: document.getElementById('new-username').value,
            password: document.getElementById('new-password').value,
            expiresAt: document.getElementById('expires-at').value,
            isAdmin: document.getElementById('is-admin').checked
        };
        
        const result = addUser(userData);
        
        if (result.error) {
            alert(result.error);
        } else {
            modal.style.display = 'none';
            loadUsers();
            document.getElementById('add-user-form').reset();
        }
    });
});

// Carregar e exibir usuários
function loadUsers() {
    const users = getUsers();
    const tableBody = document.getElementById('users-table-body');
    
    // Limpar tabela
    tableBody.innerHTML = '';
    
    // Adicionar usuários à tabela
    users.forEach(user => {
        const row = document.createElement('tr');
        
        // Coluna de nome de usuário
        const usernameCell = document.createElement('td');
        usernameCell.textContent = user.username;
        row.appendChild(usernameCell);
        
        // Coluna de data de expiração
        const expiresCell = document.createElement('td');
        const expiresInput = document.createElement('input');
        expiresInput.type = 'date';
        expiresInput.value = new Date(user.expiresAt).toISOString().split('T')[0];
        expiresInput.addEventListener('change', function() {
            updateUser(user.id, { expiresAt: new Date(this.value).toISOString() });
        });
        expiresCell.appendChild(expiresInput);
        row.appendChild(expiresCell);
        
        // Coluna de status
        const statusCell = document.createElement('td');
        const statusContainer = document.createElement('div');
        statusContainer.className = 'form-group checkbox';
        
        const statusCheckbox = document.createElement('input');
        statusCheckbox.type = 'checkbox';
        statusCheckbox.id = `status-${user.id}`;
        statusCheckbox.checked = user.isActive;
        statusCheckbox.addEventListener('change', function() {
            updateUser(user.id, { isActive: this.checked });
        });
        
        const statusLabel = document.createElement('label');
        statusLabel.htmlFor = `status-${user.id}`;
        statusLabel.textContent = user.isActive ? 'Ativo' : 'Inativo';
        
        statusContainer.appendChild(statusCheckbox);
        statusContainer.appendChild(statusLabel);
        statusCell.appendChild(statusContainer);
        row.appendChild(statusCell);
        
        // Coluna de admin
        const adminCell = document.createElement('td');
        adminCell.textContent = user.isAdmin ? 'Sim' : 'Não';
        row.appendChild(adminCell);
        
        // Coluna de ações
        const actionsCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.className = 'button destructive';
        deleteButton.textContent = 'Excluir';
        deleteButton.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja excluir este usuário?')) {
                deleteUser(user.id);
                loadUsers();
            }
        });
        actionsCell.appendChild(deleteButton);
        row.appendChild(actionsCell);
        
        tableBody.appendChild(row);
    });
}