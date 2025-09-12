import postgres from "postgres";
import dotenv from "dotenv";
import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const sql = postgres(process.env.DATABASE_URL, {
  types: {
    // INT8 / BIGINT -> Number
    int8ToNumber: {
      from: [20], // OID for int8/bigint
      parse: (x) => Number(x),
    },
    // NUMERIC / DECIMAL -> Number (precision may be lost)
    numericToNumber: {
      from: [1700], // OID for numeric
      parse: (x) => Number(x),
    },
  },
});

export default sql;
