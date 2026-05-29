'use strict';

require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const http       = require('http');
const { Server } = require('socket.io');
const path       = require('path');
const db         = require('./config/db');

const app        = express();
const httpServer = http.createServer(app);
const io         = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// ── DATABASE: auto-create tables on startup ───────────────────
const tables = [
    `CREATE TABLE IF NOT EXISTS drivers (
        user_id           INT AUTO_INCREMENT PRIMARY KEY,
        voornaam          VARCHAR(100) NOT NULL,
        achternaam        VARCHAR(100) NOT NULL,
        email             VARCHAR(200) UNIQUE NOT NULL,
        telefoon          VARCHAR(50),
        profile_photo_url LONGTEXT,
        rijbewijs         VARCHAR(10),
        ervaring          INT DEFAULT 0,
        voertuig          VARCHAR(100),
        capaciteit        INT,
        kentekenplaat     VARCHAR(20),
        bouwjaar          INT,
        route             VARCHAR(50),
        school            VARCHAR(100),
        tijd_och          VARCHAR(10),
        tijd_mid          VARCHAR(10),
        dag               VARCHAR(50),
        prijs             INT DEFAULT 0,
        op_afhaal         VARCHAR(50),
        created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS contact_messages (
        id                 INT AUTO_INCREMENT PRIMARY KEY,
        contact_name       VARCHAR(100),
        contact_achternaam VARCHAR(100),
        contact_email      VARCHAR(200),
        contact_subject    VARCHAR(200),
        contact_message    TEXT,
        created_at         DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS bus_locations (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        bus_id      VARCHAR(50),
        latitude    DECIMAL(10, 8),
        longitude   DECIMAL(11, 8),
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
];

tables.forEach(sql => {
    db.query(sql, err => {
        if (err) console.error('Table init error:', err.message);
    });
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Connected to MySQL database.');
        connection.release();
    }
});

// ── SOCKET.IO — REALTIME BUS TRACKER ─────────────────────────
const activeBuses = new Map();

io.on('connection', socket => {
    // Stuur actieve bussen + laatste locatie naar nieuwe verbinding
    activeBuses.forEach((bus, busId) => {
        socket.emit('bus:status', { busId, online: true, driverName: bus.driverName });
        if (bus.lastLat !== undefined && bus.lastLng !== undefined) {
            socket.emit('bus:location-update', { busId, lat: bus.lastLat, lng: bus.lastLng });
        }
    });

    socket.on('driver:start', ({ driverName, busId }) => {
        const id = busId || socket.id;
        activeBuses.set(id, { socketId: socket.id, driverName, path: [], lastLat: undefined, lastLng: undefined });
        io.emit('bus:status', { busId: id, online: true, driverName });
        console.log(`Bus ${id} started tracking — driver: ${driverName}`);
    });

    socket.on('driver:location', ({ lat, lng, busId }) => {
        const id  = busId || socket.id;
        const bus = activeBuses.get(id);
        if (bus) {
            bus.path.push({ lat, lng });
            bus.lastLat = lat;
            bus.lastLng = lng;
        }

        db.query(
            'INSERT INTO bus_locations (bus_id, latitude, longitude) VALUES (?, ?, ?)',
            [id, lat, lng],
            err => { if (err) console.error('Location insert error:', err.message); }
        );

        const driverName = activeBuses.get(id)?.driverName || 'Onbekend';
        io.emit('bus:location-update', { busId: id, lat, lng, driverName });
    });

    socket.on('driver:stop', ({ busId }) => {
        const id = busId || socket.id;
        activeBuses.delete(id);
        io.emit('bus:status', { busId: id, online: false });
        console.log(`Bus ${id} stopped tracking.`);
    });

    socket.on('disconnect', () => {
        for (const [busId, bus] of activeBuses) {
            if (bus.socketId === socket.id) {
                activeBuses.delete(busId);
                io.emit('bus:status', { busId, online: false });
                break;
            }
        }
    });
});

// ── API: Public config (maps key) ─────────────────────────────
app.get('/api/config', (req, res) => {
    res.json({ mapsKey: process.env.GOOGLE_MAPS_KEY || '' });
});

// ── API: Bus tracker status ───────────────────────────────────
app.get('/api/tracker/status', (req, res) => {
    const buses = [];
    activeBuses.forEach((bus, busId) => {
        buses.push({ busId, driverName: bus.driverName, online: true });
    });
    res.json({ buses });
});

// ── API: Admin — beveiligd overzicht ─────────────────────────
const authMiddleware = require('./middlewares/auth');

app.get('/api/admin/stats', authMiddleware, (req, res) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Geen toegang.' });

    const buses = [];
    activeBuses.forEach((bus, busId) => {
        buses.push({ busId, driverName: bus.driverName, online: true });
    });

    db.query('SELECT COUNT(*) AS total FROM drivers', (err, rows) => {
        const driverCount = err ? '?' : (rows[0]?.total ?? 0);
        db.query('SELECT COUNT(*) AS total FROM contact_messages', (err2, rows2) => {
            const msgCount = err2 ? '?' : (rows2[0]?.total ?? 0);
            res.json({ driverCount, msgCount, activeBuses: buses });
        });
    });
});

app.get('/api/admin/drivers', authMiddleware, (req, res) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Geen toegang.' });
    db.query('SELECT user_id, voornaam, achternaam, email, telefoon, route, school, created_at FROM drivers ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            const fs   = require('fs');
            const path = require('path');
            try {
                const raw = fs.readFileSync(path.join(__dirname, 'data', 'drivers.json'), 'utf8');
                const all = JSON.parse(raw).map(({ password_hash, ...rest }) => rest);
                return res.json(all);
            } catch { return res.status(500).json({ error: 'Database fout.' }); }
        }
        res.json(rows);
    });
});

app.delete('/api/admin/drivers/:id', authMiddleware, (req, res) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Geen toegang.' });
    db.query('DELETE FROM drivers WHERE user_id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: 'Verwijderen mislukt.' });
        res.json({ success: true });
    });
});

app.get('/api/admin/messages', authMiddleware, (req, res) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Geen toegang.' });
    db.query('SELECT * FROM contact_messages ORDER BY created_at DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database fout.' });
        res.json(rows);
    });
});

app.delete('/api/admin/messages/:id', authMiddleware, (req, res) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Geen toegang.' });
    db.query('DELETE FROM contact_messages WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: 'Verwijderen mislukt.' });
        res.json({ success: true });
    });
});

app.get('/api/admin/buses/history', authMiddleware, (req, res) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Geen toegang.' });
    db.query(
        'SELECT bus_id, latitude, longitude, recorded_at FROM bus_locations ORDER BY recorded_at DESC LIMIT 500',
        (err, rows) => {
            if (err) return res.status(500).json({ error: 'Database fout.' });
            res.json(rows);
        }
    );
});

// ── ROUTES ────────────────────────────────────────────────────
app.use('/api/auth',    require('./routes/auth')());
app.use('/api/drivers', require('./routes/drivers')(db));
app.use('/api/contact', require('./routes/contact')(db));
app.use('/api/tracker', require('./routes/tracker')(db));

// ── START SERVER ──────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`BusConnect server running on http://localhost:${PORT}`);
});
