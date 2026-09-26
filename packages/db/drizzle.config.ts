import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

// Charge le .env situé à la racine du projet
dotenv.config({ path: "../../.env" });

export default {
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;