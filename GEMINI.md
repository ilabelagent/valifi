 # GEMINI.md

## Project Overview

This project is a comprehensive fintech platform named "Valifi Kingdom Platform". It's a full-stack application with a React frontend, a Node.js backend, and Python-based AI agents. The platform is designed for a wide range of financial activities, with a strong emphasis on cryptocurrency, AI-powered trading, and blockchain technologies. It also includes unique features related to music publishing and religious concepts.

### Key Technologies

*   **Frontend:** React, TypeScript, Vite, Tailwind CSS, Radix UI
*   **Backend:** Node.js, Express.js, TypeScript, Socket.IO
*   **Database:** PostgreSQL-compatible (likely NeonDB) with Drizzle ORM
*   **AI/ML:** Anthropic Claude, Google Gemini, OpenAI, LangChain
*   **Python Agents:** LitServe
*   **Web3/Crypto:** Ethers.js, WalletConnect, BitcoinJS, OpenZeppelin
*   **Trading:** Alpaca Trade API

### Architecture

The application follows a client-server architecture.

*   **Client:** A React-based single-page application (SPA) that provides the user interface for all the platform's features.
*   **Server:** A Node.js/Express.js server that exposes a REST API to the client. It handles business logic, database interactions, and communication with external services.
*   **AI Agents:** A system of Python-based AI agents that can be orchestrated to perform various tasks. These agents are likely managed and triggered by the backend.

## Building and Running

### Prerequisites

*   Node.js and npm
*   Python and pip
*   A PostgreSQL-compatible database

### Installation

1.  Install Node.js dependencies:
    ```bash
    npm install
    ```
2.  Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```

### Running the Application

*   **Development:**
    ```bash
    npm run dev
    ```
    This command starts the Vite development server for the frontend and the Node.js backend in development mode.

*   **Production:**
    ```bash
    npm run build
    npm run start
    ```
    This will build the frontend and backend for production and then start the production server.

### Database

The project uses `drizzle-kit` for database migrations. To push schema changes to the database, run:

```bash
npm run db:push
```

## Development Conventions

*   **TypeScript:** The entire codebase, both frontend and backend, is written in TypeScript, enforcing static typing.
*   **Testing:** TODO: No testing framework or scripts are explicitly defined in `package.json`. Tests should be added to ensure code quality.
*   **Linting/Formatting:** TODO: No linting or formatting tools (like ESLint or Prettier) are configured. It's recommended to add them to maintain a consistent code style.
*   **Environment Variables:** The application likely uses environment variables for configuration (e.g., database connection strings, API keys). A `.env` file is probably required for local development.
