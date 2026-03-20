// js/paginacion.js
const Paginacion = (() => {
    let currentPage = 1;
    let totalPages = 1;
    let currentSearchTerm = '';
    let itemsPerPage = 20;
    let onPageChangeCallback = null;

    const init = (callback) => {
        onPageChangeCallback = callback;
        renderPagination();
    };

    const renderPagination = () => {
        const container = document.getElementById('paginationContainer');
        if (!container) return;

        const paginationHTML = `
            <div class="pagination-container">
                <button class="pagination-button" id="prevPage" ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i> Anterior
                </button>
                
                <div class="pagination-numbers" id="pageNumbers">
                    ${generatePageNumbers()}
                </div>
                
                <button class="pagination-button" id="nextPage" ${currentPage === totalPages ? 'disabled' : ''}>
                    Siguiente <i class="fas fa-chevron-right"></i>
                </button>
                
                <div class="pagination-info">
                    Página ${currentPage} de ${totalPages}
                </div>
            </div>
        `;

        container.innerHTML = paginationHTML;

        // Event listeners
        document.getElementById('prevPage')?.addEventListener('click', () => goToPage(currentPage - 1));
        document.getElementById('nextPage')?.addEventListener('click', () => goToPage(currentPage + 1));
        
        document.querySelectorAll('.page-number').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.target.dataset.page);
                goToPage(page);
            });
        });
    };

    const generatePageNumbers = () => {
        let pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        if (start > 1) {
            pages.push('<span class="page-number" data-page="1">1</span>');
            if (start > 2) pages.push('<span class="page-dots">...</span>');
        }

        for (let i = start; i <= end; i++) {
            pages.push(`<span class="page-number ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</span>`);
        }

        if (end < totalPages) {
            if (end < totalPages - 1) pages.push('<span class="page-dots">...</span>');
            pages.push(`<span class="page-number" data-page="${totalPages}">${totalPages}</span>`);
        }

        return pages.join('');
    };

    const goToPage = (page) => {
        if (page < 1 || page > totalPages || page === currentPage) return;
        
        currentPage = page;
        
        if (onPageChangeCallback) {
            onPageChangeCallback(currentPage, currentSearchTerm);
        }
        
        renderPagination();
        
        // Scroll suave hacia arriba
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const setTotalPages = (total) => {
        totalPages = Math.ceil(total / itemsPerPage);
        renderPagination();
    };

    const setCurrentPage = (page) => {
        currentPage = page;
        renderPagination();
    };

    const setSearchTerm = (term) => {
        currentSearchTerm = term;
        currentPage = 1; // Resetear a primera página en nueva búsqueda
    };

    const reset = () => {
        currentPage = 1;
        totalPages = 1;
        renderPagination();
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