const router = require('express').Router();
const objectController = require('../controllers/object_controller');
const { authenticateToken } = require('../util/auth_middleware');

// All object routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /objects/:project_id
 * @desc    Create a new object in a project
 * @access  Private
 */
router.post('/:project_id', objectController.createObject);

/**
 * @route   GET /objects/:project_id
 * @desc    Get all objects for a project
 * @access  Private
 */
router.get('/:project_id', objectController.getProjectObjects);

/**
 * @route   GET /objects/:project_id/:obj_id
 * @desc    Get single object by ID
 * @access  Private
 */
router.get('/:project_id/:obj_id', objectController.getObjectById);

/**
 * @route   PUT /objects/:project_id/:obj_id
 * @desc    Update object name
 * @access  Private
 */
router.put('/:project_id/:obj_id', objectController.updateObject);

/**
 * @route   DELETE /objects/:project_id/:obj_id
 * @desc    Delete object
 * @access  Private
 */
router.delete('/:project_id/:obj_id', objectController.deleteObject);

module.exports = router;
