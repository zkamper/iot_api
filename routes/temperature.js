const express = require('express');
const router = express.Router();
const { Temperature } = require('../models');
const { setThreshold, getThreshold, setSystemState, getSystemState } = require('../utils');

// GET /temperature?count=n
router.get('/', async (req, res) => {
    const count = parseInt(req.query.count, 10) || 10;

    if (isNaN(count) || count <= 0) {
        return res.status(400).json({ error: 'Invalid count value' });
    }

    try {
        const entries = await Temperature.findAll({
            limit: count,
            order: [['timestamp', 'DESC']],
        });

        res.json(entries);
    } catch (err) {
        console.error('Error fetching temperatures:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /temperature?count=n
router.get('/', async (req, res) => {
    const count = parseInt(req.query.count, 10) || 10;

    if (isNaN(count) || count <= 0) {
        return res.status(400).json({ error: 'Invalid count value' });
    }

    try {
        const entries = await Temperature.findAll({
            limit: count,
            order: [['timestamp', 'DESC']],
        });

        res.json(entries);
    } catch (err) {
        console.error('Error fetching temperatures:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /temperature/threshholds
router.get('/threshholds', (req, res) => {
    let thresholds = getThreshold();
    res.json(thresholds);
});

// POST /temperature/threshholds
// Body: { "low": float, "high": float }
router.post('/threshholds', (req, res) => {
    const { low, high } = req.body;

    if (
        typeof low !== 'number' ||
        typeof high !== 'number' ||
        low > high
    ) {
        return res.status(400).json({ error: 'Invalid threshold values. "low" must be less than "high".' });
    }

    setThreshold(low, high);

    console.log(`Updated temperature thresholds: low=${low}, high=${high}`);
    res.json({ message: 'Thresholds updated', thresholds });
});


// GET /temperature/climate_state
router.get('/climate_state', (req, res) => {
    let climateState = getSystemState();
    res.json(climateState);
});

// POST /temperature/climate_state
// Body: { "acState": boolean, "windowState": boolean }
router.post('/climate_state', (req, res) => {
    const { acState, windowState } = req.body;

    if (typeof acState !== 'boolean' || typeof windowState !== 'boolean') {
        return res.status(400).json({ error: 'Invalid state values. Both must be boolean.' });
    }

    setSystemState(acState, windowState);

    console.log(`[Climate State] Updated: AC=${acState}, Window=${windowState}`);
    res.json({ message: 'Climate state updated', climateState });
});


module.exports = router;