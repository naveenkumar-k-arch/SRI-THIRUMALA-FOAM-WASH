import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sql } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// Health Check
// ----------------------------------------------------
app.get('/api/health', async (req, res) => {
  try {
    const result = await sql`SELECT NOW() as server_time, version() as pg_version`;
    res.json({
      status: 'healthy',
      database: 'Neon PostgreSQL Connected',
      time: result[0]?.server_time,
      version: result[0]?.pg_version
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// ----------------------------------------------------
// Bookings Endpoints
// ----------------------------------------------------

// 1. Get all bookings or filtered by date / phone / status
app.get('/api/bookings', async (req, res) => {
  try {
    const { date, phone, status, limit = 100 } = req.query;

    let query = `SELECT * FROM bookings WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (date) {
      query += ` AND booking_date = $${paramIndex++}`;
      params.push(date);
    }
    if (phone) {
      query += ` AND customer_phone = $${paramIndex++}`;
      params.push(phone);
    }
    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit, 10));

    const rows = await sql.query(query, params);
    
    // Map column names to frontend camelCase expectations
    const mapped = rows.map(r => ({
      id: r.id,
      bookingId: r.id,
      customerName: r.customer_name,
      customerPhone: r.customer_phone,
      customerEmail: r.customer_email || '',
      vehicleType: r.vehicle_type,
      vehicleBrand: r.vehicle_brand || '',
      vehicleNumber: r.vehicle_number || '',
      serviceType: r.service_type,
      serviceCategory: r.service_category || '',
      price: Number(r.price),
      date: r.booking_date,
      inTime: r.in_time,
      outTime: r.out_time,
      timeSlot: r.time_slot,
      pickupType: r.pickup_type || 'Self-Drive',
      pickupAddress: r.pickup_address || '',
      pickupPincode: r.pickup_pincode || '',
      distanceKm: Number(r.distance_km || 0),
      notes: r.notes || '',
      status: r.status,
      paymentStatus: r.payment_status,
      paymentMethod: r.payment_method,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    res.json({ success: true, count: mapped.length, data: mapped });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Get booked slots grouped by date
app.get('/api/bookings/booked-slots', async (req, res) => {
  try {
    const { date } = req.query;
    let query = `SELECT booking_date, in_time, COUNT(*) as count FROM bookings WHERE status != 'Cancelled'`;
    const params = [];

    if (date) {
      query += ` AND booking_date = $1`;
      params.push(date);
    }

    query += ` GROUP BY booking_date, in_time`;

    const rows = await sql.query(query, params);
    
    // Format into { "YYYY-MM-DD": ["10:00 AM", "11:00 AM"] }
    const bookedMap = {};
    rows.forEach(r => {
      if (!bookedMap[r.booking_date]) bookedMap[r.booking_date] = [];
      bookedMap[r.booking_date].push(r.in_time);
    });

    res.json({ success: true, data: bookedMap });
  } catch (error) {
    console.error('Error fetching booked slots:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Create a new booking
app.post('/api/bookings', async (req, res) => {
  try {
    const b = req.body;
    
    // Generate an ID if not provided
    const bookingId = b.id || b.bookingId || `STFW-${Math.floor(10000 + Math.random() * 90000)}`;
    const customerName = b.customerName || b.name || 'Valued Customer';
    const customerPhone = b.customerPhone || b.phone || '';
    const customerEmail = b.customerEmail || b.email || '';
    const vehicleType = b.vehicleType || 'Car';
    const vehicleBrand = b.vehicleBrand || '';
    const vehicleNumber = b.vehicleNumber || '';
    const serviceType = b.serviceType || 'Foam Wash';
    const serviceCategory = b.serviceCategory || '';
    const price = parseFloat(b.price) || 0;
    const bookingDate = b.date || b.bookingDate || new Date().toISOString().split('T')[0];
    const inTime = b.inTime || '10:00 AM';
    const outTime = b.outTime || '11:00 AM';
    const timeSlot = b.timeSlot || `${inTime} – ${outTime}`;
    const pickupType = b.pickupType || 'Self-Drive';
    const pickupAddress = b.pickupAddress || '';
    const pickupPincode = b.pickupPincode || '';
    const distanceKm = parseFloat(b.distanceKm) || 0;
    const notes = b.notes || '';
    const status = b.status || 'Confirmed';
    const paymentStatus = b.paymentStatus || 'Pending';
    const paymentMethod = b.paymentMethod || 'UPI';

    const insertQuery = `
      INSERT INTO bookings (
        id, customer_name, customer_phone, customer_email,
        vehicle_type, vehicle_brand, vehicle_number,
        service_type, service_category, price,
        booking_date, in_time, out_time, time_slot,
        pickup_type, pickup_address, pickup_pincode, distance_km,
        notes, status, payment_status, payment_method,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7,
        $8, $9, $10,
        $11, $12, $13, $14,
        $15, $16, $17, $18,
        $19, $20, $21, $22,
        NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        payment_status = EXCLUDED.payment_status,
        updated_at = NOW()
      RETURNING *;
    `;

    const params = [
      bookingId, customerName, customerPhone, customerEmail,
      vehicleType, vehicleBrand, vehicleNumber,
      serviceType, serviceCategory, price,
      bookingDate, inTime, outTime, timeSlot,
      pickupType, pickupAddress, pickupPincode, distanceKm,
      notes, status, paymentStatus, paymentMethod
    ];

    const result = await sql.query(insertQuery, params);
    const saved = result[0];

    // Also update or insert user record if phone or email is available
    if (customerPhone || customerEmail) {
      try {
        const userId = b.userId || customerPhone || customerEmail;
        await sql.query(`
          INSERT INTO users (id, name, email, phone, role, total_washes, loyalty_points, updated_at)
          VALUES ($1, $2, $3, $4, 'customer', 1, 50, NOW())
          ON CONFLICT (id) DO UPDATE SET
            name = COALESCE(EXCLUDED.name, users.name),
            total_washes = users.total_washes + 1,
            loyalty_points = users.loyalty_points + 50,
            updated_at = NOW();
        `, [userId, customerName, customerEmail || null, customerPhone || null]);
      } catch (userErr) {
        console.warn('Could not auto-sync user stats:', userErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Booking confirmed and saved to PostgreSQL',
      data: {
        id: saved.id,
        bookingId: saved.id,
        customerName: saved.customer_name,
        customerPhone: saved.customer_phone,
        customerEmail: saved.customer_email,
        vehicleType: saved.vehicle_type,
        vehicleBrand: saved.vehicle_brand,
        vehicleNumber: saved.vehicle_number,
        serviceType: saved.service_type,
        price: Number(saved.price),
        date: saved.booking_date,
        inTime: saved.in_time,
        outTime: saved.out_time,
        timeSlot: saved.time_slot,
        status: saved.status,
        paymentStatus: saved.payment_status,
        createdAt: saved.created_at
      }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Update booking status
app.patch('/api/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    let query = `UPDATE bookings SET updated_at = NOW()`;
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += `, status = $${paramIndex++}`;
      params.push(status);
    }
    if (paymentStatus) {
      query += `, payment_status = $${paramIndex++}`;
      params.push(paymentStatus);
    }

    query += ` WHERE id = $${paramIndex} RETURNING *`;
    params.push(id);

    const result = await sql.query(query, params);

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, message: 'Status updated', data: result[0] });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Delete booking
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sql.query(`DELETE FROM bookings WHERE id = $1`, [id]);
    res.json({ success: true, message: 'Booking removed successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// Users Endpoints
// ----------------------------------------------------
app.get('/api/users', async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM users ORDER BY created_at DESC LIMIT 100`;
    const mapped = rows.map(u => ({
      id: u.id,
      name: u.name || 'Anonymous',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role || 'customer',
      loyaltyPoints: u.loyalty_points || 0,
      totalBookings: u.total_washes || 0,
      vehicles: u.vehicles || [],
      addresses: u.addresses || [],
      createdAt: u.created_at
    }));
    res.json({ success: true, count: mapped.length, data: mapped });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/users/sync', async (req, res) => {
  try {
    const { id, name, email, phone, role, vehicles, addresses } = req.body;
    if (!id) return res.status(400).json({ success: false, error: 'User ID is required' });

    const query = `
      INSERT INTO users (id, name, email, phone, role, vehicles, addresses, updated_at)
      VALUES ($1, $2, $3, $4, COALESCE($5, 'customer'), COALESCE($6, '[]'::jsonb), COALESCE($7, '[]'::jsonb), NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, users.name),
        email = COALESCE(EXCLUDED.email, users.email),
        phone = COALESCE(EXCLUDED.phone, users.phone),
        role = COALESCE(EXCLUDED.role, users.role),
        vehicles = COALESCE(EXCLUDED.vehicles, users.vehicles),
        addresses = COALESCE(EXCLUDED.addresses, users.addresses),
        updated_at = NOW()
      RETURNING *;
    `;

    const result = await sql.query(query, [
      id,
      name || null,
      email || null,
      phone || null,
      role || 'customer',
      vehicles ? JSON.stringify(vehicles) : '[]',
      addresses ? JSON.stringify(addresses) : '[]'
    ]);

    res.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// Settings Endpoints
// ----------------------------------------------------
app.get('/api/settings/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const result = await sql.query(`SELECT value FROM settings WHERE key = $1`, [key]);
    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Setting not found' });
    }
    res.json({ success: true, data: result[0].value });
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/settings/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const value = req.body;

    await sql.query(`
      INSERT INTO settings (key, value, updated_at)
      VALUES ($1, $2::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = NOW();
    `, [key, JSON.stringify(value)]);

    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Error saving setting:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// Start Server (when run standalone)
// ----------------------------------------------------
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`✨ Sri Thirumala Foam Wash Backend API listening on http://localhost:${PORT}`);
    console.log(`🐘 Connected to Neon PostgreSQL`);
  });
}

export default app;
