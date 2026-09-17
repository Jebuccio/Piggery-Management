CREATE TABLE IF NOT EXISTS sows (
  id SERIAL PRIMARY KEY,
  sow_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  tag_number VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(30) CHECK (status IN ('Healthy', 'Breeding', 'Gestating', 'Isolated')) DEFAULT 'Healthy',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS store_inventory (
  id SERIAL PRIMARY KEY,
  feed_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  in_stock BOOLEAN DEFAULT TRUE,
  price_per_bag NUMERIC(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS store_customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  location VARCHAR(150) NOT NULL,
  preferred_feed VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial Seed Data
INSERT INTO sows (sow_id, name, tag_number, status, notes) VALUES
('SOW-001', 'Bella', 'TAG-9081', 'Gestating', 'Expected farrowing in 2 weeks'),
('SOW-002', 'Daisy', 'TAG-9082', 'Healthy', 'Vaccinated yesterday'),
('SOW-003', 'Rosie', 'TAG-9083', 'Breeding', 'Scheduled for checkup');

INSERT INTO store_inventory (feed_name, category, in_stock, price_per_bag) VALUES
('Inahin 1 Gestation Feed', 'Breeding Feed', TRUE, 1450.00),
('Piglet Starter Mash', 'Starter Feed', TRUE, 1680.00),
('Hog Grower Pellets', 'Growth Feed', FALSE, 1320.00);

INSERT INTO store_customers (name, phone, location, preferred_feed) VALUES
('Juan Dela Cruz', '+63 917 123 4567', 'San Jose Farm', 'Inahin 1 Gestation Feed'),
('Maria Clara', '+63 918 987 6543', 'Barangay 4 Piggery', 'Piglet Starter Mash');