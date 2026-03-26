-- Migration 001: Initial Schema
-- Creates tables for user management, projects, images, objects, and annotations

-- Migrations tracking table (must be first)
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(user_email);

-- Project table
CREATE TABLE IF NOT EXISTS projects (
    project_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_projects_user_id ON projects(user_id);

-- Image table
CREATE TABLE IF NOT EXISTS images (
    img_id SERIAL PRIMARY KEY,
    img_url TEXT NOT NULL,
    project_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
);

CREATE INDEX idx_images_project_id ON images(project_id);

-- Object table (composite primary key: project_id + obj_id)
CREATE TABLE IF NOT EXISTS objects (
    project_id INTEGER NOT NULL,
    obj_id INTEGER NOT NULL,
    obj_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, obj_id),
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
);

-- Annotations table
CREATE TABLE IF NOT EXISTS annotations (
    annotation_id SERIAL PRIMARY KEY,
    img_id INTEGER NOT NULL,
    obj_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    x_min DECIMAL(10, 2) NOT NULL,
    width DECIMAL(10, 2) NOT NULL,
    y_min DECIMAL(10, 2) NOT NULL,
    height DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (img_id) REFERENCES images(img_id) ON DELETE CASCADE,
    FOREIGN KEY (project_id, obj_id) REFERENCES objects(project_id, obj_id) ON DELETE CASCADE
);

CREATE INDEX idx_annotations_img_id ON annotations(img_id);
CREATE INDEX idx_annotations_obj_id ON annotations(project_id, obj_id);
