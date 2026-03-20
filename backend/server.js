import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.RAWG_API_KEY || '87f84c6113cb45a8a5cceb4ad9a5069f';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== CONFIGURACIÓN CRÍTICA: Servir archivos estáticos =====
// La carpeta frontend está al mismo nivel que backend
app.use(express.static(path.join(__dirname, '../frontend')));

// ===== TUS ENDPOINTS DE API =====
app.get('/api/juegos', async (req, res) => {
    // ... tu código existente ...
});

app.get('/api/juego/:id', async (req, res) => {
    // ... tu código existente ...
});

// ===== IMPORTANTE: Esta ruta debe ir AL FINAL =====
// Solo atrapa rutas que no coincidan con archivos estáticos ni con /api/*
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor en puerto ${PORT}`);
});