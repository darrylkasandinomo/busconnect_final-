'use strict';

const express = require('express');
const fs      = require('fs');
const path    = require('path');

const FALLBACK_FILE = path.join(__dirname, '..', 'data', 'messages.json');

function saveFallback(entry) {
    try {
        fs.mkdirSync(path.dirname(FALLBACK_FILE), { recursive: true });
        const existing = fs.existsSync(FALLBACK_FILE)
            ? JSON.parse(fs.readFileSync(FALLBACK_FILE, 'utf8'))
            : [];
        existing.push(entry);
        fs.writeFileSync(FALLBACK_FILE, JSON.stringify(existing, null, 2), 'utf8');
    } catch (e) {
        console.error('Contact fallback write error:', e.message);
    }
}

function readFallback() {
    try {
        if (!fs.existsSync(FALLBACK_FILE)) return [];
        return JSON.parse(fs.readFileSync(FALLBACK_FILE, 'utf8'));
    } catch { return []; }
}

module.exports = (db) => {
    const router = express.Router();

    // POST /api/contact — save a contact message
    router.post('/', async (req, res) => {
        const { name, achternaam, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, error: 'Vul alle verplichte velden in.' });
        }

        const sql = `
            INSERT INTO contact_messages (
                contact_name, contact_achternaam, contact_email, contact_subject, contact_message
            ) VALUES (?, ?, ?, ?, ?)
        `;

        db.query(sql, [name, achternaam, email, subject, message], (err) => {
            if (err) {
                console.error('Contact database error — using fallback:', err.message);
                saveFallback({
                    id: Date.now(),
                    contact_name: name,
                    contact_achternaam: achternaam || '',
                    contact_email: email,
                    contact_subject: subject || '',
                    contact_message: message,
                    created_at: new Date().toISOString()
                });
            }
            return res.json({ success: true });
        });
    });

    // GET /api/contact/fallback — berichten uit JSON bestand (als DB down is)
    router.get('/fallback', (req, res) => {
        res.json(readFallback());
    });

    return router;
};
