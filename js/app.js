// js/app.js
const App = (() => {
    const elements = {
        gamesGrid: document.getElementById('gamesGrid'),
        searchInput: document.getElementById('searchInput'),
        searchButton: document.getElementById('searchButton'),
        gameModal: document.getElementById('gameModal'),
        closeModal: document.getElementById('closeModal'),
        loadingSpinner: document.getElementById('loadingSpinner'),
        resultsTitle: document.getElementById('resultsTitle'),
        resultsCount: document.getElementById('resultsCount'),
        authLinks: document.getElementById('authLinks')
    };

    let currentSearchTerm = '';

    const toggleLoading = (show) => {
        elements.loadingSpinner.style.display = show ? 'block' : 'none';
    };

    const updateResultsCount = (count) => {
        elements.resultsCount.textContent = `${count} juegos encontrados`;
    };

    const updateAuthLinks = () => {
        if (elements.authLinks) {
            if (Auth.isAuthenticated()) {
                const user = Auth.getCurrentUser();
                elements.authLinks.innerHTML = `
                    <a href="perfil.html"><i class="fas fa-user"></i> ${user.username}</a>
                    <button id="logoutBtn" class="logout-button"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</button>
                `;
                
                document.getElementById('logoutBtn')?.addEventListener('click', Auth.logout);
            } else {
                elements.authLinks.innerHTML = `
                    <a href="login.html"><i class="fas fa-sign-in-alt"></i> Iniciar Sesión</a>
                    <a href="registro.html"><i class="fas fa-user-plus"></i> Registrarse</a>
                `;
            }
        }
    };

    const iniciarApp = async () => {
        try {
            toggleLoading(true);
            const juegos = await API.obtenerJuegos();
            JuegosUI.mostrarJuegos(juegos, elements.gamesGrid, true);
            updateResultsCount(juegos.length);
            elements.resultsTitle.textContent = 'Juegos destacados';
            updateAuthLinks();
        } catch (error) {
            console.error('Error al iniciar la aplicación:', error);
            elements.gamesGrid.innerHTML = '<div class="error">Error al cargar los juegos. Por favor, intenta de nuevo.</div>';
        } finally {
            toggleLoading(false);
        }
    };

    const buscar = async () => {
        const searchTerm = elements.searchInput.value.trim();
        
        if (!searchTerm) {
            await iniciarApp();
            return;
        }

        try {
            toggleLoading(true);
            currentSearchTerm = searchTerm;
            const juegos = await API.buscarJuegos(searchTerm);
            JuegosUI.mostrarJuegos(juegos, elements.gamesGrid, true);
            updateResultsCount(juegos.length);
            elements.resultsTitle.textContent = `Resultados para: "${searchTerm}"`;
        } catch (error) {
            console.error('Error al buscar juegos:', error);
            elements.gamesGrid.innerHTML = '<div class="error">Error al buscar juegos. Por favor, intenta de nuevo.</div>';
        } finally {
            toggleLoading(false);
        }
    };

    const mostrarDetalle = async (id) => {
        try {
            toggleLoading(true);
            const juego = await API.obtenerJuegoDetalle(id);
            JuegosUI.mostrarDetallesJuego(juego);
            elements.gameModal.style.display = 'block';
        } catch (error) {
            console.error('Error al mostrar detalles del juego:', error);
            alert('Error al cargar los detalles del juego');
        } finally {
            toggleLoading(false);
        }
    };

    const cerrarModal = () => {
        elements.gameModal.style.display = 'none';
    };

    const setupEventListeners = () => {
        elements.searchButton.addEventListener('click', buscar);

        elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                buscar();
            }
        });

        elements.closeModal.addEventListener('click', cerrarModal);

        window.addEventListener('click', (e) => {
            if (e.target === elements.gameModal) {
                cerrarModal();
            }
        });

        elements.gamesGrid.addEventListener('click', (e) => {
            const gameCard = e.target.closest('.game-card');
            if (gameCard && !e.target.classList.contains('action-button')) {
                const gameId = gameCard.dataset.gameId;
                mostrarDetalle(gameId);
            }
        });
    };

    const init = () => {
        setupEventListeners();
        iniciarApp();
    };

    return {
        init,
        buscar,
        mostrarDetalle,
        cerrarModal
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});