import { neon } from '@neondatabase/serverless';

const NEON_URL = 'postgresql://neondb_owner:npg_OFi5MVz9nURo@ep-misty-cell-aznjyd68-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(NEON_URL);

async function check() {
  try {
    const bCount = await sql`SELECT count(*) FROM bookings`;
    const uCount = await sql`SELECT count(*) FROM users`;
    console.log('PostgreSQL counts:', { bookings: bCount[0].count, users: uCount[0].count });
    const sample = await sql`SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5`;
    console.log('Sample bookings:', sample);
  } catch (err) {
    console.error('Error querying Neon:', err);
  }
}

check();
