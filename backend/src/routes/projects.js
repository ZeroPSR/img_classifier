const router = require('express').Router();
const projectController = require('../controllers/project_controller');
const { authenticateToken } = require('../util/auth_middleware');

// All project routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /projects
 * @desc    Create a new project
 * @access  Private
 */
router.post('/', projectController.createProject);

/**
 * @route   GET /projects
 * @desc    Get all projects for authenticated user
 * @access  Private
 */
router.get('/', projectController.getUserProjects);

/**
 * @route   GET /projects/:project_id
 * @desc    Get single project by ID
 * @access  Private
 */
router.get('/:project_id', projectController.getProjectById);

/**
 * @route   PUT /projects/:project_id
 * @desc    Update project name
 * @access  Private
 */
router.put('/:project_id', projectController.updateProject);

/**
 * @route   DELETE /projects/:project_id
 * @desc    Delete project
 * @access  Private
 */
router.delete('/:project_id', projectController.deleteProject);

module.exports = router;
