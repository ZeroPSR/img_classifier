const pool = require('../util/db');
const path = require('path');
const fs = require('fs');

/**
 * Upload single or multiple images to a project
 */
async function uploadImages(req, res) {
    const { project_id } = req.params;
    const user_id = req.user.user_id;
    const files = req.files;

    // Validate project_id
    if (!project_id || isNaN(project_id)) {
        return res.status(400).json({
            status: false,
            message: 'Invalid project_id'
        });
    }

    // Check if files were uploaded
    if (!files || files.length === 0) {
        return res.status(400).json({
            status: false,
            message: 'No images uploaded'
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
            // Delete uploaded files if project doesn't exist or user doesn't own it
            files.forEach(file => {
                fs.unlinkSync(file.path);
            });

            return res.status(404).json({
                status: false,
                message: 'Project not found or access denied'
            });
        }

        // Insert all images into database
        const insertPromises = files.map(file => {
            // Generate URL path for accessing the image
            const imgUrl = `/uploads/images/${file.filename}`;

            return client.query(
                `INSERT INTO images (img_url, project_id)
                 VALUES ($1, $2)
                 RETURNING img_id, img_url, project_id, created_at`,
                [imgUrl, project_id]
            );
        });

        const results = await Promise.all(insertPromises);
        const images = results.map(result => result.rows[0]);

        return res.status(201).json({
            status: true,
            message: `${images.length} image(s) uploaded successfully`,
            data: {
                images,
                count: images.length
            }
        });

    } catch (error) {
        console.error('Upload images error:', error);

        // Delete uploaded files on error
        files.forEach(file => {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        });

        return res.status(500).json({
            status: false,
            message: 'Internal server error while uploading images'
        });
    } finally {
        client.release();
    }
}

/**
 * Get all images for a project
 */
async function getProjectImages(req, res) {
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

        // Get all images for the project
        const result = await client.query(
            `SELECT img_id, img_url, project_id, created_at
             FROM images
             WHERE project_id = $1
             ORDER BY created_at DESC`,
            [project_id]
        );

        return res.status(200).json({
            status: true,
            message: 'Images retrieved successfully',
            data: {
                images: result.rows,
                count: result.rows.length
            }
        });

    } catch (error) {
        console.error('Get images error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error while fetching images'
        });
    } finally {
        client.release();
    }
}

/**
 * Get single image by ID
 */
async function getImageById(req, res) {
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
        // Get image with project ownership verification
        const result = await client.query(
            `SELECT i.img_id, i.img_url, i.project_id, i.created_at
             FROM images i
             JOIN projects p ON i.project_id = p.project_id
             WHERE i.img_id = $1 AND p.user_id = $2`,
            [img_id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Image not found or access denied'
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Image retrieved successfully',
            data: {
                image: result.rows[0]
            }
        });

    } catch (error) {
        console.error('Get image error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error while fetching image'
        });
    } finally {
        client.release();
    }
}

/**
 * Delete image by ID
 */
async function deleteImage(req, res) {
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
        // Get image with project ownership verification
        const imageResult = await client.query(
            `SELECT i.img_id, i.img_url
             FROM images i
             JOIN projects p ON i.project_id = p.project_id
             WHERE i.img_id = $1 AND p.user_id = $2`,
            [img_id, user_id]
        );

        if (imageResult.rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Image not found or access denied'
            });
        }

        const image = imageResult.rows[0];

        // Delete from database
        await client.query('DELETE FROM images WHERE img_id = $1', [img_id]);

        // Delete physical file
        const filePath = path.join(__dirname, '../../', image.img_url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return res.status(200).json({
            status: true,
            message: 'Image deleted successfully',
            data: {
                img_id: image.img_id
            }
        });

    } catch (error) {
        console.error('Delete image error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error while deleting image'
        });
    } finally {
        client.release();
    }
}

module.exports = {
    uploadImages,
    getProjectImages,
    getImageById,
    deleteImage
};
