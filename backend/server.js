import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = '87f84c6113cb45a8a5cceb4ad9a5069f'; // Tu key de RAWG

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== CONFIGURACIÓN CORS MANUAL (LA MÁS CONFIABLE) =====
// Basado en soluciones de la comunidad Render [citation:5]
app.use((req, res, next) => {
    // Definir los orígenes permitidos
    const allowedOrigins = [
        'http://localhost:5500',           // VS Code live server
        'http://127.0.0.1:5500',
        'http://localhost:3000',           // Desarrollo local
        'https://gamevault.onrender.com',  // Reemplaza con tu URL de Render
        'http://gamevault.onrender.com'
    ];
    
    const origin = req.headers.origin;
    
    // Permitir si el origen está en la lista o si no hay origen (peticiones server-to-server)
    if (allowedOrigins.includes(origin) || !origin) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    }
    
    // Manejar preflight OPTIONS request [citation:1][citation:3]
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    
    next();
});

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// ===== ENDPOINTS PROXY =====
app.get('/api/juegos', async (req, res) => {
    try {
        const { busqueda, page = 1, page_size = 20 } = req.query;
        
        let url = `https://api.rawg.io/api/games?key=${API_KEY}&page=${page}&page_size=${page_size}`;
        
        if (busqueda) {
            url += `&search=${encodeURIComponent(busqueda)}&ordering=-rating`;
        } else {
            url += '&ordering=-rating&dates=2010-01-01,2024-12-31&metacritic=70,100';
        }
        
        console.log('📡 Proxy consultando:', url.replace(API_KEY, 'HIDDEN'));
        
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('❌ Error en proxy:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/juego/:id', async (req, res) => {
    try {
        const url = `https://api.rawg.io/api/games/${req.params.id}?key=${API_KEY}`;
        
        console.log('📡 Proxy detalle:', url.replace(API_KEY, 'HIDDEN'));
        
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('❌ Error en proxy detalle:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Ruta por defecto para SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});