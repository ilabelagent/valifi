# Valifi Platform: Environment Variables Example

This document provides the structure for the `.env` file required by the backend. Copy this content into a `.env` file in the `/backend` directory for local development, or set these variables as secrets in your production environment (e.g., Vercel).

```ini
# Turso Database Connection
# Get these from the Turso CLI: `turso db show <db-name> --url` and `turso db tokens create <db-name>`
TURSO_DATABASE_URL="libsql://your-turso-db-url.turso.io"
TURSO_AUTH_TOKEN="your-turso-auth-token"

# Google AI API Key for Gemini features (Co-Pilot, Tax Advisor)
API_KEY="your_google_ai_api_key_here"
```
