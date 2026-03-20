// js/app.js - VERSIÓN CON PAGINACIÓN
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
        authLinks: document.getElementById('authLinks'),
        paginationContainer: document.getElementById('paginationContainer')
    };

    let currentSearchTerm = '';
    let currentPage = 1;
    const ITEMS_PER_PAGE = 20;

    const toggleLoading = (show) => {
        if (elements.loadingSpinner) {
            elements.loadingSpinner.style.display = show ? 'flex' : 'none';
        }
    };

    const updateResultsCount = (count, total = null) => {
        if (elements.resultsCount) {
            const totalText = total ? ` de ${total}` : '';
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
            
            let juegos;
            if (searchTerm) {
                juegos = await API.buscarJuegos(searchTerm, page, ITEMS_PER_PAGE);
            } else {
                juegos = await API.obtenerJuegos(page, ITEMS_PER_PAGE);
            }
            
            JuegosUI.mostrarJuegos(juegos, elements.gamesGrid, true);
            updateResultsCount(juegos.length);
            
            // Actualizar título
            if (searchTerm) {
                elements.resultsTitle.textContent = `Resultados para: "${searchTerm}"`;
            } else {
                elements.resultsTitle.textContent = 'Juegos destacados';
            }
            
            // Actualizar paginación (asumiendo que la API devuelve total_count)
            // Si no tienes total_count, puedes estimarlo o mantener el actual
            if (juegos.total_count) {
                Paginacion.setTotalPages(juegos.total_count);
            }
            
        } catch (error) {
            console.error('Error al cargar juegos:', error);
            elements.gamesGrid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    Error al cargar los juegos. Por favor, intenta de nuevo.
                </div>
            `;
        } finally {
            toggleLoading(false);
        }
    };

    const buscar = () => {
        const searchTerm = elements.searchInput.value.trim();
        currentSearchTerm = searchTerm;
        currentPage = 1;
        
        Paginacion.setSearchTerm(searchTerm);
        cargarJuegos(currentPage, searchTerm);
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

    const handlePageChange = (page, searchTerm) => {
        currentPage = page;
        cargarJuegos(page, searchTerm);
    };

    const setupEventListeners = () => {
        // Búsqueda
        elements.searchButton.addEventListener('click', buscar);
        elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') buscar();
        });

        // Modal
        elements.closeModal.addEventListener('click', cerrarModal);
        window.addEventListener('click', (e) => {
            if (e.target === elements.gameModal) cerrarModal();
        });

        // Click en tarjetas (delegación)
        elements.gamesGrid.addEventListener('click', (e) => {
            const gameCard = e.target.closest('.game-card');
            if (gameCard && !e.target.classList.contains('action-button')) {
                const gameId = gameCard.dataset.gameId;
                mostrarDetalle(gameId);
            }
        });
    };

    const init = () => {
        // Verificar si hay contenedor de paginación, si no, crearlo
        if (!document.getElementById('paginationContainer')) {
            const main = document.querySelector('main .container');
            const paginationDiv = document.createElement('div');
            paginationDiv.id = 'paginationContainer';
            main.appendChild(paginationDiv);
        }

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

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});