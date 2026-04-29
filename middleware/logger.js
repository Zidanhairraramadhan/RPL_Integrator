const logger = (req, res, next) => {
    const logEntry = {
        waktu: new Date().toLocaleString("id-ID"),
        metode: req.method,
        url_tujuan: req.originalUrl,
        status: "PENDING"
    };
    
    // Simpan ke memori global agar bisa dibaca oleh Dashboard UI
    if (global.requestLogs) {
        global.requestLogs.push(logEntry);
    }
    
    console.log(`[LOG] ${logEntry.waktu} | ${logEntry.metode} -> ${logEntry.url_tujuan}`);
    next();
};

module.exports = logger;