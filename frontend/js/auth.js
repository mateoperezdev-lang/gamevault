// frontend/js/auth.js - VERSIÓN CORREGIDA (sin modales automáticos)
const Auth = (() => {
    const USERS_KEY = 'gamevault_users';
    const CURRENT_USER_KEY = 'gamevault_current_user';

    const init = () => {
        if (!localStorage.getItem(USERS_KEY)) {
            localStorage.setItem(USERS_KEY, JSON.stringify([]));
        }
    };

    const register = (username, email, password) => {
        const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
        
        if (users.find(u => u.email === email)) {
            throw new Error('El email ya está registrado');
        }
        
        if (users.find(u => u.username === username)) {
            throw new Error('El nombre de usuario ya existe');
        }

        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password,
            biblioteca: [],
            completados: [],
            favoritos: [],
            resenas: [],
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        
        return newUser;
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
        window.location.href = 'index.html'; // Redirige al inicio
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

    // SOLO ESTO - NADA DE MODALES AUTOMÁTICOS
    document.addEventListener('DOMContentLoaded', () => {
        init();

        // Registro
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const username = document.getElementById('username').value;
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirmPassword').value;

                if (password !== confirmPassword) {
                    alert('Las contraseñas no coinciden');
                    return;
                }

                try {
                    register(username, email, password);
                    alert('Registro exitoso. Por favor inicia sesión.');
                    window.location.href = 'login.html';
                } catch (error) {
                    alert(error.message);
                }
            });
        }

        // Login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;

                try {
                    login(email, password);
                    window.location.href = 'index.html';
                } catch (error) {
                    alert(error.message);
                }
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
    });

    return {
        register,
        login,
        logout,
        getCurrentUser,
        isAuthenticated,
        updateUser
    };
})();