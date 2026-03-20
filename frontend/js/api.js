const API = (() => {
    const BASE_URL = '';  // Vacío porque es el mismo dominio
    
    const handleResponse = async (response) => {
        if (!response.ok) {
            throw new Error(`Error ${response.status}`);
        }
        return await response.json();
    };

    const obtenerJuegos = async (page = 1, pageSize = 20) => {
        const response = await fetch(`/api/juegos?page=${page}&page_size=${pageSize}`);
        const data = await handleResponse(response);
        return data.results || [];
    };

    const buscarJuegos = async (nombre, page = 1, pageSize = 20) => {
        const response = await fetch(`/api/juegos?busqueda=${encodeURIComponent(nombre)}&page=${page}&page_size=${pageSize}`);
        const data = await handleResponse(response);
        return data.results || [];
    };

    const obtenerJuegoDetalle = async (id) => {
        const response = await fetch(`/api/juego/${id}`);
        return await handleResponse(response);
    };

    return {
        obtenerJuegos,
        buscarJuegos,
        obtenerJuegoDetalle
    };
})();