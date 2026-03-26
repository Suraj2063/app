-- ============================================================
-- TableEase - Seed Data for Development/Testing ONLY
-- ============================================================
-- WARNING: This file is for DEVELOPMENT and TESTING purposes only.
-- DO NOT use this seed data in production environments.
-- All demo passwords are "password123" - change them before any real deployment.
-- NOTE: Replace UUIDs and password hashes with actual values for your environment.

-- ============================================================
-- SEED USERS
-- ============================================================
INSERT INTO users (id, email, full_name, phone, password_hash, role) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'admin@example.com',
    'Admin User',
    '+1-555-000-0001',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewm.C6VwA3bFQTxS',  -- admin123
    'admin'
),
(
    '00000000-0000-0000-0000-000000000002',
    'owner@example.com',
    'Restaurant Owner',
    '+1-555-000-0002',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewm.C6VwA3bFQTxS',
    'restaurant_owner'
),
(
    '00000000-0000-0000-0000-000000000003',
    'john@example.com',
    'John Doe',
    '+1-555-000-0003',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewm.C6VwA3bFQTxS',
    'customer'
),
(
    '00000000-0000-0000-0000-000000000004',
    'jane@example.com',
    'Jane Smith',
    '+1-555-000-0004',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewm.C6VwA3bFQTxS',
    'customer'
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- SEED RESTAURANTS
-- ============================================================
INSERT INTO restaurants (id, owner_id, name, description, cuisine_type, address, city, state, zip_code, phone, email, opening_time, closing_time, days_open, price_range, rating, review_count, is_active, image_url) VALUES
(
    'r0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'Bella Italia',
    'Authentic Italian cuisine in the heart of the city. Family recipes passed down through generations featuring fresh pasta, wood-fired pizzas, and an extensive wine selection.',
    'Italian',
    '123 Main Street',
    'San Francisco',
    'CA',
    '94102',
    '+1-415-555-1001',
    'info@bellaitalia.com',
    '11:00',
    '22:00',
    ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    3,
    4.7,
    124,
    TRUE,
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80'
),
(
    'r0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'Sakura Garden',
    'A serene Japanese dining experience featuring traditional sushi, sashimi, ramen, and seasonal omakase menus prepared by master chefs.',
    'Japanese',
    '456 Cherry Blossom Ave',
    'San Francisco',
    'CA',
    '94103',
    '+1-415-555-1002',
    'info@sakuragarden.com',
    '12:00',
    '21:30',
    ARRAY['Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    4,
    4.9,
    89,
    TRUE,
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80'
),
(
    'r0000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    'El Rancho Mexicano',
    'Vibrant Mexican flavors with authentic tacos, enchiladas, margaritas, and a lively atmosphere perfect for groups and celebrations.',
    'Mexican',
    '789 Salsa Street',
    'Los Angeles',
    'CA',
    '90001',
    '+1-213-555-1003',
    'hola@elrancho.com',
    '11:00',
    '23:00',
    ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    2,
    4.3,
    67,
    TRUE,
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80'
),
(
    'r0000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000002',
    'The Spice Route',
    'A culinary journey through Northern and Southern Indian cuisine. From creamy butter chicken to spicy vindaloo, our expert chefs create an unforgettable dining experience.',
    'Indian',
    '321 Curry Lane',
    'New York',
    'NY',
    '10001',
    '+1-212-555-1004',
    'spice@thespiceroute.com',
    '12:00',
    '22:30',
    ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    2,
    4.6,
    201,
    TRUE,
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80'
),
(
    'r0000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000002',
    'Le Petit Bistro',
    'Classic French cuisine in an intimate Parisian setting. Enjoy escargot, coq au vin, crème brûlée, and an expertly curated French wine list.',
    'French',
    '159 Eiffel Boulevard',
    'Chicago',
    'IL',
    '60601',
    '+1-312-555-1005',
    'bonjour@lepetitbistro.com',
    '17:00',
    '23:00',
    ARRAY['Wednesday','Thursday','Friday','Saturday','Sunday'],
    4,
    4.8,
    156,
    TRUE,
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80'
),
(
    'r0000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000002',
    'Golden Dragon',
    'Traditional Chinese cuisine featuring dim sum, Peking duck, hand-pulled noodles, and authentic regional dishes from across China.',
    'Chinese',
    '88 Dragon Street',
    'San Francisco',
    'CA',
    '94108',
    '+1-415-555-1006',
    'info@goldendragon.com',
    '10:00',
    '22:00',
    ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    2,
    4.4,
    93,
    TRUE,
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED TABLES
-- ============================================================
INSERT INTO tables (restaurant_id, table_number, capacity, location, status) VALUES
-- Bella Italia
('r0000000-0000-0000-0000-000000000001', 'T1', 2, 'indoor', 'available'),
('r0000000-0000-0000-0000-000000000001', 'T2', 4, 'indoor', 'available'),
('r0000000-0000-0000-0000-000000000001', 'T3', 4, 'indoor', 'available'),
('r0000000-0000-0000-0000-000000000001', 'T4', 6, 'outdoor', 'available'),
('r0000000-0000-0000-0000-000000000001', 'T5', 8, 'private', 'available'),
('r0000000-0000-0000-0000-000000000001', 'T6', 2, 'bar', 'available'),
-- Sakura Garden
('r0000000-0000-0000-0000-000000000002', 'S1', 2, 'indoor', 'available'),
('r0000000-0000-0000-0000-000000000002', 'S2', 2, 'indoor', 'available'),
('r0000000-0000-0000-0000-000000000002', 'S3', 4, 'indoor', 'available'),
('r0000000-0000-0000-0000-000000000002', 'S4', 4, 'outdoor', 'available'),
('r0000000-0000-0000-0000-000000000002', 'S5', 8, 'private', 'available'),
-- El Rancho
('r0000000-0000-0000-0000-000000000003', 'M1', 4, 'indoor', 'available'),
('r0000000-0000-0000-0000-000000000003', 'M2', 4, 'outdoor', 'available'),
('r0000000-0000-0000-0000-000000000003', 'M3', 6, 'indoor', 'available'),
('r0000000-0000-0000-0000-000000000003', 'M4', 10, 'outdoor', 'available'),
-- The Spice Route
('r0000000-0000-0000-0000-000000000004', 'I1', 2, 'indoor', 'available'),
('r0000000-0000-0000-0000-000000000004', 'I2', 4, 'indoor', 'available'),
('r0000000-0000-0000-0000-000000000004', 'I3', 6, 'indoor', 'available'),
('r0000000-0000-0000-0000-000000000004', 'I4', 8, 'private', 'available'),
-- Le Petit Bistro
('r0000000-0000-0000-0000-000000000005', 'F1', 2, 'indoor', 'available'),
('r0000000-0000-0000-0000-000000000005', 'F2', 2, 'indoor', 'available'),
('r0000000-0000-0000-0000-000000000005', 'F3', 4, 'indoor', 'available'),
('r0000000-0000-0000-0000-000000000005', 'F4', 6, 'private', 'available'),
-- Golden Dragon
('r0000000-0000-0000-0000-000000000006', 'C1', 4, 'indoor', 'available'),
('r0000000-0000-0000-0000-000000000006', 'C2', 6, 'indoor', 'available'),
('r0000000-0000-0000-0000-000000000006', 'C3', 8, 'indoor', 'available'),
('r0000000-0000-0000-0000-000000000006', 'C4', 10, 'private', 'available')
ON CONFLICT (restaurant_id, table_number) DO NOTHING;

-- ============================================================
-- SEED REVIEWS
-- ============================================================
INSERT INTO reviews (user_id, restaurant_id, rating, comment) VALUES
('00000000-0000-0000-0000-000000000003', 'r0000000-0000-0000-0000-000000000001', 5, 'Absolutely incredible pasta! The carbonara was the best I''ve ever had. Will definitely be back.'),
('00000000-0000-0000-0000-000000000004', 'r0000000-0000-0000-0000-000000000001', 4, 'Great food and ambiance. Service was a bit slow but worth the wait.'),
('00000000-0000-0000-0000-000000000003', 'r0000000-0000-0000-0000-000000000002', 5, 'The omakase was a transcendent experience. Every piece of sushi was perfect.'),
('00000000-0000-0000-0000-000000000004', 'r0000000-0000-0000-0000-000000000004', 5, 'Best Indian food outside of India! The butter chicken was heavenly.')
ON CONFLICT (user_id, restaurant_id) DO NOTHING;
