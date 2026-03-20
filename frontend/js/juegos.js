// frontend/js/juegos.js - VERSIÓN SIN TRADUCCIÓN
const JuegosUI = (() => {
    const getRatingClass = (rating) => {
        if (rating >= 4) return 'rating-high';
        if (rating >= 3) return 'rating-mid';
        return 'rating-low';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha no disponible';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    const crearTarjetaJuego = (juego, showActions = true) => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.dataset.gameId = juego.id;

        const imagen = juego.background_image || 'https://via.placeholder.com/280x200/1a1e24/6366f1?text=Sin+Imagen';
        const rating = juego.rating || 0;
        const ratingClass = getRatingClass(rating);
        const fecha = juego.released ? new Date(juego.released).getFullYear() : 'Año desconocido';

        let actionsHTML = '';
        if (showActions && Auth.isAuthenticated()) {
            const user = Auth.getCurrentUser();
            const isCompletado = user.completados?.includes(juego.id) || false;
            const isFavorito = user.favoritos?.includes(juego.id) || false;

            actionsHTML = `
                <div class="game-card-actions">
                    <button class="action-button ${isCompletado ? 'active' : ''}" onclick="event.stopPropagation(); JuegosUI.toggleCompletado(${juego.id})">
                        <i class="fas ${isCompletado ? 'fa-check-circle' : 'fa-circle'}"></i>
                    </button>
                    <button class="action-button ${isFavorito ? 'active' : ''}" onclick="event.stopPropagation(); JuegosUI.toggleFavorito(${juego.id})">
                        <i class="fas ${isFavorito ? 'fa-heart' : 'fa-heart'}"></i>
                    </button>
                    <button class="action-button" onclick="event.stopPropagation(); JuegosUI.mostrarModalReseña(${juego.id}, '${juego.name.replace(/'/g, "\\'")}')">
                        <i class="fas fa-star"></i>
                    </button>
                </div>
            `;
        }

        card.innerHTML = `
            <img src="${imagen}" alt="${juego.name}" class="game-card-image" loading="lazy">
            <div class="game-card-content">
                <h3 class="game-card-title">${juego.name}</h3>
                <div class="game-card-rating">
                    <span class="rating ${ratingClass}">★ ${rating.toFixed(1)}</span>
                </div>
                <div class="game-card-date">
                    <i class="far fa-calendar-alt"></i> ${fecha}
                </div>
                ${actionsHTML}
            </div>
        `;

        return card;
    };

    const mostrarJuegos = (juegos, contenedor, showActions = true) => {
        contenedor.innerHTML = '';
        
        if (juegos.length === 0) {
            contenedor.innerHTML = '<div class="no-results">No se encontraron juegos</div>';
            return;
        }

        juegos.forEach(juego => {
            const tarjeta = crearTarjetaJuego(juego, showActions);
            contenedor.appendChild(tarjeta);
        });
    };

    const toggleCompletado = (juegoId) => {
        const user = Auth.getCurrentUser();
        if (!user) return;

        const index = user.completados.indexOf(juegoId);
        if (index === -1) {
            user.completados.push(juegoId);
        } else {
            user.completados.splice(index, 1);
        }

        Auth.updateUser(user);
        location.reload();
    };

    const toggleFavorito = (juegoId) => {
        const user = Auth.getCurrentUser();
        if (!user) return;

        const index = user.favoritos.indexOf(juegoId);
        if (index === -1) {
            user.favoritos.push(juegoId);
        } else {
            user.favoritos.splice(index, 1);
        }

        Auth.updateUser(user);
        location.reload();
    };

    const mostrarDetallesJuego = (juego) => {
        const detallesContainer = document.getElementById('gameDetails');
        
        const imagen = juego.background_image || 'https://via.placeholder.com/800x400/1a1e24/6366f1?text=Sin+Imagen';
        const ratingClass = getRatingClass(juego.rating);
        const fecha = formatDate(juego.released);
        
        // USAR DESCRIPCIÓN EN INGLÉS (la original)
        const descripcion = juego.description_raw || 'No hay descripción disponible para este juego.';
        
        const plataformas = juego.platforms 
            ? juego.platforms.map(p => p.platform.name).join(', ')
            : 'Plataformas no disponibles';

        const generos = juego.genres 
            ? juego.genres.map(g => g.name).join(', ')
            : 'Géneros no disponibles';

        const desarrollador = juego.developers && juego.developers.length > 0
            ? juego.developers[0].name
            : 'Información no disponible';

        let userActionsHTML = '';
        if (Auth.isAuthenticated()) {
            const user = Auth.getCurrentUser();
            const isCompletado = user.completados?.includes(juego.id) || false;
            const isFavorito = user.favoritos?.includes(juego.id) || false;
            const userResena = user.resenas?.find(r => r.juegoId === juego.id);

            userActionsHTML = `
                <div class="game-details-actions">
                    <button class="action-button ${isCompletado ? 'active' : ''}" onclick="JuegosUI.toggleCompletado(${juego.id})">
                        <i class="fas ${isCompletado ? 'fa-check-circle' : 'fa-circle'}"></i>
                        ${isCompletado ? 'Completado' : 'Marcar como completado'}
                    </button>
                    <button class="action-button ${isFavorito ? 'active' : ''}" onclick="JuegosUI.toggleFavorito(${juego.id})">
                        <i class="fas ${isFavorito ? 'fa-heart' : 'fa-heart'}"></i>
                        ${isFavorito ? 'Favorito' : 'Añadir a favoritos'}
                    </button>
                    <button class="action-button" onclick="JuegosUI.mostrarModalReseña(${juego.id}, '${juego.name.replace(/'/g, "\\'")}')">
                        <i class="fas fa-star"></i>
                        ${userResena ? 'Editar reseña' : 'Escribir reseña'}
                    </button>
                </div>
            `;
        }

        detallesContainer.innerHTML = `
            <div class="game-details-header">
                <h2 class="game-details-title">${juego.name}</h2>
            </div>
            <img src="${imagen}" alt="${juego.name}" class="game-details-image">
            
            <div class="game-details-info">
                <div class="info-item">
                    <span class="info-label"><i class="fas fa-star"></i> Rating</span>
                    <span class="info-value rating ${ratingClass}">${juego.rating ? juego.rating.toFixed(1) : 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label"><i class="far fa-calendar-alt"></i> Lanzamiento</span>
                    <span class="info-value">${fecha}</span>
                </div>
                <div class="info-item">
                    <span class="info-label"><i class="fas fa-gamepad"></i> Plataformas</span>
                    <span class="info-value">${plataformas}</span>
                </div>
                <div class="info-item">
                    <span class="info-label"><i class="fas fa-tags"></i> Géneros</span>
                    <span class="info-value">${generos}</span>
                </div>
                <div class="info-item">
                    <span class="info-label"><i class="fas fa-code"></i> Desarrollador</span>
                    <span class="info-value">${desarrollador}</span>
                </div>
            </div>
            
            <div class="game-details-description">
                <h3><i class="fas fa-align-left"></i> Descripción</h3>
                <p>${descripcion}</p>
            </div>
            
            ${userActionsHTML}
        `;
    };

    const mostrarModalReseña = (juegoId, juegoNombre) => {
        const user = Auth.getCurrentUser();
        if (!user) {
            alert('Debes iniciar sesión para escribir una reseña');
            window.location.href = 'login.html';
            return;
        }

        const existingResena = user.resenas?.find(r => r.juegoId === juegoId);
        
        const modalHTML = `
            <div id="reviewModal" class="modal" style="display: block;">
                <div class="modal-content review-modal-content">
                    <span class="close-modal" onclick="JuegosUI.cerrarModalReseña()"><i class="fas fa-times"></i></span>
                    <h2>${existingResena ? 'Editar' : 'Escribir'} reseña para ${juegoNombre}</h2>
                    
                    <div class="rating-input">
                        <input type="radio" name="rating" id="star5" value="5" ${existingResena?.calificacion === 5 ? 'checked' : ''}>
                        <label for="star5"><i class="fas fa-star"></i></label>
                        <input type="radio" name="rating" id="star4" value="4" ${existingResena?.calificacion === 4 ? 'checked' : ''}>
                        <label for="star4"><i class="fas fa-star"></i></label>
                        <input type="radio" name="rating" id="star3" value="3" ${existingResena?.calificacion === 3 ? 'checked' : ''}>
                        <label for="star3"><i class="fas fa-star"></i></label>
                        <input type="radio" name="rating" id="star2" value="2" ${existingResena?.calificacion === 2 ? 'checked' : ''}>
                        <label for="star2"><i class="fas fa-star"></i></label>
                        <input type="radio" name="rating" id="star1" value="1" ${existingResena?.calificacion === 1 ? 'checked' : ''}>
                        <label for="star1"><i class="fas fa-star"></i></label>
                    </div>
                    
                    <textarea id="reviewText" class="review-textarea" placeholder="Escribe tu reseña...">${existingResena?.texto || ''}</textarea>
                    
                    <button class="auth-button" onclick="JuegosUI.guardarReseña(${juegoId})">
                        ${existingResena ? 'Actualizar' : 'Publicar'} reseña
                    </button>
                    ${existingResena ? `<button class="auth-button" style="background-color: #ef4444; margin-top: 10px;" onclick="JuegosUI.eliminarReseña(${juegoId})">Eliminar reseña</button>` : ''}
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    };

    const cerrarModalReseña = () => {
        const modal = document.getElementById('reviewModal');
        if (modal) modal.remove();
    };

    const guardarReseña = (juegoId) => {
        const rating = document.querySelector('input[name="rating"]:checked')?.value;
        const texto = document.getElementById('reviewText').value;

        if (!rating) {
            alert('Por favor selecciona una calificación');
            return;
        }

        if (!texto.trim()) {
            alert('Por favor escribe tu reseña');
            return;
        }

        const user = Auth.getCurrentUser();
        if (!user) return;

        if (!user.resenas) user.resenas = [];

        const existingIndex = user.resenas.findIndex(r => r.juegoId === juegoId);
        const newResena = {
            juegoId,
            calificacion: parseInt(rating),
            texto: texto.trim(),
            fecha: new Date().toISOString()
        };

        if (existingIndex !== -1) {
            user.resenas[existingIndex] = newResena;
        } else {
            user.resenas.push(newResena);
        }

        Auth.updateUser(user);
        cerrarModalReseña();
        alert('Reseña guardada exitosamente');
    };

    const eliminarReseña = (juegoId) => {
        if (!confirm('¿Estás seguro de eliminar esta reseña?')) return;

        const user = Auth.getCurrentUser();
        if (!user) return;

        user.resenas = user.resenas.filter(r => r.juegoId !== juegoId);
        Auth.updateUser(user);
        cerrarModalReseña();
        alert('Reseña eliminada');
    };

    return {
        mostrarJuegos,
        mostrarDetallesJuego,
        toggleCompletado,
        toggleFavorito,
        mostrarModalReseña,
        cerrarModalReseña,
        guardarReseña,
        eliminarReseña
    };
})();