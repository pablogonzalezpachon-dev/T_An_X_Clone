import postgres from "postgres";
import dotenv from "dotenv";
import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);

export default sql;
