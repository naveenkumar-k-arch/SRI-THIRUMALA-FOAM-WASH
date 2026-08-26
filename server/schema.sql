-- Sri Thirumala Foam Wash Database Schema
-- Neon PostgreSQL

CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(64) PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255),
  vehicle_type VARCHAR(50) NOT NULL,
  vehicle_brand VARCHAR(100),
  vehicle_number VARCHAR(50),
  service_type VARCHAR(100) NOT NULL,
  service_category VARCHAR(50),
  price NUMERIC(10, 2) NOT NULL,
  booking_date VARCHAR(20) NOT NULL,
  in_time VARCHAR(20) NOT NULL,
  out_time VARCHAR(20) NOT NULL,
  time_slot VARCHAR(50) NOT NULL,
  pickup_type VARCHAR(50) DEFAULT 'Self-Drive',
  pickup_address TEXT,
  pickup_pincode VARCHAR(20),
  distance_km NUMERIC(6, 2) DEFAULT 0,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'Confirmed',
  payment_status VARCHAR(50) DEFAULT 'Pending',
  payment_method VARCHAR(50) DEFAULT 'UPI',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(customer_phone);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(128) PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  role VARCHAR(50) DEFAULT 'customer',
  loyalty_points INTEGER DEFAULT 0,
  total_washes INTEGER DEFAULT 0,
  vehicles JSONB DEFAULT '[]'::jsonb,
  addresses JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(64) PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  vehicle_type VARCHAR(50),
  service_name VARCHAR(100),
  approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default UPI Payment Settings
INSERT INTO settings (key, value, updated_at)
VALUES (
  'payments',
  '{"upiId": "srithirumalafoamwash@upi", "payeeName": "Sri Thirumala Foam Wash", "qrImage": "/images/payment-qr.png", "acceptOnline": true, "acceptCash": true}'::jsonb,
  NOW()
)
ON CONFLICT (key) DO NOTHING;
