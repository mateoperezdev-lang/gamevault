// frontend/js/app.js - VERSIÓN FINAL
// Los juegos se cargan siempre, el login es solo para acciones

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

    // ===== FUNCIONES AUXILIARES =====
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

    // ===== ACTUALIZAR BOTONES DE AUTENTICACIÓN (SIEMPRE VISIBLES) =====
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

    // ===== CARGA DE JUEGOS (SIEMPRE SE EJECUTA) =====
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
            
            if (juegos && juegos.length > 0) {
                JuegosUI.mostrarJuegos(juegos, elements.gamesGrid, true);
                updateResultsCount(juegos.length, totalJuegos);
                
                // Actualizar paginación
                Paginacion.setTotalPages(totalJuegos);
                Paginacion.setCurrentPage(page);
            } else {
                elements.gamesGrid.innerHTML = '<div class="no-results">No se encontraron juegos</div>';
                updateResultsCount(0);
            }
            
        } catch (error) {
            console.error('❌ Error al cargar juegos:', error);
            // Mostrar mensaje de error pero NO afecta los botones de login
            elements.gamesGrid.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 60px 20px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: var(--accent-primary); margin-bottom: 20px;"></i>
                    <h3 style="margin-bottom: 15px;">Error de conexión</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 20px;">No se pudieron cargar los juegos. Por favor:</p>
                    <ul style="text-align: left; max-width: 400px; margin: 0 auto 20px; color: var(--text-secondary);">
                        <li>✓ Verifica tu conexión a internet</li>
                        <li>✓ Recarga la página</li>
                        <li>✓ Si el problema persiste, intenta más tarde</li>
                    </ul>
                    <button onclick="location.reload()" class="action-button" style="margin: 0 auto; display: inline-block; padding: 12px 24px;">
                        <i class="fas fa-sync-alt"></i> Recargar página
                    </button>
                </div>
            `;
            updateResultsCount(0);
        } finally {
            toggleLoading(false);
        }
    };

    // ===== BÚSQUEDA =====
    const buscar = () => {
        const searchTerm = elements.searchInput.value.trim();
        currentSearchTerm = searchTerm;
        
        Paginacion.setSearchTerm(searchTerm);
        cargarJuegos(1, searchTerm);
    };

    // ===== DETALLES DEL JUEGO =====
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

    // ===== MANEJADOR DE CAMBIO DE PÁGINA =====
    const handlePageChange = (page) => {
        cargarJuegos(page, currentSearchTerm);
    };

    // ===== CONFIGURAR EVENTOS =====
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

        // Click en tarjetas (solo si no es un botón de acción)
        elements.gamesGrid.addEventListener('click', (e) => {
            const gameCard = e.target.closest('.game-card');
            if (gameCard && !e.target.classList.contains('action-button')) {
                const gameId = gameCard.dataset.gameId;
                mostrarDetalle(gameId);
            }
        });
    };

    // ===== INICIALIZACIÓN =====
    const init = () => {
        console.log('🚀 Inicializando GameVault...');
        
        // 1. PRIMERO: Configurar eventos
        setupEventListeners();
        
        // 2. SEGUNDO: Actualizar botones de autenticación (SIEMPRE)
        updateAuthLinks();
        
        // 3. TERCERO: Inicializar paginación
        Paginacion.init(handlePageChange);
        
        // 4. CUARTO: Cargar juegos (SIEMPRE, aunque falle)
        console.log('🎮 Cargando juegos...');
        cargarJuegos(1);
    };

    // API pública
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