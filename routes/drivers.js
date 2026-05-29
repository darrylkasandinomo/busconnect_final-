'use strict';

const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const fs      = require('fs');
const path    = require('path');

const FALLBACK_FILE = path.join(__dirname, '..', 'data', 'drivers.json');

function readFallback() {
    try {
        if (!fs.existsSync(FALLBACK_FILE)) return [];
        return JSON.parse(fs.readFileSync(FALLBACK_FILE, 'utf8'));
    } catch { return []; }
}

function writeFallback(rows) {
    try {
        fs.mkdirSync(path.dirname(FALLBACK_FILE), { recursive: true });
        fs.writeFileSync(FALLBACK_FILE, JSON.stringify(rows, null, 2), 'utf8');
    } catch (e) { console.error('Fallback write error:', e.message); }
}

module.exports = (db) => {
    const router = express.Router();

    // GET /api/drivers — publiek overzicht (zonder wachtwoordhash)
    router.get('/', (req, res) => {
        db.query('SELECT * FROM drivers ORDER BY created_at DESC', (err, rows) => {
            if (err) return res.json(readFallback().map(d => { const {password_hash, ...rest} = d; return rest; }));
            res.json(rows);
        });
    });

    // POST /api/drivers/register
    router.post('/register', async (req, res) => {
        const {
            voornaam, achternaam, email, telefoon, password, profile_photo_url,
            rijbewijs, ervaring, voertuig, capaciteit, kentekenplaat,
            bouwjaar, route, school, tijd_och, tijd_mid, dag, prijs, op_afhaal
        } = req.body;

        if (!voornaam || !achternaam || !email || !password) {
            return res.status(400).json({ success: false, error: 'Vul alle verplichte velden in.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, error: 'Wachtwoord moet minimaal 6 tekens zijn.' });
        }

        const password_hash = await bcrypt.hash(password, 10);

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
                // Fallback: sla op in JSON bestand
                const rows = readFallback();
                if (rows.some(d => d.email === email)) {
                    return res.status(409).json({ success: false, error: 'Dit e-mailadres is al geregistreerd.' });
                }
                const newId = Date.now();
                rows.push({
                    user_id: newId, voornaam, achternaam, email, telefoon,
                    profile_photo_url, password_hash, rijbewijs, ervaring, voertuig,
                    capaciteit, kentekenplaat, bouwjaar, route, school,
                    tijd_och, tijd_mid, dag, prijs, op_afhaal,
                    created_at: new Date().toISOString()
                });
                writeFallback(rows);
                return res.json({ success: true, user_id: newId });
            }
            res.json({ success: true, user_id: result.insertId });
        });
    });

    // POST /api/drivers/login
    router.post('/login', async (req, res) => {
        const { email, password } = req.body || {};
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'E-mail en wachtwoord zijn verplicht.' });
        }

        // Probeer database eerst
        db.query('SELECT * FROM drivers WHERE email = ?', [email], async (err, rows) => {
            let driver = null;

            if (err || !rows || rows.length === 0) {
                // Fallback naar JSON
                const all = readFallback();
                driver = all.find(d => d.email === email);
            } else {
                driver = rows[0];
            }

            if (!driver) {
                return res.status(401).json({ success: false, error: 'Geen account gevonden met dit e-mailadres.' });
            }

            if (!driver.password_hash) {
                return res.status(401).json({ success: false, error: 'Uw account heeft geen wachtwoord. Registreer opnieuw.' });
            }

            const valid = await bcrypt.compare(password, driver.password_hash);
            if (!valid) {
                return res.status(401).json({ success: false, error: 'Onjuist wachtwoord.' });
            }

            const token = jwt.sign(
                {
                    user_id:   driver.user_id,
                    email:     driver.email,
                    naam:      `${driver.voornaam} ${driver.achternaam}`,
                    voornaam:  driver.voornaam,
                    achternaam: driver.achternaam,
                    route:     driver.route,
                    school:    driver.school,
                    voertuig:  driver.voertuig,
                    foto:      driver.profile_photo_url,
                    role:      'driver'
                },
                process.env.JWT_SECRET || 'changeme',
                { expiresIn: '12h' }
            );

            res.json({ success: true, token });
        });
    });

    return router;
};
