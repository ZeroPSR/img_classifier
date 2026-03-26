#!/usr/bin/env node

/**
 * Standalone migration script
 * Run with: node scripts/migrate.js
 */

// Load environment variables
require('mandatoryenv').load([
    'DB_HOST',
    'DB_DATABASE',
    'DB_USER',
    'DB_PASSWORD'
]);

const { runMigrations, closeMigrationPool } = require('../src/util/migrate');

async function main() {
    try {
        console.log('=== Database Migration Tool ===\n');
        await runMigrations();
        console.log('\n=== Migration Complete ===');
        process.exit(0);
    } catch (error) {
        console.error('\n=== Migration Failed ===');
        console.error(error);
        process.exit(1);
    } finally {
        await closeMigrationPool();
    }
}

main();
