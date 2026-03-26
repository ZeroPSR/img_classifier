const pool = require('../util/db');

/**
 * Create a new object in a project
 */
async function createObject(req, res) {
    const { project_id } = req.params;
    const { obj_id, obj_name } = req.body;
    const user_id = req.user.user_id;

    // Validate project_id
    if (!project_id || isNaN(project_id)) {
        return res.status(400).json({
            status: false,
            message: 'Invalid project_id'
        });
    }

    // Validate input
    if (obj_id === undefined || !obj_name) {
        return res.status(400).json({
            status: false,
            message: 'Missing required fields: obj_id, obj_name'
        });
    }

    // Validate obj_id is numeric
    if (isNaN(obj_id) || !Number.isInteger(Number(obj_id))) {
        return res.status(400).json({
            status: false,
            message: 'obj_id must be an integer'
        });
    }

    // Validate obj_name is not empty
    if (obj_name.trim().length === 0) {
        return res.status(400).json({
            status: false,
            message: 'obj_name cannot be empty'
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

        // Check if object with same obj_id already exists in this project
        const objectCheck = await client.query(
            'SELECT obj_id FROM objects WHERE project_id = $1 AND obj_id = $2',
            [project_id, obj_id]
        );

        if (objectCheck.rows.length > 0) {
            return res.status(409).json({
                status: false,
                message: 'Object with this obj_id already exists in the project'
            });
        }

        // Insert new object
        const result = await client.query(
            `INSERT INTO objects (project_id, obj_id, obj_name)
             VALUES ($1, $2, $3)
             RETURNING project_id, obj_id, obj_name, created_at`,
            [project_id, obj_id, obj_name]
        );

        const object = result.rows[0];

        return res.status(201).json({
            status: true,
            message: 'Object created successfully',
            data: {
                object
            }
        });

    } catch (error) {
        console.error('Create object error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error while creating object'
        });
    } finally {
        client.release();
    }
}

/**
 * Get all objects for a project
 */
async function getProjectObjects(req, res) {
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

        // Get all objects for the project
        const result = await client.query(
            `SELECT project_id, obj_id, obj_name, created_at
             FROM objects
             WHERE project_id = $1
             ORDER BY created_at DESC`,
            [project_id]
        );

        return res.status(200).json({
            status: true,
            message: 'Objects retrieved successfully',
            data: {
                objects: result.rows,
                count: result.rows.length
            }
        });

    } catch (error) {
        console.error('Get objects error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error while fetching objects'
        });
    } finally {
        client.release();
    }
}

/**
 * Get single object by ID
 */
async function getObjectById(req, res) {
    const { project_id, obj_id } = req.params;
    const user_id = req.user.user_id;

    if (!project_id || isNaN(project_id)) {
        return res.status(400).json({
            status: false,
            message: 'Invalid project_id'
        });
    }

    if (!obj_id || isNaN(obj_id)) {
        return res.status(400).json({
            status: false,
            message: 'Invalid obj_id'
        });
    }

    const client = await pool.connect();

    try {
        // Get object with project ownership verification
        const result = await client.query(
            `SELECT o.project_id, o.obj_id, o.obj_name, o.created_at
             FROM objects o
             JOIN projects p ON o.project_id = p.project_id
             WHERE o.project_id = $1 AND o.obj_id = $2 AND p.user_id = $3`,
            [project_id, obj_id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Object not found or access denied'
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Object retrieved successfully',
            data: {
                object: result.rows[0]
            }
        });

    } catch (error) {
        console.error('Get object error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error while fetching object'
        });
    } finally {
        client.release();
    }
}

/**
 * Update object name
 */
async function updateObject(req, res) {
    const { project_id, obj_id } = req.params;
    const { obj_name } = req.body;
    const user_id = req.user.user_id;

    if (!project_id || isNaN(project_id)) {
        return res.status(400).json({
            status: false,
            message: 'Invalid project_id'
        });
    }

    if (!obj_id || isNaN(obj_id)) {
        return res.status(400).json({
            status: false,
            message: 'Invalid obj_id'
        });
    }

    if (!obj_name || obj_name.trim().length === 0) {
        return res.status(400).json({
            status: false,
            message: 'obj_name is required and cannot be empty'
        });
    }

    const client = await pool.connect();

    try {
        // Update object with project ownership verification
        const result = await client.query(
            `UPDATE objects o
             SET obj_name = $1
             FROM projects p
             WHERE o.project_id = p.project_id
             AND o.project_id = $2
             AND o.obj_id = $3
             AND p.user_id = $4
             RETURNING o.project_id, o.obj_id, o.obj_name, o.created_at`,
            [obj_name, project_id, obj_id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Object not found or access denied'
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Object updated successfully',
            data: {
                object: result.rows[0]
            }
        });

    } catch (error) {
        console.error('Update object error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error while updating object'
        });
    } finally {
        client.release();
    }
}

/**
 * Delete object
 */
async function deleteObject(req, res) {
    const { project_id, obj_id } = req.params;
    const user_id = req.user.user_id;

    if (!project_id || isNaN(project_id)) {
        return res.status(400).json({
            status: false,
            message: 'Invalid project_id'
        });
    }

    if (!obj_id || isNaN(obj_id)) {
        return res.status(400).json({
            status: false,
            message: 'Invalid obj_id'
        });
    }

    const client = await pool.connect();

    try {
        // Verify user owns the project and delete object
        const result = await client.query(
            `DELETE FROM objects o
             USING projects p
             WHERE o.project_id = p.project_id
             AND o.project_id = $1
             AND o.obj_id = $2
             AND p.user_id = $3
             RETURNING o.project_id, o.obj_id`,
            [project_id, obj_id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Object not found or access denied'
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Object deleted successfully',
            data: {
                project_id: result.rows[0].project_id,
                obj_id: result.rows[0].obj_id
            }
        });

    } catch (error) {
        console.error('Delete object error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error while deleting object'
        });
    } finally {
        client.release();
    }
}

module.exports = {
    createObject,
    getProjectObjects,
    getObjectById,
    updateObject,
    deleteObject
};
