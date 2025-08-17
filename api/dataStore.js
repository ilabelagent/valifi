/*
 * This module is deprecated. Data is now persisted in the Turso database.
 * See `backend/lib/db.js` for database connection and initialization.
 * All controllers now import `db` from `../lib/db.js` and perform SQL queries.
 */

// All in-memory arrays like `users`, `offers`, `orders` have been removed.
// The `genId` function is replaced by `crypto.randomUUID()`.
