# Valifi Platform: Environment Variables

This document provides details on the environment variables required by the Valifi backend API.

**The canonical source for these variables is the `/api/.env.example` file.** For local development, copy `/api/.env.example` to a new file named `/api/.env` and fill in the required values.

---

## Required Variables

These variables are essential for the server to start and function correctly.

### `TURSO_DATABASE_URL`
- **Description**: The connection URL for your Turso database.
- **How to get it**: Run the Turso CLI command `turso db show <your-database-name> --url`.
- **Example**: `libsql://valifi-prod-yourusername.turso.io`

### `TURSO_AUTH_TOKEN`
- **Description**: The authentication token for your Turso database. This acts as the password.
- **How to get it**: Run the Turso CLI command `turso db tokens create <your-database-name>`.
- **Example**: `eyJhbGciOi...`

### `API_KEY`
- **Description**: Your Google AI API key, required for all AI-powered features like the Co-Pilot and Tax Advisor which use the Gemini model.
- **How to get it**: Obtain your key from the [Google AI Studio dashboard](https://aistudio.google.com/app/apikey).
- **Example**: `AIzaSy...`

---

## Optional Variables

These variables have default values but can be overridden for specific configurations.

### `PORT`
- **Description**: The port the backend server will listen on.
- **Default**: `3001`

### `API_BASE_URL`
- **Description**: The base URL prefix for all API routes. This is useful if you are running the API behind a proxy.
- **Default**: `/api`
