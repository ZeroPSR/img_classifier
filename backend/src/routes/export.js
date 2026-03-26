const router = require('express').Router();
const exportController = require('../controllers/export_controller');
const { authenticateToken } = require('../util/auth_middleware');

// All export routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /export/:project_id
 * @desc    Export project annotations as CSV and classes.txt in a zip file
 * @access  Private
 */
router.get('/:project_id', exportController.exportProject);

module.exports = router;
