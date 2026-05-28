'use strict';

const express = require('express');

module.exports = (db) => {
    const router = express.Router();

    // GET /api/drivers — list all registered drivers
    router.get('/', (req, res) => {
        db.query(
            'SELECT * FROM drivers ORDER BY created_at DESC',
            (err, rows) => {
                if (err) return res.status(500).json({ success: false, error: err.message });
                res.json(rows);
            }
        );
    });

    // POST /api/drivers/register — register a new driver
    router.post('/register', (req, res) => {
        const {
            voornaam, achternaam, email, telefoon, profile_photo_url,
            rijbewijs, ervaring, voertuig, capaciteit, kentekenplaat,
            bouwjaar, route, school, tijd_och, tijd_mid, dag, prijs, op_afhaal
        } = req.body;

        if (!voornaam || !achternaam || !email) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const sql = `
            INSERT INTO drivers (
                voornaam, achternaam, email, telefoon, profile_photo_url,
                rijbewijs, ervaring, voertuig, capaciteit, kentekenplaat,
                bouwjaar, route, school, tijd_och, tijd_mid, dag, prijs, op_afhaal
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(sql, [
            voornaam, achternaam, email, telefoon, profile_photo_url,
            rijbewijs, ervaring, voertuig, capaciteit, kentekenplaat,
            bouwjaar, route, school, tijd_och, tijd_mid, dag, prijs, op_afhaal
        ], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ success: false, error: 'Email address is already registered.' });
                }
                console.error('Register driver error:', err.message);
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json({ success: true, user_id: result.insertId });
        });
    });

    return router;
};
