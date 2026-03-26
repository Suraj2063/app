-- ============================================================
-- TableEase - Complete Supabase/PostgreSQL Database Schema
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       TEXT UNIQUE NOT NULL,
    full_name   TEXT NOT NULL,
    phone       TEXT,
    password_hash TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'customer'
                    CHECK (role IN ('customer', 'admin', 'restaurant_owner')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================================
-- RESTAURANTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS restaurants (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id        UUID REFERENCES users(id) ON DELETE SET NULL,
    name            TEXT NOT NULL,
    description     TEXT NOT NULL,
    cuisine_type    TEXT NOT NULL,
    address         TEXT NOT NULL,
    city            TEXT NOT NULL,
    state           TEXT NOT NULL,
    zip_code        TEXT NOT NULL,
    country         TEXT NOT NULL DEFAULT 'US',
    phone           TEXT NOT NULL,
    email           TEXT NOT NULL,
    website         TEXT,
    image_url       TEXT,
    opening_time    TEXT NOT NULL,
    closing_time    TEXT NOT NULL,
    days_open       TEXT[] NOT NULL DEFAULT ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    price_range     SMALLINT NOT NULL CHECK (price_range BETWEEN 1 AND 4),
    rating          NUMERIC(3,2) NOT NULL DEFAULT 0.00,
    review_count    INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restaurants_city ON restaurants(city);
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine ON restaurants(cuisine_type);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON restaurants(rating DESC);
CREATE INDEX IF NOT EXISTS idx_restaurants_active ON restaurants(is_active);
CREATE INDEX IF NOT EXISTS idx_restaurants_search ON restaurants
    USING gin(to_tsvector('english', name || ' ' || description || ' ' || cuisine_type || ' ' || city));

-- ============================================================
-- TABLES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS tables (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_number    TEXT NOT NULL,
    capacity        INTEGER NOT NULL CHECK (capacity >= 1),
    min_capacity    INTEGER DEFAULT 1,
    location        TEXT NOT NULL DEFAULT 'indoor'
                        CHECK (location IN ('indoor', 'outdoor', 'bar', 'private')),
    status          TEXT NOT NULL DEFAULT 'available'
                        CHECK (status IN ('available', 'occupied', 'reserved', 'maintenance')),
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (restaurant_id, table_number)
);

CREATE INDEX IF NOT EXISTS idx_tables_restaurant ON tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tables_status ON tables(status);
CREATE INDEX IF NOT EXISTS idx_tables_capacity ON tables(capacity);

-- ============================================================
-- BOOKINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id       UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id            UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    booking_date        DATE NOT NULL,
    booking_time        TIME NOT NULL,
    party_size          INTEGER NOT NULL CHECK (party_size >= 1 AND party_size <= 20),
    status              TEXT NOT NULL DEFAULT 'confirmed'
                            CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    special_requests    TEXT,
    confirmation_code   TEXT UNIQUE NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_restaurant ON bookings(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_bookings_table ON bookings(table_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_confirmation ON bookings(confirmation_code);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(restaurant_id, booking_date, booking_time);

-- Prevent double-booking: same table, same date, same time, active bookings
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_no_double_book
    ON bookings(table_id, booking_date, booking_time)
    WHERE status IN ('pending', 'confirmed');

-- ============================================================
-- REVIEWS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    booking_id      UUID REFERENCES bookings(id) ON DELETE SET NULL,
    rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, restaurant_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- ============================================================
-- ADMIN LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action          TEXT NOT NULL,
    resource_type   TEXT NOT NULL,
    resource_id     TEXT NOT NULL,
    details         JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_resource ON admin_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_logs(created_at DESC);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON tables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Users Policies
CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (auth.uid()::TEXT = id::TEXT);

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (auth.uid()::TEXT = id::TEXT);

CREATE POLICY "Admins can view all users"
    ON users FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM users WHERE id::TEXT = auth.uid()::TEXT AND role = 'admin')
    );

-- Restaurants Policies
CREATE POLICY "Anyone can view active restaurants"
    ON restaurants FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Owners can manage their restaurants"
    ON restaurants FOR ALL
    USING (owner_id::TEXT = auth.uid()::TEXT);

CREATE POLICY "Admins can manage all restaurants"
    ON restaurants FOR ALL
    USING (
        EXISTS (SELECT 1 FROM users WHERE id::TEXT = auth.uid()::TEXT AND role = 'admin')
    );

-- Tables Policies
CREATE POLICY "Anyone can view tables of active restaurants"
    ON tables FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM restaurants WHERE id = tables.restaurant_id AND is_active = TRUE)
    );

CREATE POLICY "Restaurant owners can manage their tables"
    ON tables FOR ALL
    USING (
        EXISTS (SELECT 1 FROM restaurants WHERE id = tables.restaurant_id AND owner_id::TEXT = auth.uid()::TEXT)
    );

-- Bookings Policies
CREATE POLICY "Users can view their own bookings"
    ON bookings FOR SELECT
    USING (user_id::TEXT = auth.uid()::TEXT);

CREATE POLICY "Users can create bookings"
    ON bookings FOR INSERT
    WITH CHECK (user_id::TEXT = auth.uid()::TEXT);

CREATE POLICY "Users can update their own bookings"
    ON bookings FOR UPDATE
    USING (user_id::TEXT = auth.uid()::TEXT);

CREATE POLICY "Admins can manage all bookings"
    ON bookings FOR ALL
    USING (
        EXISTS (SELECT 1 FROM users WHERE id::TEXT = auth.uid()::TEXT AND role = 'admin')
    );

-- Reviews Policies
CREATE POLICY "Anyone can view reviews"
    ON reviews FOR SELECT
    USING (TRUE);

CREATE POLICY "Users can create reviews"
    ON reviews FOR INSERT
    WITH CHECK (user_id::TEXT = auth.uid()::TEXT);

CREATE POLICY "Users can update their own reviews"
    ON reviews FOR UPDATE
    USING (user_id::TEXT = auth.uid()::TEXT);

-- Admin Logs Policies
CREATE POLICY "Only admins can view logs"
    ON admin_logs FOR ALL
    USING (
        EXISTS (SELECT 1 FROM users WHERE id::TEXT = auth.uid()::TEXT AND role = 'admin')
    );
