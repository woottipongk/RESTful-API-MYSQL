const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { check, validationResult } = require("express-validator");
require('dotenv').config();
const router = express.Router();



function generateMD5Hash(data) {
    const md5Hash = crypto.createHash('md5');
    md5Hash.update(data);
    return md5Hash.digest('hex');
}

// Helper function to check if token is expired
const isTokenExpired = (decodedToken) => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    return decodedToken.exp < currentTimestamp;
};

// Verify Token function
const verifyToken = (token) => {
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        if (!isTokenExpired(decodedToken)) {
            return { valid: true, decodedToken };
        } else {
            return { valid: false, error: 'Token has expired' };
        }
    } catch (error) {
        return { valid: false, error: 'Invalid token' };
    }
};

module.exports = (connection) => {
    router.post('/login', [
        check('username').notEmpty().withMessage('Username is required'),
        check('password').notEmpty().withMessage('Password is required')
    ],
        (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: errors.array() });
            }
            const { username, password } = req.body;
            connection.query(`SELECT * FROM employees WHERE username = '${username}' AND password = '${generateMD5Hash(password)}'`, (err, results) => {
                if (!err && results.length === 1) {
                    const accessToken = jwt.sign({ username: username }, process.env.JWT_SECRET, { expiresIn: '1h' }, { algorithm: 'HS256' });
                    res.json({ accessToken });
                } else {
                    res.status(401).json({ message: 'Invalid credentials' });
                }
            });
        });

    // Route to verify JWT token
    router.post('/verify', (req, res) => {
        const token = req.headers.authorization.split(' ')[1];
        const verificationResult = verifyToken(token);
        if (verificationResult.valid) {
            res.status(200).json({ accessToken : token });
        } else {
            res.status(401).json({ error: verificationResult.error });
        }
    });

    return router;
};
