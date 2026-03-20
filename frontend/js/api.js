// frontend/js/api.js - VERSIÓN FINAL CON PAGINACIÓN Y TRADUCCIÓN
const API = (() => {
    const BASE_URL = ''; // Vacío porque es el mismo dominio
    
    const handleResponse = async (response) => {
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    };

    const obtenerJuegos = async (page = 1, pageSize = 20) => {
        try {
            const url = `${BASE_URL}/api/juegos?page=${page}&page_size=${pageSize}`;
            console.log('📡 Cargando página:', page);
            
            const response = await fetch(url);
            const data = await handleResponse(response);
            
            return {
                results: data.results || [],
                total: data.total || 0
            };
        } catch (error) {
            console.error('❌ Error al obtener juegos:', error);
            return { results: [], total: 0 };
        }
    };

    const buscarJuegos = async (nombre, page = 1, pageSize = 20) => {
        try {
            const url = `${BASE_URL}/api/juegos?busqueda=${encodeURIComponent(nombre)}&page=${page}&page_size=${pageSize}`;
            console.log('🔍 Buscando:', nombre, 'página:', page);
            
            const response = await fetch(url);
            const data = await handleResponse(response);
            
            return {
                results: data.results || [],
                total: data.total || 0
            };
        } catch (error) {
            console.error('❌ Error al buscar juegos:', error);
            return { results: [], total: 0 };
        }
    };

    const obtenerJuegoDetalle = async (id) => {
        try {
            const url = `${BASE_URL}/api/juego/${id}`;
            console.log('📖 Obteniendo detalles del juego:', id);
            
            const response = await fetch(url);
            const data = await handleResponse(response);
            
            return data;
        } catch (error) {
            console.error('❌ Error al obtener detalles:', error);
            throw error;
        }
    };

    return {
        obtenerJuegos,
        buscarJuegos,
        obtenerJuegoDetalle
    };
})();