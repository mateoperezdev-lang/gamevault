import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.RAWG_API_KEY || '87f84c6113cb45a8a5cceb4ad9a5069f';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== SERVIR ARCHIVOS ESTÁTICOS =====
// Ahora apuntamos directamente a la carpeta frontend
const frontendPath = path.join(__dirname, '../frontend');
console.log('📁 Sirviendo frontend desde:', frontendPath);
app.use(express.static(frontendPath));

// ===== ENDPOINTS API =====
app.get('/api/juegos', async (req, res) => {
    try {
        const { busqueda, page = 1 } = req.query;
        let url = `https://api.rawg.io/api/games?key=${API_KEY}&page=${page}&page_size=20`;
        
        if (busqueda) {
            url += `&search=${encodeURIComponent(busqueda)}`;
        }
        
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/juego/:id', async (req, res) => {
    try {
        const url = `https://api.rawg.io/api/games/${req.params.id}?key=${API_KEY}`;
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== FALLBACK =====
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor en puerto ${PORT}`);
});