# Valifi API

## Structure

This API is structured as a single serverless function deployment for Vercel.

### Directory Structure:
- `/api/index.js` - Main entry point (the only serverless function)
- `/api/src/` - All source code organized in subdirectories
  - `/api/src/routes/` - Route definitions
  - `/api/src/controllers/` - Business logic
  - `/api/src/middleware/` - Middleware functions
  - `/api/src/lib/` - Utility libraries and database
  - `/api/src/data/` - Data files
  - `/api/src/migrations/` - Database migrations

### Important Notes:
- Only `index.js` in the root `/api` folder is deployed as a serverless function
- All other code is in the `/src` subdirectory to avoid creating multiple functions
- This structure ensures compatibility with Vercel's Hobby plan (max 12 functions)

### Environment Variables:
Required environment variables (set in Vercel dashboard):
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `API_KEY`

### Deployment:
Push to GitHub and Vercel will automatically deploy the single serverless function.
