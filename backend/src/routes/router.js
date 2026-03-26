const router = require('express').Router();

// Import route modules
const authRoutes = require('./auth');
const projectRoutes = require('./projects');
const imageRoutes = require('./images');
const objectRoutes = require('./objects');
const annotationRoutes = require('./annotations');
const exportRoutes = require('./export');

// Mount routes
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/images', imageRoutes);
router.use('/objects', objectRoutes);
router.use('/annotations', annotationRoutes);
router.use('/export', exportRoutes);

module.exports = router;