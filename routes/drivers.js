'use strict';

const express = require('express');
const fs      = require('fs');
const path    = require('path');

const FALLBACK_FILE = path.join(__dirname, '..', 'data', 'drivers.json');

function readFallback() {
    try {
        if (!fs.existsSync(FALLBACK_FILE)) return [];
        return JSON.parse(fs.readFileSync(FALLBACK_FILE, 'utf8'));
    } catch {
        return [];
    }
}

function writeFallback(rows) {
    try {
        fs.mkdirSync(path.dirname(FALLBACK_FILE), { recursive: true });
        fs.writeFileSync(FALLBACK_FILE, JSON.stringify(rows, null, 2), 'utf8');
    } catch (e) {
        console.error('Fallback write error:', e.message);
    }
}

module.exports = (db) => {
    const router = express.Router();

    // GET /api/drivers
    router.get('/', (req, res) => {
        db.query('SELECT * FROM drivers ORDER BY created_at DESC', (err, rows) => {
            if (err) {
                // Database niet beschikbaar — gebruik bestandsfallback
                return res.json(readFallback());
            }
            res.json(rows);
        });
    });

    // POST /api/drivers/register
    router.post('/register', (req, res) => {
        const {
            voornaam, achternaam, email, telefoon, profile_photo_url,
            rijbewijs, ervaring, voertuig, capaciteit, kentekenplaat,
            bouwjaar, route, school, tijd_och, tijd_mid, dag, prijs, op_afhaal
        } = req.body;

        if (!voornaam || !achternaam || !email) {
            return res.status(400).json({ success: false, error: 'Vul alle verplichte velden in.' });
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
                    return res.status(409).json({ success: false, error: 'Dit e-mailadres is al geregistreerd.' });
                }

                // Database niet beschikbaar — sla op in bestand
                console.warn('Database niet beschikbaar, gebruik bestandsfallback:', err.message);

                const rows = readFallback();
                if (rows.some(d => d.email === email)) {
                    return res.status(409).json({ success: false, error: 'Dit e-mailadres is al geregistreerd.' });
                }

                const newId = Date.now();
                const newDriver = {
                    user_id: newId, voornaam, achternaam, email, telefoon,
                    profile_photo_url, rijbewijs, ervaring, voertuig, capaciteit,
                    kentekenplaat, bouwjaar, route, school, tijd_och, tijd_mid,
                    dag, prijs, op_afhaal,
                    created_at: new Date().toISOString()
                };
                rows.push(newDriver);
                writeFallback(rows);

                return res.json({ success: true, user_id: newId });
            }

            res.json({ success: true, user_id: result.insertId });
        });
    });

    return router;
};
