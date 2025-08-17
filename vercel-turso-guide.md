# Guide: Connecting Vercel to a Turso Database

This guide provides step-by-step instructions for connecting your Vercel-deployed Valifi backend to a production-ready Turso database. This process ensures your application can securely access its database in a live environment.

## Prerequisites

-   A Vercel account with the Valifi project imported from your Git repository.
-   [Turso CLI](https://docs.turso.tech/cli/installation) installed and authenticated (`turso auth login`).

---

### Step 1: Create a Dedicated Production Database

It is a critical security and operational best practice to use a separate database for your production environment. Never use your development database for the live application.

1.  Open your terminal and run the following command to create a new database for production:
    ```bash
    turso db create valifi-prod
    ```

---

### Step 2: Get Production Database Credentials

Your Vercel deployment needs two pieces of information to connect to Turso: the database URL and an authentication token.

1.  **Get the Database URL**:
    ```bash
    turso db show valifi-prod --url
    ```
    Copy the output. It will look like `libsql://valifi-prod-yourusername.turso.io`.

2.  **Get an Authentication Token**:
    ```bash
    turso db tokens create valifi-prod --read-only
    ```
    For enhanced security in a read-heavy application, you can start with a read-only token. If you have operations that write to the database (which Valifi does), you may need a full-access token:
    ```bash
    turso db tokens create valifi-prod
    ```
    Copy the generated token.

---

### Step 3: Configure Vercel Environment Variables

Now, you will provide the credentials you just obtained to your Vercel project.

1.  Go to your project's dashboard on the Vercel website.
2.  Navigate to the **Settings** tab.
3.  Click on **Environment Variables** in the left sidebar.
4.  Add the following variables one by one. For each, paste the value you copied from the Turso CLI.

    | Name                 | Value                                     | Environments         |
    | :------------------- | :---------------------------------------- | :------------------- |
    | `TURSO_DATABASE_URL` | The `libsql://...` URL from Step 2.1.     | Production, Preview  |
    | `TURSO_AUTH_TOKEN`   | The authentication token from Step 2.2.   | Production, Preview  |
    | `API_KEY`            | Your Google AI API key for Gemini.        | Production, Preview  |

    **Important**: Ensure you **uncheck** the "Development" environment for these production secrets to maintain security.

---

### Step 4: Redeploy the Application

After adding the environment variables, you must trigger a new deployment for the changes to take effect.

1.  Navigate to the **Deployments** tab in your Vercel project.
2.  Click the "Redeploy" button on the latest deployment, or simply push a new commit to your connected Git branch.

Vercel will build and deploy your application using the new production environment variables.

### Step 5: Initialize the Production Database Schema

Your new production database is empty. Since Vercel's serverless environment does not automatically run the schema initialization script from `backend/lib/db.js`, you must do this manually **one time**.

1.  **Connect to your production database shell**:
    ```bash
    turso db shell valifi-prod
    ```
2.  **Run the schema file**: Once you are in the Turso shell (you will see a `>` prompt), execute the `.read` command. You must run this command from the **root directory of your local project**.
    ```sql
    .read backend/lib/schema.sql
    ```
    This command will execute all the `CREATE TABLE` statements and set up your database structure.

Your Vercel deployment is now fully connected and configured to work with your Turso production database.
