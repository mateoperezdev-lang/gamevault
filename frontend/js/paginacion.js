// frontend/js/paginacion.js - VERSIÓN FINAL CON TOTAL REAL
const Paginacion = (() => {
    let currentPage = 1;
    let totalPages = 1;
    let onPageChangeCallback = null;
    let itemsPerPage = 20;

    const init = (callback) => {
        onPageChangeCallback = callback;
        render();
    };

    const render = (containerId = 'paginationContainer') => {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Solo mostrar paginación si hay más de 1 página
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = '<div class="pagination-container">';
        
        // Botón anterior
        html += `<button class="pagination-button" id="prevPage" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i> Anterior
        </button>`;
        
        // Información de página
        html += `<span class="pagination-info">Página ${currentPage} de ${totalPages}</span>`;
        
        // Botón siguiente
        html += `<button class="pagination-button" id="nextPage" ${currentPage === totalPages ? 'disabled' : ''}>
            Siguiente <i class="fas fa-chevron-right"></i>
        </button>`;
        
        html += '</div>';

        container.innerHTML = html;

        // Event listeners
        document.getElementById('prevPage')?.addEventListener('click', () => {
            if (currentPage > 1 && onPageChangeCallback) {
                goToPage(currentPage - 1);
            }
        });

        document.getElementById('nextPage')?.addEventListener('click', () => {
            if (currentPage < totalPages && onPageChangeCallback) {
                goToPage(currentPage + 1);
            }
        });
    };

    const goToPage = (page) => {
        if (page < 1 || page > totalPages || page === currentPage) return;
        
        currentPage = page;
        
        if (onPageChangeCallback) {
            onPageChangeCallback(currentPage);
        }
        
        render();
        
        // Scroll suave hacia arriba
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const setTotalPages = (totalJuegos) => {
        // Calcular total de páginas (API de RAWG permite hasta 100 páginas máx)
        const maxPages = Math.min(Math.ceil(totalJuegos / itemsPerPage), 100);
        totalPages = maxPages;
        console.log(`📊 Total juegos: ${totalJuegos}, Páginas: ${totalPages}`);
        render();
    };

    const setCurrentPage = (page) => {
        currentPage = page;
        render();
    };

    const setSearchTerm = (term) => {
        // Resetear a primera página en nueva búsqueda
        currentPage = 1;
    };

    const reset = () => {
        currentPage = 1;
        totalPages = 1;
        render();
    };

    const getCurrentPage = () => currentPage;

    return {
        init,
        setTotalPages,
        setCurrentPage,
        setSearchTerm,
        reset,
        getCurrentPage,
        goToPage
    };
})();