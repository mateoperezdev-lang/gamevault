import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.RAWG_API_KEY || '87f84c6113cb45a8a5cceb4ad9a5069f';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== CONFIGURACIÓN CORS =====
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// ===== SERVIR ARCHIVOS ESTÁTICOS =====
const frontendPath = path.join(__dirname, '../frontend');
console.log('📁 Sirviendo frontend desde:', frontendPath);
app.use(express.static(frontendPath));

// ===== FUNCIÓN DE TRADUCCIÓN CON LIBRETRANSLATE =====
async function traducirTexto(texto, idiomaDestino = 'es') {
    if (!texto || texto.length < 20) return texto; // No traducir textos muy cortos
    
    try {
        const response = await axios.post('https://libretranslate.com/translate', {
            q: texto.substring(0, 5000), // Limitar a 5000 caracteres
            source: 'en',
            target: idiomaDestino,
            format: 'text'
        }, {
            timeout: 5000 // Timeout de 5 segundos
        });
        
        return response.data.translatedText;
    } catch (error) {
        console.log('⚠️ Error en traducción, usando original:', error.message);
        return texto; // Fallback a inglés
    }
}

// ===== ENDPOINT PARA OBTENER JUEGOS CON PAGINACIÓN =====
app.get('/api/juegos', async (req, res) => {
    try {
        const { busqueda, page = 1, page_size = 20 } = req.query;
        
        let url = `https://api.rawg.io/api/games?key=${API_KEY}&page=${page}&page_size=${page_size}`;
        
        if (busqueda) {
            url += `&search=${encodeURIComponent(busqueda)}&ordering=-rating`;
        } else {
            url += '&ordering=-rating&dates=2010-01-01,2024-12-31';
        }
        
        console.log('📡 Consultando RAWG:', url.replace(API_KEY, 'HIDDEN'));
        
        const response = await axios.get(url);
        
        // Enviar tanto resultados como total para paginación
        res.json({
            results: response.data.results,
            total: response.data.count || 0
        });
        
    } catch (error) {
        console.error('❌ Error en API:', error.message);
        res.status(500).json({ error: error.message, results: [], total: 0 });
    }
});

// ===== ENDPOINT PARA DETALLES DE JUEGO CON TRADUCCIÓN =====
app.get('/api/juego/:id', async (req, res) => {
    try {
        const url = `https://api.rawg.io/api/games/${req.params.id}?key=${API_KEY}`;
        
        console.log('📡 Obteniendo detalles:', url.replace(API_KEY, 'HIDDEN'));
        
        const response = await axios.get(url);
        const juego = response.data;
        
        // TRADUCIR DESCRIPCIÓN AL ESPAÑOL
        if (juego.description_raw && juego.description_raw.length > 50) {
            console.log('🔄 Traduciendo descripción...');
            juego.description_es = await traducirTexto(juego.description_raw);
        } else {
            juego.description_es = juego.description_raw || 'Descripción no disponible';
        }
        
        // También traducir el nombre si quieres (opcional)
        // if (juego.name) {
        //     juego.name_es = await traducirTexto(juego.name);
        // }
        
        res.json(juego);
        
    } catch (error) {
        console.error('❌ Error en detalles:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ===== FALLBACK PARA SPA =====
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📁 Frontend en: ${frontendPath}`);
    console.log(`🔑 API Key configurada: ${API_KEY ? 'Sí' : 'No'}`);
});