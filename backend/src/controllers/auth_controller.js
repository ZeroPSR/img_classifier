const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../util/db');

const SALT_ROUNDS = 10;

/**
 * Register a new user
 */
async function register(req, res) {
    const { user_name, user_email, password } = req.body;

    // Validate input
    if (!user_name || !user_email || !password) {
        return res.status(400).json({
            status: false,
            message: 'Missing required fields: user_name, user_email, password'
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user_email)) {
        return res.status(400).json({
            status: false,
            message: 'Invalid email format'
        });
    }

    // Validate password length
    if (password.length < 6) {
        return res.status(400).json({
            status: false,
            message: 'Password must be at least 6 characters long'
        });
    }

    const client = await pool.connect();

    try {
        // Check if user already exists
        const userCheck = await client.query(
            'SELECT user_id FROM users WHERE user_email = $1',
            [user_email]
        );

        if (userCheck.rows.length > 0) {
            return res.status(409).json({
                status: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Insert new user
        const result = await client.query(
            `INSERT INTO users (user_name, user_email, password)
             VALUES ($1, $2, $3)
             RETURNING user_id, user_name, user_email, created_at`,
            [user_name, user_email, hashedPassword]
        );

        const user = result.rows[0];

        // Generate JWT token
        const token = jwt.sign(
            { user_id: user.user_id, user_email: user.user_email },
            process.env.SECRET,
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            status: true,
            message: 'User registered successfully',
            data: {
                user: {
                    user_id: user.user_id,
                    user_name: user.user_name,
                    user_email: user.user_email,
                    created_at: user.created_at
                },
                token
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error during registration'
        });
    } finally {
        client.release();
    }
}

/**
 * Login user
 */
async function login(req, res) {
    const { user_email, password } = req.body;

    // Validate input
    if (!user_email || !password) {
        return res.status(400).json({
            status: false,
            message: 'Missing required fields: user_email, password'
        });
    }

    const client = await pool.connect();

    try {
        // Find user by email
        const result = await client.query(
            'SELECT user_id, user_name, user_email, password, created_at FROM users WHERE user_email = $1',
            [user_email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                status: false,
                message: 'Invalid email or password'
            });
        }

        const user = result.rows[0];

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                status: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { user_id: user.user_id, user_email: user.user_email },
            process.env.SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            status: true,
            message: 'Login successful',
            data: {
                user: {
                    user_id: user.user_id,
                    user_name: user.user_name,
                    user_email: user.user_email,
                    created_at: user.created_at
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error during login'
        });
    } finally {
        client.release();
    }
}

module.exports = {
    register,
    login
};
