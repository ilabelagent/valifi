# Valifi Platform: Setup & Vercel Deployment Guide

This guide provides comprehensive instructions for setting up the Valifi platform for local development and deploying it to a production environment using Vercel.

## 1. Project Overview

Valifi is a modern full-stack application built with:

-   **Frontend**: A static React application served directly. It uses ES modules loaded via `esm.sh`.
-   **Backend**: A Node.js/Express API server located in the `/backend` directory, designed to run as Vercel Serverless Functions.
-   **Database**: [Turso](https://turso.tech/), a distributed SQLite-compatible database.

## 2. Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js**: v18 or later is recommended.
-   **npm**: Comes bundled with Node.js.
-   **Git**: For version control and deploying to Vercel.
-   A **Vercel Account**: [Sign up for free](https://vercel.com/signup) with your GitHub, GitLab, or Bitbucket account.
-   **Turso CLI**: [Installation instructions](https://docs.turso.tech/cli/installation).

---

## 3. Local Development Setup

Follow these steps to get the application running on your local machine.

### Step 1: Clone the Repository

Clone the repository from GitHub.

```bash
git clone https://github.com/ilabeliman/valifi.git
cd valifi
```

### Step 2: Install All Dependencies

From the **root directory** of the project, run the following commands to install dependencies for both the frontend tooling and the backend server:

```bash
# In project root
npm install       # Installs root dev dependencies (concurrently, serve)
npm run install   # Installs backend dependencies (runs "npm install --prefix backend")
```

### Step 3: Set Up Turso Database

1.  **Authenticate with Turso**:
    ```bash
    turso auth login
    ```
2.  **Create a New Database**:
    ```bash
    turso db create valifi-dev
    ```
3.  **Get the Database URL**:
    ```bash
    turso db show valifi-dev --url
    # Copy the output, it will look like: libsql://valifi-dev-yourusername.turso.io
    ```
4.  **Get an Authentication Token**:
    ```bash
    turso db tokens create valifi-dev
    # Copy the generated token.
    ```

### Step 4: Configure Backend Environment

1.  Navigate to the backend directory: `cd backend`
2.  Create a new file named `.env` by copying the example file: `cp .env.example .env`
3.  Open the `.env` file and add your Turso credentials and Google AI API key:

    ```ini
    # backend/.env

    # From Turso CLI step 3
    TURSO_DATABASE_URL="libsql://your-turso-db-url.turso.io"

    # From Turso CLI step 4
    TURSO_AUTH_TOKEN="your-turso-auth-token"

    # Your Google AI API Key for Gemini features
    API_KEY="your_google_ai_api_key_here"
    ```

### Step 5: Run the Development Servers

Navigate back to the **root directory** and start both the frontend and backend servers:

```bash
# Run from the project root
cd ..
npm run dev
```

This command will:
-   Start the **Backend** on `http://localhost:3001`. On its first run, it will automatically create the database tables and seed a default admin user (`test@example.com` / `password`).
-   Start the **Frontend** on `http://localhost:3000`.

You can now access the application in your browser at **`http://localhost:3000`**.

---

## 4. Production Deployment on Vercel

Vercel will automatically handle the static frontend and the serverless backend.

### Step 1: Connect Your Project to Vercel

1.  Log in to your Vercel account.
2.  Click "Add New..." -> "Project".
3.  Import your `valifi` Git repository.

### Step 2: Configure the Project

Vercel automatically detects the project structure. Confirm the following settings:

-   **Framework Preset**: Select **Other**.
-   **Build and Output Settings**: Leave these **blank**.
-   **Root Directory**: Should be the repository root.

Vercel will automatically detect the `/backend` directory and deploy your Express app as Serverless Functions. Any request from the frontend to `/api/*` will be correctly rewritten and handled.

### Step 3: Add Environment Variables

1.  In your Vercel project's dashboard, go to **Settings** -> **Environment Variables**.
2.  Add the following secrets, ensuring they are available to all environments (Production, Preview, Development):
    -   `API_KEY`: Your Google AI API key.
    -   `TURSO_DATABASE_URL`: Your **production** Turso database URL. It's recommended to create a separate DB for production (`turso db create valifi-prod`).
    -   `TURSO_AUTH_TOKEN`: An auth token for your production Turso database.

### Step 4: Deploy

Click the **Deploy** button. Vercel will build and deploy your site.

### Step 5: Initialize Production Database

The first time you deploy, your production database will be empty. Vercel does not run the `initializeSchema` function on startup. You must manually initialize it.

1.  **Create the Tables**:
    ```bash
    # Get your production database shell
    turso db shell valifi-prod
    
    # Paste the entire content of backend/lib/schema.sql into the shell and press Enter.
    # This will create all the necessary tables.
    .read backend/lib/schema.sql
    ```
2.  **(Crucial) Designate an Admin User**:
    The admin account is a regular user account that has been granted special privileges. The password is set during the standard sign-up process.
    
    **Step 1: Create Your Account**
    - Go to your live Vercel deployment URL.
    - Use the "Sign Up" button to create your primary administrator account with a secure password.
    
    **Step 2: Grant Admin Privileges**
    - Once registered, run the following command in your local terminal to elevate your new user to an admin.
    
    ```bash
    # Replace 'valifi-prod' with your production DB name and 'your-admin-email@example.com' with the email you just registered.
    turso db shell valifi-prod "UPDATE users SET isAdmin = TRUE WHERE email = 'your-admin-email@example.com'"
    ```
    
    Your account now has administrative privileges.

### Continuous Deployment

Vercel's CI/CD is now active. **Any `git push` to your main branch will automatically trigger a new deployment** with the latest changes. Pull requests will generate unique Preview Deployments for testing.
