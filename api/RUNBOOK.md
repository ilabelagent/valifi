
# Valifi Auth on Vercel: Runbook

This document provides essential operational information for managing the Valifi authentication system deployed on Vercel with a Turso database.

## 1. Environment Variables

The backend server requires the following environment variables to be set in your Vercel project settings. These should be configured for **Production** and **Preview** environments.

| Variable Name        | Description                                       | Example Value                                |
| -------------------- | ------------------------------------------------- | -------------------------------------------- |
| `TURSO_DATABASE_URL` | The connection URL for your Turso database.       | `libsql://your-db-name.turso.io`             |
| `TURSO_AUTH_TOKEN`   | The authentication token for your Turso database. | `eyJhbGciOi...`                              |
| `API_KEY`            | Your Google AI API key for Gemini models.         | `AIzaSy...`                                  |

**Note**: The server will fail to start if any of these variables are missing, providing a clear error in the Vercel logs.

## 2. Authentication Model: Bearer Tokens

The application uses JSON Web Tokens (JWT) sent as Bearer Tokens for authentication. In this simplified implementation, the "token" is the user's unique ID.

-   **Login/Register**: The `/api/auth/login` and `/api/auth/register` endpoints return a `{ "success": true, "token": "user-uuid-here" }`.
-   **Frontend Storage**: The frontend client is responsible for storing this token securely (e.g., in `localStorage`).
-   **Authenticated Requests**: For all protected endpoints, the client must include the token in the `Authorization` header:
    ```
    Authorization: Bearer <user-uuid-here>
    ```
-   **Middleware**: The backend's `protect` middleware (`api/middleware/auth.js`) validates this token by checking for a user with the corresponding ID in the database.

## 3. CORS (Cross-Origin Resource Sharing)

-   **Configuration**: The Express server in `api/index.js` uses the `cors` middleware with default settings (`origin: true`).
-   **Behavior**: This configuration reflects the `Origin` header of the incoming request. For a Vercel deployment where the frontend and backend are served from the same top-level domain (`*.vercel.app`), this works seamlessly.
-   **Custom Domains**: If you map a custom domain to your frontend that differs from the backend's serverless function URL, you may need to configure a specific origin list in `cors` options for enhanced security.

## 4. Critical API Error Codes

The frontend should be prepared to handle the following specific error codes returned by the auth endpoints. These codes allow for precise user feedback.

| HTTP Status | Code                  | Endpoint(s)          | Meaning & Recommended UI Message                                     |
| ----------- | --------------------- | -------------------- | -------------------------------------------------------------------- |
| `400`       | `MISSING_FIELDS`      | `/login`, `/register`| The request body was incomplete. "Please fill out all required fields." |
| `400`       | `PASSWORD_TOO_SHORT`  | `/register`          | The provided password is too short. "Password must be at least 8 characters." |
| `401`       | `INVALID_CREDENTIALS` | `/login`             | Email not found or password incorrect. "Email or password is incorrect." |
| `401`       | `UNAUTHORIZED`        | All protected routes | The bearer token is invalid, expired, or missing. (Log the user out). |
| `403`       | `USER_INACTIVE`       | `/login`             | The user's account is not in an 'active' state. "Your account is currently inactive. Please contact support." |
| `409`       | `EMAIL_EXISTS`        | `/register`          | The email or username is already registered. "This email is already registered. Please sign in." |
| `429`       | `RATE_LIMITED`        | `/login`             | Too many failed login attempts. "Too many attempts. Please try again in a few minutes." |
| `500`       | `INTERNAL_ERROR`      | All endpoints        | A true unexpected server error occurred. "We hit a hiccup. Please try again. Ref: {correlationId}" (Vercel provides this ID). |

## 5. How to Rotate Secrets

### Rotating Turso Database Tokens

1.  **Generate a New Token**: In your terminal, create a new token for your production database.
    ```bash
    turso db tokens create valifi-prod
    ```
2.  **Update Vercel Environment Variable**:
    -   Go to your Vercel project's **Settings -> Environment Variables**.
    -   Edit the `TURSO_AUTH_TOKEN` variable.
    -   Paste the new token value and save.
3.  **Redeploy**: Trigger a new deployment in Vercel to apply the new secret.
4.  **Revoke the Old Token**: Once the new deployment is live and confirmed working, revoke the old token from the Turso dashboard or CLI to invalidate it.
    ```bash
    turso db tokens invalidate <old-token-name-or-value>
    ```

### Rotating Google AI API Key

1.  **Generate a New Key**: Go to the [Google AI Studio dashboard](https://aistudio.google.com/app/apikey) and create a new API key.
2.  **Update Vercel Environment Variable**:
    -   Go to your Vercel project's **Settings -> Environment Variables**.
    -   Edit the `API_KEY` variable.
    -   Paste the new key and save.
3.  **Redeploy**: Trigger a new deployment in Vercel.
4.  **Delete the Old Key**: Once the new deployment is confirmed working, you can delete the old API key from the Google AI Studio dashboard.
