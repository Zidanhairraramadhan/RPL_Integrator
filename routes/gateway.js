const express = require('express');
const router = express.Router();
const axios = require('axios');

const SERVICE_FEE = 500; // Sesuai Aturan 9: Semua layanan berbayar [cite: 61]

router.all('/:service', async (req, res) => {
    const { service } = req.params;
    const fullPath = req.originalUrl.split(`/integrator/${service}/`)[1] || '';
    let targetUrl = "";

    // Mapping Service [Fitur 1]
    if (service === 'smartbank') targetUrl = process.env.SMARTBANK_URL;
    else if (service === 'marketplace') targetUrl = process.env.MARKETPLACE_URL;

    if (!targetUrl) return res.status(404).json({ message: 'Service tujuan tidak terdaftar' });

    try {
        // Integrasi Pembayaran Fee ke SmartBank [Fitur 4 & Aturan 3]
        await axios.post(`${process.env.SMARTBANK_URL}/smartbank/pembayaran_transaksi`, {
            user_id: req.body.user_id,
            amount: SERVICE_FEE,
            parameter: "Biaya Layanan Integrasi"
        }).catch(() => console.log("Gagal potong fee, SmartBank offline."));

        // Forwarding Request [Aturan 5]
        const response = await axios({
            method: req.method,
            url: `${targetUrl}/${fullPath}`,
            data: req.body,
            headers: req.headers
        });

        res.json({
            status: "Success",
            integrator_info: { fee_terpotong: SERVICE_FEE },
            data: response.data
        });

    } catch (error) {
        res.status(500).json({ status: "Error", message: "Gagal meneruskan request" });
    }
});

module.exports = router;