'use strict';

const express  = require('express');
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');

module.exports = () => {
  const router = express.Router();

  router.post('/admin/login', async (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email en wachtwoord zijn verplicht.' });
    }

    const adminEmail = process.env.ADMIN_LOGIN_EMAIL;
    const adminHash  = process.env.ADMIN_PASSWORD_HASH;

    if (email.toLowerCase() !== adminEmail?.toLowerCase()) {
      return res.status(401).json({ success: false, error: 'Ongeldige inloggegevens.' });
    }

    const valid = await bcrypt.compare(password, adminHash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Ongeldige inloggegevens.' });
    }

    const token = jwt.sign(
      { email, role: 'admin' },
      process.env.JWT_SECRET || 'changeme',
      { expiresIn: '8h' }
    );

    return res.json({ success: true, token });
  });

  return router;
};
