// js/api.js - VERSIÓN PARA RENDER
const API = (() => {
    // Detectar entorno
    const isLocal = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';
    
    // IMPORTANTE: Cambia esta URL por la de tu backend en Render
    const RENDER_URL = 'https://gamevault.onrender.com'; // TU URL AQUÍ
    
    const BASE_URL = isLocal 
        ? 'http://localhost:3000'  // Backend local
        : RENDER_URL;               // Backend en Render
    
    const handleResponse = async (response) => {
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    };

    const obtenerJuegos = async (page = 1, pageSize = 20) => {
        try {
            const url = `${BASE_URL}/api/juegos?page=${page}&page_size=${pageSize}`;
            console.log('📡 Fetching desde:', url);
            
            const response = await fetch(url, {
                mode: 'cors',
                credentials: 'include'
            });
            
            const data = await handleResponse(response);
            return data.results || [];
        } catch (error) {
            console.error('❌ Error al obtener juegos:', error);
            throw error;
        }
    };

    const buscarJuegos = async (nombre, page = 1, pageSize = 20) => {
        try {
            const url = `${BASE_URL}/api/juegos?busqueda=${encodeURIComponent(nombre)}&page=${page}&page_size=${pageSize}`;
            console.log('📡 Buscando en:', url);
            
            const response = await fetch(url, {
                mode: 'cors',
                credentials: 'include'
            });
            
            const data = await handleResponse(response);
            return data.results || [];
        } catch (error) {
            console.error('❌ Error al buscar juegos:', error);
            throw error;
        }
    };

    const obtenerJuegoDetalle = async (id) => {
        try {
            const url = `${BASE_URL}/api/juego/${id}`;
            console.log('📡 Detalles desde:', url);
            
            const response = await fetch(url, {
                mode: 'cors',
                credentials: 'include'
            });
            
            return await handleResponse(response);
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