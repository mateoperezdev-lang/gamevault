// js/perfil.js
const Perfil = (() => {
    const cargarPerfil = async () => {
        const user = Auth.getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        document.getElementById('profileUsername').textContent = user.username;
        document.getElementById('profileEmail').textContent = user.email;

        // Cargar estadísticas
        document.getElementById('totalJuegos').textContent = user.biblioteca?.length || 0;
        document.getElementById('totalCompletados').textContent = user.completados?.length || 0;
        document.getElementById('totalFavoritos').textContent = user.favoritos?.length || 0;

        // Cargar juegos de cada categoría
        await cargarBiblioteca(user);
        await cargarCompletados(user);
        await cargarFavoritos(user);
        cargarReseñas(user);
    };

    const cargarBiblioteca = async (user) => {
        const container = document.getElementById('bibliotecaGrid');
        if (!user.biblioteca || user.biblioteca.length === 0) {
            container.innerHTML = '<p>No tienes juegos en tu biblioteca</p>';
            return;
        }

        try {
            const juegos = await Promise.all(
                user.biblioteca.map(id => API.obtenerJuegoDetalle(id))
            );
            JuegosUI.mostrarJuegos(juegos, container, true);
        } catch (error) {
            console.error('Error al cargar biblioteca:', error);
        }
    };

    const cargarCompletados = async (user) => {
        const container = document.getElementById('completadosGrid');
        if (!user.completados || user.completados.length === 0) {
            container.innerHTML = '<p>No tienes juegos completados</p>';
            return;
        }

        try {
            const juegos = await Promise.all(
                user.completados.map(id => API.obtenerJuegoDetalle(id))
            );
            JuegosUI.mostrarJuegos(juegos, container, true);
        } catch (error) {
            console.error('Error al cargar completados:', error);
        }
    };

    const cargarFavoritos = async (user) => {
        const container = document.getElementById('favoritosGrid');
        if (!user.favoritos || user.favoritos.length === 0) {
            container.innerHTML = '<p>No tienes juegos favoritos</p>';
            return;
        }

        try {
            const juegos = await Promise.all(
                user.favoritos.map(id => API.obtenerJuegoDetalle(id))
            );
            JuegosUI.mostrarJuegos(juegos, container, true);
        } catch (error) {
            console.error('Error al cargar favoritos:', error);
        }
    };

    const cargarReseñas = async (user) => {
        const container = document.getElementById('reseñasList');
        if (!user.resenas || user.resenas.length === 0) {
            container.innerHTML = '<p>No has escrito ninguna reseña</p>';
            return;
        }

        try {
            const reseñasHTML = await Promise.all(
                user.resenas.map(async (resena) => {
                    const juego = await API.obtenerJuegoDetalle(resena.juegoId);
                    const fecha = new Date(resena.fecha).toLocaleDateString('es-ES');
                    
                    return `
                        <div class="review-item">
                            <div class="review-header">
                                <img src="${juego.background_image}" alt="${juego.name}" class="review-game-image">
                                <div class="review-game-info">
                                    <h4>${juego.name}</h4>
                                    <div class="review-rating">
                                        ${'★'.repeat(resena.calificacion)}${'☆'.repeat(5 - resena.calificacion)}
                                    </div>
                                    <span class="review-date">${fecha}</span>
                                </div>
                            </div>
                            <p class="review-text">${resena.texto}</p>
                            <div class="review-actions">
                                <button onclick="JuegosUI.mostrarModalReseña(${juego.id}, '${juego.name}')">
                                    <i class="fas fa-edit"></i> Editar
                                </button>
                            </div>
                        </div>
                    `;
                })
            );

            container.innerHTML = reseñasHTML.join('');
        } catch (error) {
            console.error('Error al cargar reseñas:', error);
        }
    };

    // Función global para cambiar tabs
    window.showTab = (tabName) => {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        event.target.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    };

    document.addEventListener('DOMContentLoaded', cargarPerfil);
})();