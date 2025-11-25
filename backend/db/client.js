// Connexion MongoDB. Fournit une fonction getDb() pour se connecter à MongoDB à la demande (utile dans des scripts ou tests indépendants)
import { MongoClient } from "mongodb";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "../..")

dotenv.config({ path: path.join(ROOT_DIR, ".env.local") });
// console.log("✅ dotenv chargé depuis :", path.join(ROOT_DIR, ".env.local"));
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || "idfm";

let client;

export async function getDb() {
  if (!client) {
    client = new MongoClient(MONGO_URI);
    await client.connect();
  }
  return client.db(DB_NAME);
}

export async function closeDb() {
  if (client) await client.close();
}