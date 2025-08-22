# Valifi Platform: Environment Variables

This document provides comprehensive details on the environment variables required by the Valifi backend API. These variables are crucial for connecting to the database, enabling AI features, and configuring the server.

**The canonical source for these variables is the `/api/.env.example` file.** For local development, copy this file to a new file named `/api/.env` and fill in the required values. For production deployment (e.g., on Vercel), these variables must be set in your project's settings.

---

## Required Variables

These variables are **essential** for the server to start and function correctly. The application will exit on startup if any of these are missing.

### `TURSO_DATABASE_URL`
- **Description**: The connection URL for your Turso database, which stores all platform data.
- **How to get it**: Run the Turso CLI command `turso db show <your-database-name> --url`.
- **Example**: `libsql://valifi-prod-yourusername.turso.io`

### `TURSO_AUTH_TOKEN`
- **Description**: The authentication token for your Turso database. This acts as the password and is required to read from or write to the database.
- **How to get it**: Run the Turso CLI command `turso db tokens create <your-database-name>`.
- **Example**: `eyJhbGciOi...`

### `API_KEY`
- **Description**: Your Google AI API key. This is required for all AI-powered features, including the Co-Pilot assistant and the Tax Advisor, which use the Gemini model for generating responses.
- **How to get it**: Obtain your key from the [Google AI Studio dashboard](https://aistudio.google.com/app/apikey).
- **Example**: `AIzaSy...`

---

## Optional Variables

These variables have default values but can be overridden for specific configurations, such as running the backend behind a custom proxy.

### `PORT`
- **Description**: The TCP port the backend Express server will listen on for incoming requests.
- **Default**: `3001`
- **When to change**: Change this if port 3001 is already in use on your development machine.

### `API_BASE_URL`
- **Description**: The base URL prefix for all API routes (e.g., `/api/auth/login`).
- **Default**: `/api`
- **When to change**: You generally do not need to change this unless you have a specific reverse proxy setup that requires a different API path.
