# Pingzo Node.js SDK

Official lightweight Node.js SDK for [Pingzo](https://www.pingzoapp.com) - uptime monitoring, public status pages, and instant WhatsApp alerts.

## Features

- **Heartbeat Checks**: Verify that background workers, cron jobs, and queues complete execution on time.
- **Express.js Middleware**: Expose structured `/healthz` endpoints that automatically report server and database connectivity states.
- **Zero Dependencies**: Exceptionally fast load times with no external dependency layers.

## Installation

```bash
npm install @pingzoapp/sdk
```

## Quick Start

### 1. Sending Cron Heartbeats
Initialize the client and send a ping notification at the end of key background routines:

```javascript
const Pingzo = require('@pingzoapp/sdk');
const pingzo = new Pingzo('your_project_api_key');

async function processDailyInvoices() {
  try {
    // Your routine execution logic...
    console.log('Invoices processed successfully.');
    
    // Notify Pingzo that the task completed on schedule
    pingzo.ping('invoice-cron-monitor-id');
  } catch (err) {
    console.error('Invoice run failed:', err.message);
  }
}
```

### 2. Express.js Health Check Route
Register the middleware inside your web server configuration to handle automated uptime checks:

```javascript
const express = require('express');
const Pingzo = require('@pingzoapp/sdk');

const app = express();
const pingzo = new Pingzo('your_project_api_key');

// Expose a health endpoint checking database connectivity
app.use(pingzo.expressMiddleware({
  path: '/healthz',
  customCheck: async () => {
    // Perform database pool query check here
    // Return true if healthy, false if unhealthy
    return true;
  }
}));

app.listen(3000, () => {
  console.log('Express app running on port 3000');
});
```

## License

MIT - Aurexis Technologies Private Limited. See [LICENSE](LICENSE) for details.