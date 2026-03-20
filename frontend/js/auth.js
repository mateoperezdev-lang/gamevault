// frontend/js/auth.js - VERSIÓN COMPLETA CON AUTO-REDIRECCIÓN
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

        // ===== AUTO-REDIRECCIÓN: Volver a index si no hay acción =====
        const currentPage = window.location.pathname.split('/').pop();
        
        if (currentPage === 'login.html' || currentPage === 'registro.html') {
            const redirectTarget = sessionStorage.getItem('redirectAfterLogin');
            
            // Si no hay redirección pendiente (vino directo, no desde una acción)
            if (!redirectTarget) {
                console.log('🕒 Página de autenticación - Auto-redirección en 30 segundos');
                
                // Auto-redirigir después de 30 segundos de inactividad
                setTimeout(() => {
                    // Verificar si todavía está en la misma página
                    if (window.location.pathname.includes('login.html') || 
                        window.location.pathname.includes('registro.html')) {
                        window.location.href = 'index.html';
                    }
                }, 30000); // 30 segundos
            }
        }

        // REGISTRO
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

        // LOGIN
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;

                try {
                    const user = login(email, password);
                    
                    if (user) {
                        // Verificar si hay una redirección pendiente
                        const redirectTarget = sessionStorage.getItem('redirectAfterLogin') || 'index.html';
                        
                        // Limpiar el sessionStorage
                        sessionStorage.removeItem('redirectAfterLogin');
                        
                        // Redirigir
                        window.location.href = redirectTarget;
                    }
                } catch (error) {
                    alert(error.message);
                }
            });
        }

        // LOGOUT
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