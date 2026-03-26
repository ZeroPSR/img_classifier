const router = require('express').Router();
const annotationController = require('../controllers/annotation_controller');
const { authenticateToken } = require('../util/auth_middleware');

// All annotation routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /annotations
 * @desc    Create a new annotation
 * @access  Private
 */
router.post('/', annotationController.createAnnotation);

/**
 * @route   GET /annotations/image/:img_id
 * @desc    Get all annotations for an image
 * @access  Private
 */
router.get('/image/:img_id', annotationController.getImageAnnotations);

/**
 * @route   GET /annotations/project/:project_id
 * @desc    Get all annotations for a project
 * @access  Private
 */
router.get('/project/:project_id', annotationController.getProjectAnnotations);

/**
 * @route   GET /annotations/:annotation_id
 * @desc    Get single annotation by ID
 * @access  Private
 */
router.get('/:annotation_id', annotationController.getAnnotationById);

/**
 * @route   PUT /annotations/:annotation_id
 * @desc    Update annotation
 * @access  Private
 */
router.put('/:annotation_id', annotationController.updateAnnotation);

/**
 * @route   DELETE /annotations/:annotation_id
 * @desc    Delete single annotation
 * @access  Private
 */
router.delete('/:annotation_id', annotationController.deleteAnnotation);

/**
 * @route   DELETE /annotations/image/:img_id
 * @desc    Delete all annotations for an image
 * @access  Private
 */
router.delete('/image/:img_id', annotationController.deleteImageAnnotations);

module.exports = router;
