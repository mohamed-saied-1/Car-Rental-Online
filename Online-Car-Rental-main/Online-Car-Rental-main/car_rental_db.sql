-- drop database car_rental_db;
CREATE DATABASE IF NOT EXISTS car_rental_db;
USE car_rental_db;

-- ===========================================
-- USERS TABLE
-- ===========================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(120) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('admin','owner','customer') NOT NULL,
    national_id VARCHAR(50),
    driver_license VARCHAR(50),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- CARS TABLE 
-- ===========================================
CREATE TABLE cars (
    car_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    price_per_day DECIMAL(10,2) NOT NULL,
    status ENUM('available','rented') DEFAULT 'available',
    
    -- NEW LOCATION COLUMN
    location VARCHAR(100) NOT NULL,
    
    -- NEW FEATURE COLUMNS
    seats INT NOT NULL,
    transmission ENUM('Automatic', 'Manual') NOT NULL,
    mileage_detail VARCHAR(50) NOT NULL, -- e.g., '18 km/l' or 'Excellent Mileage'
    fuel_type ENUM('Gasoline', 'Diesel', 'Electric', 'Hybrid') NOT NULL,
    
    image_url VARCHAR(255),
    description TEXT,
    FOREIGN KEY (owner_id) REFERENCES users(user_id)
);

-- ===========================================
-- BOOKINGS TABLE
-- ===========================================
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL,
    user_id INT NOT NULL,
    
    -- Contact info for this specific booking
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(120) NOT NULL,
    national_id VARCHAR(50) NOT NULL,
    
    -- Rental Details
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location VARCHAR(255),
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Driver Documentation
    driver_license VARCHAR(50),
    license_expiry DATE,
    license_country VARCHAR(100),

    -- Agreement flags
    terms_accepted BOOLEAN NOT NULL,
    insurance_confirmed BOOLEAN,
    driving_record_confirmed BOOLEAN,

    booking_status ENUM('pending','confirmed','completed','cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (car_id) REFERENCES cars(car_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ===========================================
-- PAYMENTS TABLE
-- ===========================================
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status ENUM('pending','completed','failed') DEFAULT 'completed',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);


-- ===========================================
-- SYSTEM LOGS TABLE
-- ===========================================
CREATE TABLE system_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    message TEXT,
    type VARCHAR(20) DEFAULT 'info', -- info, success, warning, danger
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO car_rental_db.system_logs (action, message, type) 
VALUES ('TEST_LOG', 'If you see this, the database is working!', 'success');


INSERT INTO users (first_name, last_name, email, phone, password_hash, user_type, is_verified) VALUES (
    'Owner',
    '1',
    'owner@carrental.com',
    '01000000000',
    '$2a$10$N5FS.SFM82KJ61IOrlejUenlss6CvD6cKwKPvMh6WxbdLp0GwgmSS',
    'owner',
    TRUE
);

INSERT INTO users (first_name, last_name, email, phone, password_hash, user_type, is_verified) VALUES (
    'Ahmed',
    '1',
    'ahmed@carrental.com',
    '01000000002',
    '$2a$10$N5FS.SFM82KJ61IOrlejUenlss6CvD6cKwKPvMh6WxbdLp0GwgmSS',
    'owner',
    False
);


INSERT INTO users (first_name, last_name, email, phone, password_hash, user_type) VALUES (
    'System',
    'Admin',
    'admin@carrental.com',
    '01000000001',
    '$2a$10$8uvmLI8ECouySQpWw0WKDuzjDX9syFXipHdvcDWRaELdCGi7mqQ46',
    'admin'
);




-- ===========================================
-- CARS DATA INSERTS (Including Features and Locations)
-- The car_id matches the deals-(x).png number.
-- ===========================================
INSERT INTO cars (car_id, owner_id, model, year, price_per_day, status, location, seats, transmission, mileage_detail, fuel_type, image_url) VALUES
(5001, 1, 'Tesla Model S', 2023, 180.00, 'available', 'Cairo', 4, 'Automatic', '450km', 'Electric', '/assets/deals-1.png'),
(5002, 1, 'Tesla Model E', 2023, 150.00, 'available', 'Cairo', 4, 'Automatic', '350km', 'Electric', '/assets/deals-2.png'),
(5003, 1, 'Tesla Model Y', 2023, 200.00, 'available', 'Giza', 5, 'Automatic', '500km', 'Electric', '/assets/deals-3.png'),
(5004, 1, 'Mitsubishi Mirage', 2023, 120.00, 'available', 'Alexandria', 5, 'Manual', '20 km/l', 'Gasoline', '/assets/deals-4.png'),
(5005, 1, 'Mitsubishi Xpander', 2023, 150.00, 'available', 'Alexandria', 7, 'Automatic', '15 km/l', 'Gasoline', '/assets/deals-5.png'),
(5006, 1, 'Mitsubishi Pajero Sport', 2023, 220.00, 'rented', 'Cairo', 7, 'Automatic', '10 km/l', 'Diesel', '/assets/deals-6.png'),
(5007, 1, 'Mazda CX5', 2023, 130.00, 'available', 'Alexandria', 5, 'Automatic', '18 km/l', 'Gasoline', '/assets/deals-7.png'),
(5008, 1, 'Mazda CX-30', 2023, 200.00, 'available', 'Giza', 5, 'Manual', '22 km/l', 'Gasoline', '/assets/deals-8.png'),
(5009, 1, 'Mazda CX-9', 2023, 180.00, 'available', 'Luxor', 7, 'Automatic', '12 km/l', 'Gasoline', '/assets/deals-9.png'),
(5010, 1, 'Toyota Corolla', 2023, 180.00, 'available', 'Cairo', 5, 'Manual', '25 km/l', 'Diesel', '/assets/deals-10.png'),
(5011, 1, 'Toyota Innova', 2023, 160.00, 'available', 'Hurghada', 7, 'Automatic', '14 km/l', 'Gasoline', '/assets/deals-11.png'),
(5012, 1, 'Toyota Fortuner', 2023, 190.00, 'available', 'Cairo', 7, 'Automatic', '11 km/l', 'Diesel', '/assets/deals-12.png'),
(5013, 1, 'Honda Amaze', 2023, 100.00, 'available', 'Alexandria', 5, 'Manual', '28 km/l', 'Gasoline', '/assets/deals-13.png'),
(5014, 1, 'Honda City', 2023, 150.00, 'available', 'Giza', 5, 'Automatic', '20 km/l', 'Gasoline', '/assets/deals-14.png'),
(5015, 1, 'Honda CRV', 2023, 210.00, 'available', 'Luxor', 5, 'Automatic', '16 km/l', 'Hybrid', '/assets/deals-15.png');