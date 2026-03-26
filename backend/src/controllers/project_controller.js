const pool = require('../util/db');

/**
 * Create a new project for authenticated user
 */
async function createProject(req, res) {
    const { project_name } = req.body;
    const user_id = req.user.user_id; // From auth middleware

    // Validate input
    if (!project_name) {
        return res.status(400).json({
            status: false,
            message: 'Missing required field: project_name'
        });
    }

    // Validate project name length
    if (project_name.trim().length === 0) {
        return res.status(400).json({
            status: false,
            message: 'Project name cannot be empty'
        });
    }

    const client = await pool.connect();

    try {
        // Insert new project
        const result = await client.query(
            `INSERT INTO projects (user_id, project_name)
             VALUES ($1, $2)
             RETURNING project_id, user_id, project_name, created_at, updated_at`,
            [user_id, project_name]
        );

        const project = result.rows[0];

        return res.status(201).json({
            status: true,
            message: 'Project created successfully',
            data: {
                project
            }
        });

    } catch (error) {
        console.error('Create project error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error while creating project'
        });
    } finally {
        client.release();
    }
}

/**
 * Get all projects for authenticated user
 */
async function getUserProjects(req, res) {
    const user_id = req.user.user_id;

    const client = await pool.connect();

    try {
        const result = await client.query(
            `SELECT project_id, user_id, project_name, created_at, updated_at
             FROM projects
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [user_id]
        );

        return res.status(200).json({
            status: true,
            message: 'Projects retrieved successfully',
            data: {
                projects: result.rows,
                count: result.rows.length
            }
        });

    } catch (error) {
        console.error('Get projects error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error while fetching projects'
        });
    } finally {
        client.release();
    }
}

/**
 * Get single project by ID (only if user owns it)
 */
async function getProjectById(req, res) {
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
        const result = await client.query(
            `SELECT project_id, user_id, project_name, created_at, updated_at
             FROM projects
             WHERE project_id = $1 AND user_id = $2`,
            [project_id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Project not found or access denied'
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Project retrieved successfully',
            data: {
                project: result.rows[0]
            }
        });

    } catch (error) {
        console.error('Get project error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error while fetching project'
        });
    } finally {
        client.release();
    }
}

/**
 * Update project name
 */
async function updateProject(req, res) {
    const { project_id } = req.params;
    const { project_name } = req.body;
    const user_id = req.user.user_id;

    if (!project_id || isNaN(project_id)) {
        return res.status(400).json({
            status: false,
            message: 'Invalid project_id'
        });
    }

    if (!project_name || project_name.trim().length === 0) {
        return res.status(400).json({
            status: false,
            message: 'Project name is required and cannot be empty'
        });
    }

    const client = await pool.connect();

    try {
        // Update project (only if user owns it)
        const result = await client.query(
            `UPDATE projects
             SET project_name = $1, updated_at = CURRENT_TIMESTAMP
             WHERE project_id = $2 AND user_id = $3
             RETURNING project_id, user_id, project_name, created_at, updated_at`,
            [project_name, project_id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Project not found or access denied'
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Project updated successfully',
            data: {
                project: result.rows[0]
            }
        });

    } catch (error) {
        console.error('Update project error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error while updating project'
        });
    } finally {
        client.release();
    }
}

/**
 * Delete project
 */
async function deleteProject(req, res) {
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
        // Delete project (only if user owns it)
        const result = await client.query(
            `DELETE FROM projects
             WHERE project_id = $1 AND user_id = $2
             RETURNING project_id`,
            [project_id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Project not found or access denied'
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Project deleted successfully',
            data: {
                project_id: result.rows[0].project_id
            }
        });

    } catch (error) {
        console.error('Delete project error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error while deleting project'
        });
    } finally {
        client.release();
    }
}

module.exports = {
    createProject,
    getUserProjects,
    getProjectById,
    updateProject,
    deleteProject
};
