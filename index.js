const http = require('http');
const https = require('https');

class Pingzo {
  /**
   * Initialize the Pingzo Client
   * @param {string} apiKey - Your Pingzo API project key
   */
  constructor(apiKey) {
    if (!apiKey) {
      console.warn('[Pingzo] Warning: API key is not set. Heartbeats will run in dry-run mode.');
    }
    this.apiKey = apiKey;
  }

  /**
   * Send a heartbeat ping to verify a cron job or background task completed
   * @param {string} monitorId - The unique check identifier or secret token
   */
  ping(monitorId) {
    if (!monitorId) {
      console.error('[Pingzo] Error: monitorId is required to send a heartbeat.');
      return;
    }

    const url = `https://api.pingzo.com/v1/ping/${monitorId}`;
    const client = url.startsWith('https') ? https : http;

    client.get(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'User-Agent': 'pingzo-node-sdk/1.0.0'
      }
    }, (res) => {
      if (res.statusCode !== 200) {
        console.warn(`[Pingzo] Heartbeat ping returned status code: ${res.statusCode}`);
      }
    }).on('error', (err) => {
      console.error('[Pingzo] Connection failed during check-in:', err.message);
    });
  }

  /**
   * Express.js middleware to automatically handle health checks
   * @param {Object} options - Config options
   * @param {string} options.path - The path to expose (default: '/healthz')
   * @param {Function} options.customCheck - Optional callback returning a boolean (e.g. database validation)
   */
  expressMiddleware(options = {}) {
    const checkPath = options.path || '/healthz';
    const customCheck = options.customCheck || (() => Promise.resolve(true));

    return async (req, res, next) => {
      if (req.path === checkPath) {
        try {
          const isHealthy = await customCheck();
          if (isHealthy) {
            return res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
          } else {
            return res.status(503).json({ status: 'unhealthy', error: 'Custom health validation failed' });
          }
        } catch (err) {
          return res.status(500).json({ status: 'unhealthy', error: err.message });
        }
      }
      next();
    };
  }
}

module.exports = Pingzo;