'use strict';

const express = require('express');
const { MailtrapClient } = require('mailtrap');

module.exports = (db) => {
    const router = express.Router();

    // POST /api/contact — save a contact message and notify admin
    router.post('/', async (req, res) => {
        const { name, achternaam, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const sql = `
            INSERT INTO contact_messages (
                contact_name, contact_achternaam, contact_email, contact_subject, contact_message
            ) VALUES (?, ?, ?, ?, ?)
        `;

        db.query(sql, [name, achternaam, email, subject, message], async (err) => {
            if (err) {
                console.error('Contact database error:', err);
                return res.status(500).json({ success: false, error: 'Database error' });
            }

            if (process.env.MAILTRAP_TOKEN) {
                try {
                    const client = new MailtrapClient({ token: process.env.MAILTRAP_TOKEN });
                    await client.send({
                        from: { email: 'hello@demomailtrap.co', name: 'BusConnect Contact' },
                        to:   [{ email: process.env.ADMIN_EMAIL }],
                        subject: 'New Contact Message',
                        text: `New message from:\n\nName: ${name} ${achternaam}\nEmail: ${email}\n\nMessage:\n${message}`
                    });
                } catch (emailError) {
                    console.error('Admin email error:', emailError);
                }
            }

            return res.json({ success: true });
        });
    });

    return router;
};
