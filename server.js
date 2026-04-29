require('dotenv').config();
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken'); 
const loggerMiddleware = require('./middleware/logger');
const validateRequest = require('./middleware/auth');
const gatewayRoutes = require('./routes/gateway');

const app = express();

// Konfigurasi View Engine EJS sesuai standar visual
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
// Folder public digunakan untuk menyimpan file statis seperti PDF dokumentasi
app.use(express.static('public'));

// Variabel Global untuk menyimpan Log (Fitur 3: Logging)
global.requestLogs = []; 

// --- ROUTE UI (Antarmuka Pengguna) ---

// 1. Landing Page - Gerbang utama informasi Gateway
app.get('/', (req, res) => {
    res.render('index');
});

// 2. Dashboard Admin - Monitoring Traffic & Monetisasi (Fitur 3 & 4)
app.get('/dashboard', (req, res) => {
    res.render('dashboard', { 
        logs: global.requestLogs,
        totalRevenue: global.requestLogs.length * 500 // Sesuai Aturan No. 9
    });
});

// 3. Client Portal - Halaman mandiri untuk kelompok lain mengambil token
app.get('/client-portal', (req, res) => {
    res.render('client_portal');
});

// 4. API Generator Token - Endpoint untuk membuat token JWT (Fitur 2: Validasi)
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

// 5. Download Dokumentasi API - Untuk tombol di Landing Page
app.get('/download-docs', (req, res) => {
    const file = path.join(__dirname, 'public', 'Panduan_Integrasi_API_Update.pdf');
    res.download(file, (err) => {
        if (err) {
            console.error("File dokumentasi tidak ditemukan di folder public!");
            res.status(404).send("File dokumentasi sedang disiapkan.");
        }
    });
});

// --- ROUTE API GATEWAY (Inti Orchestrator) ---
app.use('/integrator', loggerMiddleware, validateRequest, gatewayRoutes);

// Menjalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`   SERVER INTEGRATOR AKTIF - PORT ${PORT}        `);
    console.log(`   Admin Dashboard : http://localhost:${PORT}/dashboard `);
    console.log(`   Client Portal   : http://localhost:${PORT}/client-portal `);
    console.log(`=================================================`);
});