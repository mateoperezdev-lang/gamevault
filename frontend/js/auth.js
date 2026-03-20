// frontend/js/auth.js - VERSIÓN COMPLETA
const Auth = (() => {
    const USERS_KEY = 'gamevault_users';
    const CURRENT_USER_KEY = 'gamevault_current_user';

    const defaultUsers = [
        {
            id: '1',
            username: 'admin',
            email: 'admin@test.com',
            password: 'admin123',
            biblioteca: [],
            completados: [],
            favoritos: [],
            resenas: [],
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            username: 'demo',
            email: 'demo@test.com',
            password: 'demo123',
            biblioteca: [],
            completados: [],
            favoritos: [],
            resenas: [],
            createdAt: new Date().toISOString()
        }
    ];

    const init = () => {
        if (!localStorage.getItem(USERS_KEY)) {
            localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
        }
    };

    const login = (email, password) => {
        const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            throw new Error('Email o contraseña incorrectos');
        }

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        return user;
    };

    const logout = () => {
        localStorage.removeItem(CURRENT_USER_KEY);
        window.location.href = 'index.html';
    };

    const getCurrentUser = () => {
        const userJson = localStorage.getItem(CURRENT_USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    };

    const isAuthenticated = () => {
        return !!getCurrentUser();
    };

    const updateUser = (updatedUser) => {
        const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
        const index = users.findIndex(u => u.id === updatedUser.id);
        
        if (index !== -1) {
            users[index] = updatedUser;
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        init();

        const currentPage = window.location.pathname.split('/').pop();
        
        if (currentPage === 'login.html') {
            const redirectTarget = sessionStorage.getItem('redirectAfterLogin');
            
            if (!redirectTarget) {
                setTimeout(() => {
                    if (window.location.pathname.includes('login.html')) {
                        window.location.href = 'index.html';
                    }
                }, 30000);
            }
        }

        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;

                try {
                    const user = login(email, password);
                    
                    if (user) {
                        const redirectTarget = sessionStorage.getItem('redirectAfterLogin') || 'index.html';
                        sessionStorage.removeItem('redirectAfterLogin');
                        window.location.href = redirectTarget;
                    }
                } catch (error) {
                    alert(error.message);
                }
            });
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
    });

    return {
        login,
        logout,
        getCurrentUser,
        isAuthenticated,
        updateUser
    };
})();