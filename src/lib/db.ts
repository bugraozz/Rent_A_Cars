import { Pool } from "pg"

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "go_drive",
  password: "1905", // ❗ Güncel şifren burası
  port: 5432,
})

type QueryParams = (string | number | boolean | null | undefined)[];

const db = {
  query: (text: string, params?: QueryParams) => pool.query(text, params),
}

export default db;
