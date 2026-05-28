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
    activeBuses.forEach((bus, busId) => {
        socket.emit('bus:status', { busId, online: true, driverName: bus.driverName });
    });

    socket.on('driver:start', ({ driverName, busId }) => {
        const id = busId || socket.id;
        activeBuses.set(id, { socketId: socket.id, driverName, path: [] });
        io.emit('bus:status', { busId: id, online: true, driverName });
        console.log(`Bus ${id} started tracking — driver: ${driverName}`);
    });

    socket.on('driver:location', ({ lat, lng, busId }) => {
        const id  = busId || socket.id;
        const bus = activeBuses.get(id);
        if (bus) bus.path.push({ lat, lng });

        db.query(
            'INSERT INTO bus_locations (bus_id, latitude, longitude) VALUES (?, ?, ?)',
            [id, lat, lng],
            err => { if (err) console.error('Location insert error:', err.message); }
        );

        io.emit('bus:location-update', { busId: id, lat, lng });
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
