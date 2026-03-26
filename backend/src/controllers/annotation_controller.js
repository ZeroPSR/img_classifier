const pool = require('../util/db');

/**
 * Create a new annotation
 */
async function createAnnotation(req, res) {
    const { img_id, obj_id, project_id, x_min, width, y_min, height } = req.body;
    const user_id = req.user.user_id;

    // Validate required fields
    if (img_id === undefined || obj_id === undefined || project_id === undefined ||
        x_min === undefined || width === undefined ||
        y_min === undefined || height === undefined) {
        return res.status(400).json({
            status: false,
            message: 'Missing required fields: img_id, obj_id, project_id, x_min, width, y_min, height'
        });
    }

    // Validate numeric fields
    if (isNaN(img_id) || isNaN(obj_id) || isNaN(project_id) ||
        isNaN(x_min) || isNaN(width) ||
        isNaN(y_min) || isNaN(height)) {
        return res.status(400).json({
            status: false,
            message: 'Invalid numeric values for annotation fields'
        });
    }

    // Validate positive dimensions
    if (width <= 0 || height <= 0) {
        return res.status(400).json({
            status: false,
            message: 'Width and height must be positive values'
        });
    }

    const client = await pool.connect();

    try {
        // Verify user owns the project
        const projectCheck = await client.query(
            'SELECT project_id FROM projects WHERE project_id = $1 AND user_id = $2',
            [project_id, user_id]
        );

        if (projectCheck.rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Project not found or access denied'
            });
        }

        // Verify image belongs to the project
        const imageCheck = await client.query(
            'SELECT img_id FROM images WHERE img_id = $1 AND project_id = $2',
            [img_id, project_id]
        );

        if (imageCheck.rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Image not found in this project'
            });
        }

        // Verify object exists in the project
        const objectCheck = await client.query(
            'SELECT obj_id FROM objects WHERE project_id = $1 AND obj_id = $2',
            [project_id, obj_id]
        );

        if (objectCheck.rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Object not found in this project'
            });
        }

        // Insert annotation
        const result = await client.query(
            `INSERT INTO annotations (img_id, obj_id, project_id, x_min, width, y_min, height)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING annotation_id, img_id, obj_id, project_id, x_min, width, y_min, height, created_at`,
            [img_id, obj_id, project_id, x_min, width, y_min, height]
        );

        const annotation = result.rows[0];

        return res.status(201).json({
            status: true,
            message: 'Annotation created successfully',
            data: {
                annotation
            }
        });

    } catch (error) {
        console.error('Create annotation error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error while creating annotation'
        });
    } finally {
        client.release();
    }
}

/**
 * Get all annotations for an image
 */
async function getImageAnnotations(req, res) {
    const { img_id } = req.params;
    const user_id = req.user.user_id;

    if (!img_id || isNaN(img_id)) {
        return res.status(400).json({
            status: false,
            message: 'Invalid img_id'
        });
    }

    const client = await pool.connect();

    try {
        // Verify user owns the project through the image
        const imageCheck = await client.query(
            `SELECT i.img_id, i.project_id
             FROM images i
             JOIN projects p ON i.project_id = p.project_id
             WHERE i.img_id = $1 AND p.user_id = $2`,
            [img_id, user_id]
        );

        if (imageCheck.rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Image not found or access denied'
            });
        }

        // Get all annotations for the image
        const result = await client.query(
            `SELECT a.annotation_id, a.img_id, a.obj_id, a.project_id,
                    a.x_min, a.width, a.y_min, a.height, a.created_at,
                    o.obj_name
             FROM annotations a
             JOIN objects o ON a.project_id = o.project_id AND a.obj_id = o.obj_id
             WHERE a.img_id = $1
             ORDER BY a.created_at DESC`,
            [img_id]
        );

        return res.status(200).json({
            status: true,
            message: 'Annotations retrieved successfully',
            data: {
                annotations: result.rows,
                count: result.rows.length
            }
        });

    } catch (error) {
        console.error('Get annotations error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error while fetching annotations'
        });
    } finally {
        client.release();
    }
}

/**
 * Get all annotations for a project
 */
async function getProjectAnnotations(req, res) {
    const { project_id } = req.params;
    const user_id = req.user.user_id;

    if (!project_id || isNaN(project_id)) {
        return res.status(400).json({
            status: false,
            message: 'Invalid project_id'
        });
    }

    const client = await pool.connect();

    try {
        // Verify user owns the project
        const projectCheck = await client.query(
            'SELECT project_id FROM projects WHERE project_id = $1 AND user_id = $2',
            [project_id, user_id]
        );

        if (projectCheck.rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Project not found or access denied'
            });
        }

        // Get all annotations for the project
        const result = await client.query(
            `SELECT a.annotation_id, a.img_id, a.obj_id, a.project_id,
                    a.x_min, a.width, a.y_min, a.height, a.created_at,
                    o.obj_name, i.img_url
             FROM annotations a
             JOIN objects o ON a.project_id = o.project_id AND a.obj_id = o.obj_id
             JOIN images i ON a.img_id = i.img_id
             WHERE a.project_id = $1
             ORDER BY a.created_at DESC`,
            [project_id]
        );

        return res.status(200).json({
            status: true,
            message: 'Annotations retrieved successfully',
            data: {
                annotations: result.rows,
                count: result.rows.length
            }
        });

    } catch (error) {
        console.error('Get project annotations error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error while fetching annotations'
        });
    } finally {
        client.release();
    }
}

/**
 * Get single annotation by ID
 */
async function getAnnotationById(req, res) {
    const { annotation_id } = req.params;
    const user_id = req.user.user_id;

    if (!annotation_id || isNaN(annotation_id)) {
        return res.status(400).json({
            status: false,
            message: 'Invalid annotation_id'
        });
    }

    const client = await pool.connect();

    try {
        // Get annotation with project ownership verification
        const result = await client.query(
            `SELECT a.annotation_id, a.img_id, a.obj_id, a.project_id,
                    a.x_min, a.width, a.y_min, a.height, a.created_at,
                    o.obj_name, i.img_url
             FROM annotations a
             JOIN objects o ON a.project_id = o.project_id AND a.obj_id = o.obj_id
             JOIN images i ON a.img_id = i.img_id
             JOIN projects p ON a.project_id = p.project_id
             WHERE a.annotation_id = $1 AND p.user_id = $2`,
            [annotation_id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Annotation not found or access denied'
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Annotation retrieved successfully',
            data: {
                annotation: result.rows[0]
            }
        });

    } catch (error) {
        console.error('Get annotation error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error while fetching annotation'
        });
    } finally {
        client.release();
    }
}

/**
 * Update annotation
 */
async function updateAnnotation(req, res) {
    const { annotation_id } = req.params;
    const { obj_id, x_min, width, y_min, height } = req.body;
    const user_id = req.user.user_id;

    if (!annotation_id || isNaN(annotation_id)) {
        return res.status(400).json({
            status: false,
            message: 'Invalid annotation_id'
        });
    }

    // At least one field must be provided
    if (!obj_id && x_min === undefined && width === undefined &&
        y_min === undefined && height === undefined) {
        return res.status(400).json({
            status: false,
            message: 'At least one field must be provided for update'
        });
    }

    // Validate numeric fields if provided
    if ((x_min !== undefined && isNaN(x_min)) ||
        (width !== undefined && isNaN(width)) ||
        (y_min !== undefined && isNaN(y_min)) ||
        (height !== undefined && isNaN(height))) {
        return res.status(400).json({
            status: false,
            message: 'Invalid numeric values for annotation coordinates'
        });
    }

    // Validate positive dimensions if provided
    if ((width !== undefined && width <= 0) || (height !== undefined && height <= 0)) {
        return res.status(400).json({
            status: false,
            message: 'Width and height must be positive values'
        });
    }

    const client = await pool.connect();

    try {
        // Get current annotation with ownership verification
        const annotationCheck = await client.query(
            `SELECT a.annotation_id, a.project_id, a.obj_id, a.x_min, a.width, a.y_min, a.height
             FROM annotations a
             JOIN projects p ON a.project_id = p.project_id
             WHERE a.annotation_id = $1 AND p.user_id = $2`,
            [annotation_id, user_id]
        );

        if (annotationCheck.rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Annotation not found or access denied'
            });
        }

        const current = annotationCheck.rows[0];

        // If obj_id is being changed, verify it exists in the project
        if (obj_id && obj_id !== current.obj_id) {
            const objectCheck = await client.query(
                'SELECT obj_id FROM objects WHERE project_id = $1 AND obj_id = $2',
                [current.project_id, obj_id]
            );

            if (objectCheck.rows.length === 0) {
                return res.status(404).json({
                    status: false,
                    message: 'Object not found in this project'
                });
            }
        }

        // Build update query dynamically
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (obj_id !== undefined) {
            updates.push(`obj_id = $${paramCount++}`);
            values.push(obj_id);
        }
        if (x_min !== undefined) {
            updates.push(`x_min = $${paramCount++}`);
            values.push(x_min);
        }
        if (width !== undefined) {
            updates.push(`width = $${paramCount++}`);
            values.push(width);
        }
        if (y_min !== undefined) {
            updates.push(`y_min = $${paramCount++}`);
            values.push(y_min);
        }
        if (height !== undefined) {
            updates.push(`height = $${paramCount++}`);
            values.push(height);
        }

        values.push(annotation_id);

        const result = await client.query(
            `UPDATE annotations
             SET ${updates.join(', ')}
             WHERE annotation_id = $${paramCount}
             RETURNING annotation_id, img_id, obj_id, project_id, x_min, width, y_min, height, created_at`,
            values
        );

        return res.status(200).json({
            status: true,
            message: 'Annotation updated successfully',
            data: {
                annotation: result.rows[0]
            }
        });

    } catch (error) {
        console.error('Update annotation error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error while updating annotation'
        });
    } finally {
        client.release();
    }
}

/**
 * Delete annotation
 */
async function deleteAnnotation(req, res) {
    const { annotation_id } = req.params;
    const user_id = req.user.user_id;

    if (!annotation_id || isNaN(annotation_id)) {
        return res.status(400).json({
            status: false,
            message: 'Invalid annotation_id'
        });
    }

    const client = await pool.connect();

    try {
        // Delete annotation with ownership verification
        const result = await client.query(
            `DELETE FROM annotations a
             USING projects p
             WHERE a.project_id = p.project_id
             AND a.annotation_id = $1
             AND p.user_id = $2
             RETURNING a.annotation_id`,
            [annotation_id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Annotation not found or access denied'
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Annotation deleted successfully',
            data: {
                annotation_id: result.rows[0].annotation_id
            }
        });

    } catch (error) {
        console.error('Delete annotation error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error while deleting annotation'
        });
    } finally {
        client.release();
    }
}

/**
 * Delete all annotations for an image
 */
async function deleteImageAnnotations(req, res) {
    const { img_id } = req.params;
    const user_id = req.user.user_id;

    if (!img_id || isNaN(img_id)) {
        return res.status(400).json({
            status: false,
            message: 'Invalid img_id'
        });
    }

    const client = await pool.connect();

    try {
        // Delete all annotations for the image with ownership verification
        const result = await client.query(
            `DELETE FROM annotations a
             USING images i, projects p
             WHERE a.img_id = i.img_id
             AND i.project_id = p.project_id
             AND a.img_id = $1
             AND p.user_id = $2
             RETURNING a.annotation_id`,
            [img_id, user_id]
        );

        return res.status(200).json({
            status: true,
            message: `${result.rows.length} annotation(s) deleted successfully`,
            data: {
                count: result.rows.length
            }
        });

    } catch (error) {
        console.error('Delete image annotations error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error while deleting annotations'
        });
    } finally {
        client.release();
    }
}

module.exports = {
    createAnnotation,
    getImageAnnotations,
    getProjectAnnotations,
    getAnnotationById,
    updateAnnotation,
    deleteAnnotation,
    deleteImageAnnotations
};
