<?php
// Database Configuration - PostgreSQL
// ✅ SECURITY: Use environment variables instead of hard-coded credentials
return [
    'DB_HOST' => getenv('PGHOST') ?: 'localhost',
    'DB_NAME' => getenv('PGDATABASE') ?: 'valifi_production',
    'DB_USER' => getenv('PGUSER') ?: 'postgres',
    'DB_PASS' => getenv('PGPASSWORD') ?: '',
    'DB_PORT' => getenv('PGPORT') ?: '5432',
    'DB_TYPE' => 'pgsql', // PostgreSQL driver
    'CRON_TOKEN' => getenv('CRON_TOKEN') ?: 'change_me_in_secrets'
];
?>
