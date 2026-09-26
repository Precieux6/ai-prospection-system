import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Chercher le fichier .env dans plusieurs emplacements possibles
const envPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(__dirname, "../../.env"),
  path.resolve(__dirname, "../../../.env"),
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    envLoaded = true;
    console.log(`✅ .env chargé depuis: ${envPath}`);
    break;
  }
}

if (!envLoaded) {
  console.warn("️  Fichier .env non trouvé, utilisation des variables d'environnement système");
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(`DATABASE_URL is not set. Checked paths: ${envPaths.join(", ")}`);
}

const client = postgres(connectionString, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
export type Database = typeof db;