import { DataSource } from "typeorm";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

export default new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
  entities: [path.join(__dirname, "..", "**", "*.entity.{ts,js}")],
  migrations: [path.join(__dirname, "..", "migrations", "*.{ts,js}")],
  synchronize: false,
});
