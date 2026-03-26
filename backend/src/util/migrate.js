const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection configuration
const pool = new Pool({
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432
});

/**
 * Ensures the migrations table exists
 */
async function ensureMigrationsTable() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Migrations table ready');
    } catch (error) {
        console.error('Error creating migrations table:', error);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Gets list of already executed migrations
 */
async function getExecutedMigrations() {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT name FROM migrations ORDER BY id');
        return result.rows.map(row => row.name);
    } catch (error) {
        console.error('Error fetching executed migrations:', error);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Executes a single migration file
 */
async function executeMigration(migrationName, sqlContent) {
    const client = await pool.connect();
    try {
        // Start transaction
        await client.query('BEGIN');

        // Execute migration SQL
        await client.query(sqlContent);

        // Record migration in migrations table
        await client.query(
            'INSERT INTO migrations (name) VALUES ($1)',
            [migrationName]
        );

        // Commit transaction
        await client.query('COMMIT');
        console.log(`✓ Migration ${migrationName} executed successfully`);
    } catch (error) {
        // Rollback on error
        await client.query('ROLLBACK');
        console.error(`✗ Error executing migration ${migrationName}:`, error.message);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Main migration runner
 */
async function runMigrations() {
    try {
        console.log('Starting database migrations...');

        // Ensure migrations table exists
        await ensureMigrationsTable();

        // Get list of executed migrations
        const executedMigrations = await getExecutedMigrations();
        console.log(`Already executed migrations: ${executedMigrations.length}`);

        // Get all migration files from migrations directory
        const migrationsDir = path.join(__dirname, '../../migrations');

        if (!fs.existsSync(migrationsDir)) {
            console.log('No migrations directory found');
            return;
        }

        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();

        console.log(`Found ${migrationFiles.length} migration file(s)`);

        // Execute pending migrations
        let executed = 0;
        for (const file of migrationFiles) {
            if (!executedMigrations.includes(file)) {
                const sqlContent = fs.readFileSync(
                    path.join(migrationsDir, file),
                    'utf8'
                );
                await executeMigration(file, sqlContent);
                executed++;
            } else {
                console.log(`- Skipping ${file} (already executed)`);
            }
        }

        if (executed === 0) {
            console.log('No new migrations to execute');
        } else {
            console.log(`Successfully executed ${executed} new migration(s)`);
        }

    } catch (error) {
        console.error('Migration process failed:', error);
        throw error;
    }
}

/**
 * Close database pool
 */
async function closeMigrationPool() {
    await pool.end();
}

module.exports = {
    runMigrations,
    closeMigrationPool
};
