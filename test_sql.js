import { neon } from '@neondatabase/serverless';

const NEON_URL = 'postgresql://neondb_owner:npg_OFi5MVz9nURo@ep-misty-cell-aznjyd68-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(NEON_URL);

async function testCall() {
  try {
    const res = await sql.query('SELECT * FROM bookings LIMIT $1', [2]);
    console.log('res is array?', Array.isArray(res));
    console.log('res structure:', Object.keys(res), res);
  } catch (e) {
    console.error('sql.query error:', e);
  }
}

testCall();
