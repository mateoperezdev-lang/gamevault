// frontend/js/app.js - VERSIÓN FINAL
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
    const ITEMS_PER_PAGE = 20;

    const toggleLoading = (show) => {
        if (elements.loadingSpinner) {
            elements.loadingSpinner.style.display = show ? 'flex' : 'none';
        }
    };

    const updateResultsCount = (count, total = null) => {
        if (elements.resultsCount) {
            const totalText = total ? ` de ${total.toLocaleString()}` : '';
            elements.resultsCount.textContent = `${count} juegos mostrados${totalText}`;
        }
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

    const cargarJuegos = async (page = 1, searchTerm = '') => {
        try {
            toggleLoading(true);
            
            let response;
            if (searchTerm) {
                response = await API.buscarJuegos(searchTerm, page, ITEMS_PER_PAGE);
                elements.resultsTitle.textContent = `Resultados para: "${searchTerm}"`;
            } else {
                response = await API.obtenerJuegos(page, ITEMS_PER_PAGE);
                elements.resultsTitle.textContent = 'Juegos destacados';
            }
            
            const juegos = response.results;
            const totalJuegos = response.total;
            
            JuegosUI.mostrarJuegos(juegos, elements.gamesGrid, true);
            updateResultsCount(juegos.length, totalJuegos);
            
            // Actualizar paginación
            Paginacion.setTotalPages(totalJuegos);
            Paginacion.setCurrentPage(page);
            
        } catch (error) {
            console.error('Error al cargar juegos:', error);
            elements.gamesGrid.innerHTML = '<div class="error">Error al cargar juegos</div>';
        } finally {
            toggleLoading(false);
        }
    };

    const buscar = () => {
        const searchTerm = elements.searchInput.value.trim();
        currentSearchTerm = searchTerm;
        
        Paginacion.setSearchTerm(searchTerm);
        cargarJuegos(1, searchTerm);
    };

    const mostrarDetalle = async (id) => {
        try {
            toggleLoading(true);
            const juego = await API.obtenerJuegoDetalle(id);
            JuegosUI.mostrarDetallesJuego(juego);
            elements.gameModal.style.display = 'block';
        } catch (error) {
            console.error('Error al mostrar detalles:', error);
            alert('Error al cargar los detalles del juego');
        } finally {
            toggleLoading(false);
        }
    };

    const cerrarModal = () => {
        elements.gameModal.style.display = 'none';
    };

    const handlePageChange = (page) => {
        cargarJuegos(page, currentSearchTerm);
    };

    const setupEventListeners = () => {
        elements.searchButton.addEventListener('click', buscar);
        elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') buscar();
        });

        elements.closeModal.addEventListener('click', cerrarModal);
        window.addEventListener('click', (e) => {
            if (e.target === elements.gameModal) cerrarModal();
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
        updateAuthLinks();
        
        // Inicializar paginación
        Paginacion.init(handlePageChange);
        
        // Cargar primera página
        cargarJuegos(1);
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