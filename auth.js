// Funções de autenticação e gerenciamento de usuários

// Inicializar dados de exemplo se não existirem
function initializeData() {
    if (!localStorage.getItem('users')) {
        const initialUsers = [
            {
                id: '1',
                username: 'admin',
                password: 'admin123', // Em um app real, isso seria criptografado
                isAdmin: true,
                isActive: true,
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 ano a partir de agora
            }
        ];
        localStorage.setItem('users', JSON.stringify(initialUsers));
    }
    
    if (!localStorage.getItem('videoSiteUrl')) {
        localStorage.setItem('videoSiteUrl', 'https://seu-site-de-videos.com');
    }
}

// Inicializar dados
initializeData();

// Verificar se o usuário está autenticado
function checkAuth() {
    const sessionData = localStorage.getItem('session');
    if (!sessionData) {
        return null;
    }
    
    try {
        return JSON.parse(sessionData);
    } catch (error) {
        return null;
    }
}

// Login
function login(username, password) {
    if (!username || !password) {
        return { error: 'Usuário e senha são obrigatórios' };
    }
    
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.username === username);
    
    if (!user || user.password !== password) {
        return { error: 'Usuário ou senha inválidos' };
    }
    
    if (!user.isActive) {
        return { error: 'Sua conta está inativa' };
    }
    
    if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
        return { error: 'Seu acesso expirou' };
    }
    
    // Criar sessão
    const session = {
        userId: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        expiresAt: user.expiresAt
    };
    
    localStorage.setItem('session', JSON.stringify(session));
    
    return { success: true };
}

// Logout
function logout() {
    localStorage.removeItem('session');
    return { success: true };
}

// Obter todos os usuários
function getUsers() {
    const users = JSON.parse(localStorage.getItem('users'));
    // Retornar cópia sem senhas
    return users.map(({ password, ...user }) => user);
}

// Adicionar usuário
function addUser(userData) {
    if (!userData.username || !userData.password || !userData.expiresAt) {
        return { error: 'Todos os campos são obrigatórios' };
    }
    
    const users = JSON.parse(localStorage.getItem('users'));
    
    // Verificar se o usuário já existe
    if (users.some(u => u.username === userData.username)) {
        return { error: 'Nome de usuário já existe' };
    }
    
    const newUser = {
        id: Math.random().toString(36).substring(2, 9), // Gerar ID aleatório
        username: userData.username,
        password: userData.password,
        isAdmin: userData.isAdmin || false,
        isActive: true,
        expiresAt: new Date(userData.expiresAt).toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Retornar sem senha
    const { password, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword };
}

// Atualizar usuário
function updateUser(userId, data) {
    const users = JSON.parse(localStorage.getItem('users'));
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) {
        return { success: false };
    }
    
    users[index] = { ...users[index], ...data };
    localStorage.setItem('users', JSON.stringify(users));
    
    return { success: true };
}

// Excluir usuário
function deleteUser(userId) {
    let users = JSON.parse(localStorage.getItem('users'));
    const initialLength = users.length;
    
    users = users.filter(u => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(users));
    
    return { success: users.length < initialLength };
}