# Valifi Platform: Deployment Guide

This guide provides step-by-step instructions for deploying the Valifi platform, which consists of a static React frontend and a Node.js/Express backend.

## 1. Prerequisites

Before you begin, ensure you have the following installed on your server:

-   **Node.js** (v18 or later recommended)
-   **npm** (usually comes with Node.js)
-   A process manager like **PM2** (recommended for production): `npm install pm2 -g`
-   A web server like **Nginx** or **Apache** to serve the frontend and proxy API requests.

---

## 2. Backend Deployment

The backend is a Node.js application that serves the API.

### Step 1: Clone and Install Dependencies

Navigate to the `backend` directory of the project and install the required npm packages.

```bash
cd /path/to/your/project/backend
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `backend` directory. This file will store your secret keys and configuration variables.

```bash
# backend/.env

# The port for the backend server to run on.
PORT=3001

# Your Google AI API Key for Gemini features (Co-Pilot, Tax Advisor).
# This is CRITICAL for AI functionalities to work.
API_KEY="your_google_ai_api_key_here"

# (Optional) The base path for all API routes. Defaults to /api if not set.
API_BASE_URL=/api
```

### Step 3: Run the Backend Server

For development, you can run the server directly:

```bash
npm run dev
```

For a production environment, it is highly recommended to use a process manager like PM2 to keep the application running continuously.

```bash
# Start the application with PM2
pm2 start index.js --name "valifi-backend"

# To view logs
pm2 logs valifi-backend

# To stop
pm2 stop valifi-backend
```

The backend server will now be running (e.g., on `http://localhost:3001`).

---

## 3. Frontend Deployment

The frontend consists of static files (`index.html`, `index.tsx`, etc.) that need to be served by a web server.

### Step 1: Place Files on Server

Copy all the frontend files and directories (everything in the project root *except* the `backend` directory and `deployment-guide.md`) to your web server's root directory (e.g., `/var/www/valifi`).

### Step 2: Configure the Web Server (Nginx Example)

The web server needs to do two things:
1.  Serve the static frontend files.
2.  Proxy API requests (e.g., requests to `/api/*`) to the running backend server.

Below is an example Nginx server block configuration:

```nginx
# /etc/nginx/sites-available/valifi

server {
    listen 80;
    server_name your-domain.com; # Replace with your domain or IP

    # The root directory where your frontend files are located
    root /var/www/valifi;
    index index.html;

    # Serve static files directly
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to the backend server
    location /api/ {
        proxy_pass http://localhost:3001; # Matches the backend PORT
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 3: Enable the Nginx Configuration

1.  Create a symbolic link to the `sites-enabled` directory:
    ```bash
    sudo ln -s /etc/nginx/sites-available/valifi /etc/nginx/sites-enabled/
    ```
2.  Test the Nginx configuration:
    ```bash
    sudo nginx -t
    ```
3.  If the test is successful, restart Nginx to apply the changes:
    ```bash
    sudo systemctl restart nginx
    ```

---

## 4. Final Steps

Your Valifi platform should now be live!

-   Access the frontend by navigating to your domain or server's IP address in a web browser.
-   The frontend will automatically make API calls to the backend via the Nginx proxy.
-   The backend process is managed by PM2, ensuring it restarts automatically if it crashes.

By following these steps, you will have a scalable and robust deployment of the Valifi application.
