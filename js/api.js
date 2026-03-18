const API = (() => {
    const BASE_URL = 'https://api.rawg.io/api';
    const API_KEY = '87f84c6113cb45a8a5cceb4ad9a5069f';
    const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
    
    const handleResponse = async (response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    };

    const obtenerJuegos = async (page = 1, pageSize = 20) => {
        try {
            const url = `${CORS_PROXY}${BASE_URL}/games?key=${API_KEY}&page=${page}&page_size=${pageSize}&ordering=-rating&dates=2010-01-01,2024-12-31&metacritic=70,100`;
            const response = await fetch(url);
            const data = await handleResponse(response);
            return data.results || [];
        } catch (error) {
            console.error('Error al obtener juegos:', error);
            throw error;
        }
    };

    const buscarJuegos = async (nombre, page = 1, pageSize = 20) => {
        try {
            const url = `${CORS_PROXY}${BASE_URL}/games?key=${API_KEY}&search=${encodeURIComponent(nombre)}&page=${page}&page_size=${pageSize}&ordering=-rating`;
            const response = await fetch(url);
            const data = await handleResponse(response);
            return data.results || [];
        } catch (error) {
            console.error('Error al buscar juegos:', error);
            throw error;
        }
    };

    const obtenerJuegoDetalle = async (id) => {
        try {
            const url = `${CORS_PROXY}${BASE_URL}/games/${id}?key=${API_KEY}`;
            const response = await fetch(url);
            const data = await handleResponse(response);
            return data;
        } catch (error) {
            console.error('Error al obtener detalles del juego:', error);
            throw error;
        }
    };

    return {
        obtenerJuegos,
        buscarJuegos,
        obtenerJuegoDetalle
    };
})();