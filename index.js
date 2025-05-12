const express = require('express');
const app = express();
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { sequelize, Temperature, Movement } = require('./models');
const { createTemperatureLogger, clients, createMovementLogger, setSecuritySystemState, getSecuritySystemState } = require('./utils');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    clients.add(ws);

    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected');
    });
});


// sync database
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to the database');
        await sequelize.sync(); // Ensures the table exists
        console.log('Models synchronized');

        const logTemperature = createTemperatureLogger(Temperature);
        const logMovement = createMovementLogger(Movement);
        setInterval(logMovement, 30 * 1000);
        setInterval(logTemperature, 15 * 1000);
    } catch (error) {
        console.error('Database error:', error);
    }
})();

const temperatureRoutes = require('./routes/temperature');
app.use('/temperature', temperatureRoutes);
app.post('/security_system', (req, res) => {
    const { securityState: newState } = req.body;
  
    if (typeof newState !== 'boolean') {
      return res.status(400).json({ error: '"securityState" must be a boolean' });
    }
  
    setSecuritySystemState(newState);
    console.log(`[Security] System is now ${newState ? 'ACTIVE' : 'INACTIVE'}`);
  
    res.json({
      message: 'Security system state updated',
      securityState: getSecuritySystemState().securitySystemOn,
    });
  });

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})