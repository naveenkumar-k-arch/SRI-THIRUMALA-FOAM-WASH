import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_OFi5MVz9nURo@ep-misty-cell-aznjyd68-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

export const sql = neon(connectionString);
export default sql;
