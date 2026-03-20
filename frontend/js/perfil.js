// frontend/js/perfil.js - VERSIÓN COMPLETA
const Perfil = (() => {
    const cargarPerfil = async () => {
        const profileUsername = document.getElementById('profileUsername');
        const profileEmail = document.getElementById('profileEmail');
        const totalJuegos = document.getElementById('totalJuegos');
        const totalCompletados = document.getElementById('totalCompletados');
        const totalFavoritos = document.getElementById('totalFavoritos');
        
        if (!profileUsername) return;
        
        const user = Auth.getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        if (profileUsername) profileUsername.textContent = user.username;
        if (profileEmail) profileEmail.textContent = user.email;
        
        if (totalJuegos) totalJuegos.textContent = user.biblioteca?.length || 0;
        if (totalCompletados) totalCompletados.textContent = user.completados?.length || 0;
        if (totalFavoritos) totalFavoritos.textContent = user.favoritos?.length || 0;

        await cargarBiblioteca(user);
        await cargarCompletados(user);
        await cargarFavoritos(user);
        cargarReseñas(user);
    };

    const cargarBiblioteca = async (user) => {
        const container = document.getElementById('bibliotecaGrid');
        if (!container) return;
        
        if (!user.biblioteca || user.biblioteca.length === 0) {
            container.innerHTML = '<p class="no-items">No tienes juegos en tu biblioteca</p>';
            return;
        }

        try {
            container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Cargando biblioteca...</div>';
            
            const juegos = await Promise.all(
                user.biblioteca.map(async (id) => {
                    try {
                        return await API.obtenerJuegoDetalle(id);
                    } catch (error) {
                        console.error(`Error cargando juego ${id}:`, error);
                        return null;
                    }
                })
            );
            
            const juegosValidos = juegos.filter(j => j !== null);
            
            if (juegosValidos.length > 0) {
                JuegosUI.mostrarJuegos(juegosValidos, container, true);
            } else {
                container.innerHTML = '<p class="no-items">No se pudieron cargar tus juegos</p>';
            }
        } catch (error) {
            console.error('Error al cargar biblioteca:', error);
            container.innerHTML = '<p class="error">Error al cargar la biblioteca</p>';
        }
    };

    const cargarCompletados = async (user) => {
        const container = document.getElementById('completadosGrid');
        if (!container) return;
        
        if (!user.completados || user.completados.length === 0) {
            container.innerHTML = '<p class="no-items">No tienes juegos completados</p>';
            return;
        }

        try {
            container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Cargando completados...</div>';
            
            const juegos = await Promise.all(
                user.completados.map(async (id) => {
                    try {
                        return await API.obtenerJuegoDetalle(id);
                    } catch (error) {
                        console.error(`Error cargando juego ${id}:`, error);
                        return null;
                    }
                })
            );
            
            const juegosValidos = juegos.filter(j => j !== null);
            
            if (juegosValidos.length > 0) {
                JuegosUI.mostrarJuegos(juegosValidos, container, true);
            } else {
                container.innerHTML = '<p class="no-items">No se pudieron cargar tus juegos completados</p>';
            }
        } catch (error) {
            console.error('Error al cargar completados:', error);
            container.innerHTML = '<p class="error">Error al cargar completados</p>';
        }
    };

    const cargarFavoritos = async (user) => {
        const container = document.getElementById('favoritosGrid');
        if (!container) return;
        
        if (!user.favoritos || user.favoritos.length === 0) {
            container.innerHTML = '<p class="no-items">No tienes juegos favoritos</p>';
            return;
        }

        try {
            container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Cargando favoritos...</div>';
            
            const juegos = await Promise.all(
                user.favoritos.map(async (id) => {
                    try {
                        return await API.obtenerJuegoDetalle(id);
                    } catch (error) {
                        console.error(`Error cargando juego ${id}:`, error);
                        return null;
                    }
                })
            );
            
            const juegosValidos = juegos.filter(j => j !== null);
            
            if (juegosValidos.length > 0) {
                JuegosUI.mostrarJuegos(juegosValidos, container, true);
            } else {
                container.innerHTML = '<p class="no-items">No se pudieron cargar tus juegos favoritos</p>';
            }
        } catch (error) {
            console.error('Error al cargar favoritos:', error);
            container.innerHTML = '<p class="error">Error al cargar favoritos</p>';
        }
    };

    const cargarReseñas = async (user) => {
        const container = document.getElementById('reseñasList');
        if (!container) return;
        
        if (!user.resenas || user.resenas.length === 0) {
            container.innerHTML = '<p class="no-items">No has escrito ninguna reseña</p>';
            return;
        }

        try {
            container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Cargando reseñas...</div>';
            
            const reseñasOrdenadas = [...user.resenas].sort((a, b) => 
                new Date(b.fecha) - new Date(a.fecha)
            );
            
            const reseñasHTML = await Promise.all(
                reseñasOrdenadas.map(async (resena) => {
                    try {
                        const juego = await API.obtenerJuegoDetalle(resena.juegoId);
                        const fecha = new Date(resena.fecha).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });
                        
                        return `
                            <div class="review-item" data-juego-id="${juego.id}">
                                <div class="review-header">
                                    <img src="${juego.background_image || 'https://via.placeholder.com/60'}" 
                                         alt="${juego.name}" 
                                         class="review-game-image"
                                         onerror="this.src='https://via.placeholder.com/60'">
                                    <div class="review-game-info">
                                        <h4>${juego.name}</h4>
                                        <div class="review-rating">
                                            ${'★'.repeat(resena.calificacion)}${'☆'.repeat(5 - resena.calificacion)}
                                        </div>
                                        <span class="review-date"><i class="far fa-calendar-alt"></i> ${fecha}</span>
                                    </div>
                                </div>
                                <p class="review-text">${resena.texto}</p>
                                <div class="review-actions">
                                    <button class="edit-review" onclick="JuegosUI.mostrarModalReseña(${juego.id}, '${juego.name.replace(/'/g, "\\'")}')">
                                        <i class="fas fa-edit"></i> Editar
                                    </button>
                                    <button class="delete-review" onclick="JuegosUI.eliminarReseña(${juego.id})">
                                        <i class="fas fa-trash-alt"></i> Eliminar
                                    </button>
                                </div>
                            </div>
                        `;
                    } catch (error) {
                        console.error('Error cargando juego para reseña:', error);
                        return '';
                    }
                })
            );

            const reseñasValidas = reseñasHTML.filter(html => html !== '');
            
            if (reseñasValidas.length > 0) {
                container.innerHTML = reseñasValidas.join('');
            } else {
                container.innerHTML = '<p class="no-items">No se pudieron cargar tus reseñas</p>';
            }
        } catch (error) {
            console.error('Error al cargar reseñas:', error);
            container.innerHTML = '<p class="error">Error al cargar las reseñas</p>';
        }
    };

    window.showTab = (tabName) => {
        const tabs = document.querySelectorAll('.tab-button');
        const contents = document.querySelectorAll('.tab-content');
        
        if (tabs.length === 0) return;
        
        tabs.forEach(btn => btn.classList.remove('active'));
        contents.forEach(content => content.classList.remove('active'));
        
        event.target.classList.add('active');
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) selectedTab.classList.add('active');
        
        selectedTab?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    document.addEventListener('DOMContentLoaded', cargarPerfil);
})();