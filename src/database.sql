
-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Portfolios Table
CREATE TABLE portfolios (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    asset_name VARCHAR(100) NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    quantity DECIMAL(18, 8) NOT NULL,
    purchase_price DECIMAL(18, 2) NOT NULL,
    current_value DECIMAL(18, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date TIMESTAMP NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('Buy', 'Sell', 'Deposit', 'Withdraw')),
    asset_name VARCHAR(100),
    quantity DECIMAL(18, 8),
    price DECIMAL(18, 2),
    notes TEXT
);

-- Goals Table
CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(18, 2) NOT NULL,
    current_amount DECIMAL(18, 2) NOT NULL,
    deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Advisors Table
CREATE TABLE advisors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    expertise VARCHAR(100) NOT NULL,
    image_url VARCHAR(255)
);

-- Advisor Meetings Table
CREATE TABLE advisor_meetings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    advisor_id INTEGER REFERENCES advisors(id) ON DELETE CASCADE,
    date TIMESTAMP NOT NULL,
    topic VARCHAR(255) NOT NULL
);

-- Insert test data

-- Test User (Password: "password123" - would be hashed in a real app)
INSERT INTO users (full_name, email, password_hash) VALUES 
('John Smith', 'john@example.com', '$2a$10$rIIJ7QKw3CWBIeHd3slJyOTAZQXGsJJjAJBEBx.MjKQUGrpfL5sby');

-- Test Portfolio Items
INSERT INTO portfolios (user_id, asset_name, asset_type, quantity, purchase_price, current_value) VALUES
(1, 'Apple Inc.', 'Stock', 10, 150.00, 175.25),
(1, 'Microsoft Corp', 'Stock', 5, 220.50, 250.75),
(1, 'Bitcoin', 'Cryptocurrency', 0.5, 35000.00, 42000.00),
(1, 'Ethereum', 'Cryptocurrency', 2.5, 2500.00, 3200.00),
(1, 'Rental Property', 'Real Estate', 1, 250000.00, 300000.00),
(1, 'S&P 500 ETF', 'ETF', 20, 400.00, 425.50);

-- Test Transactions
INSERT INTO transactions (user_id, date, type, asset_name, quantity, price, notes) VALUES
(1, '2023-01-15 10:30:00', 'Buy', 'Apple Inc.', 5, 145.00, 'Initial investment'),
(1, '2023-02-10 11:25:00', 'Buy', 'Apple Inc.', 5, 155.00, 'Dollar-cost averaging'),
(1, '2023-03-05 09:45:00', 'Buy', 'Microsoft Corp', 5, 220.50, 'Portfolio diversification'),
(1, '2023-04-20 14:15:00', 'Buy', 'Bitcoin', 0.5, 35000.00, 'Crypto exposure'),
(1, '2023-05-12 16:30:00', 'Buy', 'Ethereum', 2.5, 2500.00, 'Blockchain investment'),
(1, '2023-06-01 13:20:00', 'Buy', 'S&P 500 ETF', 10, 395.00, 'Index fund investment'),
(1, '2023-07-15 15:45:00', 'Buy', 'S&P 500 ETF', 10, 405.00, 'Regular investment'),
(1, '2023-09-30 10:00:00', 'Buy', 'Rental Property', 1, 250000.00, 'Investment property purchase'),
(1, '2023-12-10 12:30:00', 'Deposit', NULL, NULL, 10000.00, 'Year-end bonus deposit');

-- Test Goals
INSERT INTO goals (user_id, name, target_amount, current_amount, deadline) VALUES
(1, 'Retirement Fund', 1000000.00, 350000.00, '2045-12-31'),
(1, 'House Down Payment', 60000.00, 35000.00, '2025-06-30'),
(1, 'Emergency Fund', 25000.00, 15000.00, '2024-03-31'),
(1, 'Vacation', 5000.00, 2500.00, '2024-07-15');

-- Test Advisors
INSERT INTO advisors (name, email, expertise, image_url) VALUES
('Sarah Johnson', 'sarah@financialadvisor.com', 'Retirement Planning', 'https://randomuser.me/api/portraits/women/45.jpg'),
('Michael Chen', 'michael@financialadvisor.com', 'Tax Strategy', 'https://randomuser.me/api/portraits/men/22.jpg'),
('Emma Wilson', 'emma@financialadvisor.com', 'Real Estate Investment', 'https://randomuser.me/api/portraits/women/33.jpg');

-- Test Advisor Meetings
INSERT INTO advisor_meetings (user_id, advisor_id, date, topic) VALUES
(1, 1, '2024-05-25 14:00:00', 'Retirement Planning Review'),
(1, 2, '2024-05-30 11:30:00', 'Tax Optimization Strategies'),
(1, 3, '2024-06-05 15:30:00', 'Real Estate Portfolio Expansion');
