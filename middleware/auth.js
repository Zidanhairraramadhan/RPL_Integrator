const jwt = require('jsonwebtoken');

const validateRequest = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Token JWT diperlukan [Aturan 6]' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ status: 'error', message: 'Token tidak valid atau kadaluwarsa' });
    }
};

module.exports = validateRequest;