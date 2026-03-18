import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.RAWG_API_KEY || '87f84c6113cb45a8a5cceb4ad9a5069f';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir archivos estáticos (tus HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..')));

// Endpoints proxy
app.get('/api/juegos', async (req, res) => {
    try {
        const { busqueda, page = 1, page_size = 20 } = req.query;
        
        let url = `https://api.rawg.io/api/games?key=${API_KEY}&page=${page}&page_size=${page_size}`;
        
        if (busqueda) {
            url += `&search=${encodeURIComponent(busqueda)}&ordering=-rating`;
        } else {
            url += '&ordering=-rating&dates=2010-01-01,2024-12-31&metacritic=70,100';
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

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor en puerto ${PORT}`);
});