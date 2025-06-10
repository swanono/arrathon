-- ============================================
-- ARRATHON DATABASE SCHEMA
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    family_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Arrathons (events) table
CREATE TABLE IF NOT EXISTS arrathons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User-arrathon relationship table (with role)
CREATE TABLE IF NOT EXISTS user_arrathon (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    arrathon_id INTEGER REFERENCES arrathons(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('participant', 'organisator')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, arrathon_id)
);

-- Location-user relationship table
CREATE TABLE IF NOT EXISTS location_user (
    location_id INTEGER REFERENCES locations(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (location_id, user_id)
);

-- Arrathon stages (location + order + type)
CREATE TABLE IF NOT EXISTS arrathon_location (
    id SERIAL PRIMARY KEY,
    arrathon_id INTEGER REFERENCES arrathons(id) ON DELETE CASCADE,
    location_id INTEGER REFERENCES locations(id) ON DELETE CASCADE,
    order_position INTEGER NOT NULL,
    duration INTEGER, -- in minutes
    type VARCHAR(20) NOT NULL CHECK (type IN ('apartment', 'bar', 'monument', 'aid_station', 'other')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(arrathon_id, order_position), -- No two stages with same order
    UNIQUE(arrathon_id, location_id) -- No same location twice in one arrathon
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Indexes on frequently searched columns
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_family_name ON users(family_name);
CREATE INDEX IF NOT EXISTS idx_arrathons_date ON arrathons(date);
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);

-- Indexes on foreign keys for joins
CREATE INDEX IF NOT EXISTS idx_user_arrathon_user_id ON user_arrathon(user_id);
CREATE INDEX IF NOT EXISTS idx_user_arrathon_arrathon_id ON user_arrathon(arrathon_id);
CREATE INDEX IF NOT EXISTS idx_location_user_location_id ON location_user(location_id);
CREATE INDEX IF NOT EXISTS idx_location_user_user_id ON location_user(user_id);
CREATE INDEX IF NOT EXISTS idx_arrathon_location_arrathon_id ON arrathon_location(arrathon_id);
CREATE INDEX IF NOT EXISTS idx_arrathon_location_order ON arrathon_location(arrathon_id, order_position);

-- Composite indexes for frequent queries
CREATE INDEX IF NOT EXISTS idx_users_name_family ON users(name, family_name);

-- ============================================
-- TEST DATA (OPTIONAL)
-- ============================================

-- Test users
INSERT INTO users (name, family_name, username, date_of_birth) VALUES
('Jean', 'Dupont', 'jean.dupont', '1990-05-15'),
('Marie', 'Martin', 'marie.martin', '1985-08-22'),
('Pierre', 'Durand', 'pierre.durand', '1992-03-10'),
('Sophie', 'Bernard', 'sophie.bernard', '1988-11-07')
ON CONFLICT (username) DO NOTHING;

-- Test locations
INSERT INTO locations (name, address, metadata) VALUES
('Bar Le Central', '15 rue de la Paix, Paris', '{"capacity": 50, "phone": "0123456789"}'),
('Monument Colonne', 'Place Vendôme, Paris', '{"historical_year": 1810, "height": "44m"}'),
('Appartement Sophie', '12 avenue des Champs, Paris', '{"floor": 3, "code": "1234"}'),
('Station Hydratation', 'Parc Monceau, Paris', '{"water": true, "snacks": true}')
ON CONFLICT DO NOTHING;

-- Test arrathon
INSERT INTO arrathons (name, date, start_time, metadata) VALUES
('Paris Night Run 2024', '2024-12-31', '20:00:00', '{"distance": "10km", "theme": "nouvelle_annee", "max_participants": 100}')
ON CONFLICT DO NOTHING;

-- Test relationships
INSERT INTO user_arrathon (user_id, arrathon_id, role) VALUES
(1, 1, 'organisator'),
(2, 1, 'participant'),
(3, 1, 'participant'),
(4, 1, 'participant')
ON CONFLICT DO NOTHING;

-- Arrathon stages
INSERT INTO arrathon_location (arrathon_id, location_id, order_position, duration, type) VALUES
(1, 1, 1, 30, 'bar'),
(1, 2, 2, 15, 'monument'),
(1, 3, 3, 45, 'apartment'),
(1, 4, 4, 10, 'aid_station')
ON CONFLICT DO NOTHING;