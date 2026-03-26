const router = require('express').Router();
const imageController = require('../controllers/image_controller');
const { authenticateToken } = require('../util/auth_middleware');
const upload = require('../util/upload');

// All image routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /images/upload/:project_id
 * @desc    Upload single or multiple images to a project
 * @access  Private
 */
router.post('/upload/:project_id', upload.array('images', 100), imageController.uploadImages);

/**
 * @route   GET /images/project/:project_id
 * @desc    Get all images for a project
 * @access  Private
 */
router.get('/project/:project_id', imageController.getProjectImages);

/**
 * @route   GET /images/:img_id
 * @desc    Get single image by ID
 * @access  Private
 */
router.get('/:img_id', imageController.getImageById);

/**
 * @route   DELETE /images/:img_id
 * @desc    Delete image by ID
 * @access  Private
 */
router.delete('/:img_id', imageController.deleteImage);

module.exports = router;
