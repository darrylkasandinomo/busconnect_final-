'use strict';

const express = require('express');

module.exports = (db) => {
    const router = express.Router();

    // GET /api/tracker/route/:busId — retrieve recorded route points for a bus
    router.get('/route/:busId', (req, res) => {
        const { busId } = req.params;
        const limit = Math.min(parseInt(req.query.limit) || 300, 1000);

        db.query(
            'SELECT latitude, longitude, recorded_at FROM bus_locations WHERE bus_id = ? ORDER BY recorded_at DESC LIMIT ?',
            [busId, limit],
            (err, rows) => {
                if (err) return res.status(500).json({ success: false, error: err.message });
                res.json({ success: true, points: rows.reverse() });
            }
        );
    });

    return router;
};
