require('dotenv').config();
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken'); 
const loggerMiddleware = require('./middleware/logger');
const validateRequest = require('./middleware/auth');
const gatewayRoutes = require('./routes/gateway');

const app = express();

// Konfigurasi View Engine EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
// Folder public untuk file statis (PDF, Gambar, CSS)
app.use(express.static('public'));

// Variabel Global untuk menyimpan Log
global.requestLogs = []; 

// --- 1. ROUTE HALAMAN UTAMA (LANDING PAGE) ---
// Ini adalah halaman yang muncul pertama kali saat buka localhost:3000
app.get('/', (req, res) => {
    res.render('index');
});

// --- 2. ROUTE ANTARMUKA PENGGUNA LAINNYA ---

// Dashboard Admin (Hanya terbuka jika diklik dari Landing Page)
app.get('/dashboard', (req, res) => {
    res.render('dashboard', { 
        logs: global.requestLogs,
        totalRevenue: global.requestLogs.length * 500 
    });
});

// Client Portal (Halaman ambil token)
app.get('/client-portal', (req, res) => {
    res.render('client_portal');
});

// Rute Download Dokumentasi
app.get('/download-docs', (req, res) => {
    const file = path.join(__dirname, 'public', 'Panduan_Integrasi_API_Update.pdf');
    res.download(file, (err) => {
        if (err) {
            console.error("File dokumentasi tidak ditemukan!");
            res.status(404).send("File dokumentasi sedang disiapkan.");
        }
    });
});

// --- 3. API & GATEWAY LOGIC ---

// Endpoint Generate Token
app.get('/generate-test-token', (req, res) => {
    const payload = { 
        user_id: "714240061", 
        name: "Zidan Hairra R",
        npm: "714240061",
        role: "admin_integrator" 
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token: token });
});

// Middleware & Orchestrator (Aturan No. 1, 2, 3)
app.use('/integrator', loggerMiddleware, validateRequest, gatewayRoutes);

// Menjalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`   SISTEM INTEGRATOR BERHASIL DIJALANKAN         `);
    console.log(`   Akses Utama : http://localhost:${PORT}        `);
    console.log(`=================================================`);
});