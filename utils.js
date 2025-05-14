let systemState = {
  acState: false,
  windowState: false,
  securitySystem: false,
};

let threshold = {
  low: 17.0,
  high: 23.0
}

const setThreshold = (low, high) => {
  threshold.low = low > 0 ? low : 16.0
  threshold.high = high > 0 ? high : 30.0
}

const getThreshold = () => ({
  low: threshold.low,
  high: threshold.high
});

const getSecuritySystemState = () => ({
  securitySystem: systemState.securitySystem
});

const setSecuritySystemState = (state) => {
  systemState.securitySystem = state;
}

const getSystemState = () => ({
  acState: systemState.acState,
  windowState: systemState.windowState
});

const setSystemState = (acState, windowState) => {
  systemState.acState = acState;
  systemState.windowState = windowState;
}

function createTemperatureLogger(TemperatureModel) {
  let lastValue = null;

  (async () => {
    const last = await TemperatureModel.findOne({ order: [['timestamp', 'DESC']] });
    lastValue = last ? last.value : 25.0;
  })();

  return async function () {
    let { low, high } = getThreshold();
    low = low || 16.0;
    high = high || 30.0;
    let { acState, windowState } = getSystemState();
    let delta = 0.0
    if (acState) {
      delta = -2.0; // cooling
    }
    if (windowState) {
      delta += 0.75 // window open, less effective
    }
    delta += (Math.random() - 0.5) * 2.0 + 0.75;
    const nextTemp = parseFloat((lastValue + parseFloat(delta)).toFixed(2));

    const clamped = Math.min(Math.max(nextTemp, 15), 30);

    if (clamped > high && !acState) {
      setSystemState(true, windowState);
      console.log(`[Temperature Logger] AC turned ON. Temperature: ${clamped}°C`);
      broadcastAlert("climateState", { acState: true });
    }
    if (clamped < low && !windowState) {
      setSystemState(false, true);
      console.log(`[Temperature Logger] Window opened. Temperature: ${clamped}°C`);
      broadcastAlert("climateState", { windowState: true });
    }

    try {
      await TemperatureModel.create({ value: clamped });
      lastValue = clamped;
      console.log(`[Temperature Logger] Logged: ${clamped}°C`);
    } catch (err) {
      console.error('Failed to log temperature:', err);
    }
  };
}

const clients = new Set();

function broadcastAlert(broadcastType, data) {
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: broadcastType, data }));
    }
  }
}

function createMovementLogger(MovementModel) {
  return async function () {
    const { securitySystemOn } = getSecuritySystemState();

    if (!securitySystemOn) return;

    // randomly simulate
    const shouldDetect = Math.random() < 0.3;
    if (!shouldDetect) return;

    // simulate
    const duration = parseFloat((Math.random() * 8 + 2).toFixed(2));

    try {
      await MovementModel.create({ duration });
      broadcastAlert("movement", { duration });
      console.log(`[Movement Logger] Detected movement for ${duration}s`);
    } catch (err) {
      console.error('Failed to log movement:', err);
    }
  };
}


module.exports = {
  createTemperatureLogger,
  createMovementLogger,
  setThreshold,
  getThreshold,
  getSecuritySystemState,
  setSecuritySystemState,
  getSystemState,
  setSystemState,
  clients
}