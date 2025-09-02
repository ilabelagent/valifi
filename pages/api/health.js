// Health check endpoint for Render
export default function handler(req, res) {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    service: 'valifi-fintech-platform',
    version: process.env.npm_package_version || '3.0.0',
    environment: process.env.NODE_ENV || 'development'
  };
ECHO is off.
  try {
    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.message = error;
    res.status(503).json(healthcheck);
  }
}
