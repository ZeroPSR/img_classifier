

// Patches
const {inject, errorHandler} = require('express-custom-error');
inject(); // Patch express in order to use async / await syntax

// Require Dependencies

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const logger = require('./util/logger');

// Load .env Enviroment Variables to process.env

require('mandatoryenv').load([
    'DB_HOST',
    'DB_DATABASE',
    'DB_USER',
    'DB_PASSWORD',
    'PORT',
    'SECRET'
]);

const { PORT } = process.env;

// Import migration utility
const { runMigrations } = require('./util/migrate');

// Instantiate an Express Application
const app = express();


// Configure Express App Instance
app.use(express.json( { limit: '50mb' } ));
app.use(express.urlencoded( { extended: true, limit: '10mb' } ));

// Configure custom logger middleware
app.use(logger.dev, logger.combined);

app.use(cookieParser());
app.use(cors());
app.use(helmet());

// Serve static files (images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// This middleware adds the json header to API responses only
app.use('/auth', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});
app.use('/projects', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});
app.use('/images', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});
app.use('/objects', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});
app.use('/annotations', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// Assign Routes

app.use('/', require('./routes/router.js'));


// Handle errors
app.use(errorHandler());

// Handle not valid route
app.use('*', (req, res) => {
    res
    .status(404)
    .json( {status: false, message: 'Endpoint Not Found'} );
})

// Open Server on selected Port
async function startServer() {
    try {
        // Run database migrations before starting server
        await runMigrations();

        app.listen(
            PORT,
            () => console.info('Server listening on port ', PORT)
        );
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();