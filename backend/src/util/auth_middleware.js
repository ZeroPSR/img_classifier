const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token
 * Attaches user information to req.user if token is valid
 */
function authenticateToken(req, res, next) {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            status: false,
            message: 'Access token required'
        });
    }

    // Verify token
    jwt.verify(token, process.env.SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                status: false,
                message: 'Invalid or expired token'
            });
        }

        // Attach user info to request
        req.user = user;
        next();
    });
}

/**
 * Optional authentication middleware
 * Attaches user if token is present and valid, but doesn't block if missing
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next();
    }

    jwt.verify(token, process.env.SECRET, (err, user) => {
        if (!err) {
            req.user = user;
        }
        next();
    });
}

module.exports = {
    authenticateToken,
    optionalAuth
};
