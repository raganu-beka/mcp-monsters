import postgres from "postgres";

const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgres://postgres:any@127.0.0.1:5432/postgres?sslmode=disable";

export const sql = postgres(DATABASE_URL, {
  ssl: false,
  max: 1,
});
