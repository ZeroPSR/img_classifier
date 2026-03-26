const pool = require('../util/db');
const archiver = require('archiver');
const path = require('path');

/**
 * Export project annotations as CSV and classes.txt in a zip file
 */
async function exportProject(req, res) {
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
            'SELECT project_id, project_name FROM projects WHERE project_id = $1 AND user_id = $2',
            [project_id, user_id]
        );

        if (projectCheck.rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Project not found or access denied'
            });
        }

        const projectName = projectCheck.rows[0].project_name;

        // Get all objects for classes.txt
        const objectsResult = await client.query(
            `SELECT obj_id, obj_name
             FROM objects
             WHERE project_id = $1
             ORDER BY obj_id`,
            [project_id]
        );

        // Get all annotations with image and object data
        const annotationsResult = await client.query(
            `SELECT
                a.annotation_id,
                a.img_id,
                i.img_url,
                a.obj_id,
                a.x_min,
                a.width,
                a.y_min,
                a.height
             FROM annotations a
             JOIN images i ON a.img_id = i.img_id
             WHERE a.project_id = $1
             ORDER BY i.img_url, a.annotation_id`,
            [project_id]
        );

        // Calculate obj_count for each image
        const imageAnnotationCounts = {};
        annotationsResult.rows.forEach(row => {
            if (!imageAnnotationCounts[row.img_id]) {
                imageAnnotationCounts[row.img_id] = 0;
            }
            imageAnnotationCounts[row.img_id]++;
        });

        // Generate classes.txt content
        let classesTxt = '';
        objectsResult.rows.forEach(obj => {
            classesTxt += `${obj.obj_id} : ${obj.obj_name}\n`;
        });

        // Generate CSV content
        let csvContent = 'img_name,obj_id,obj_count,x_min,width,y_min,height\n';
        annotationsResult.rows.forEach(row => {
            const imgName = path.basename(row.img_url);
            const objCount = imageAnnotationCounts[row.img_id];
            csvContent += `${imgName},${row.obj_id},${objCount},${row.x_min},${row.width},${row.y_min},${row.height}\n`;
        });

        // Create zip archive
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${projectName}_export.zip"`);

        // Pipe archive to response
        archive.pipe(res);

        // Add files to archive
        archive.append(csvContent, { name: 'annotations.csv' });
        archive.append(classesTxt, { name: 'classes.txt' });

        // Finalize archive
        await archive.finalize();

    } catch (error) {
        console.error('Export project error:', error);

        // If headers not sent yet, send error response
        if (!res.headersSent) {
            return res.status(500).json({
                status: false,
                message: 'Internal server error while exporting project'
            });
        }
    } finally {
        client.release();
    }
}

module.exports = {
    exportProject
};
