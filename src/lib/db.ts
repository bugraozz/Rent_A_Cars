import { Pool } from "pg"

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "go_drive",
  password: "1905", // ❗ Güncel şifren burası
  port: 5432,
})

export default {
  query: (text: string, params?: any[]) => pool.query(text, params),
}
