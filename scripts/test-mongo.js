import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new MongoClient(process.env.MONGO_URI);

async function run() {
  try {
    await client.connect();
    console.log("✅ Connexion réussie à MongoDB Atlas !");
    const db = client.db(process.env.DB_NAME);
    const collections = await db.listCollections().toArray();
    console.log("Collections existantes :", collections.map(c => c.name));
  } catch (err) {
    console.error("❌ Erreur de connexion :", err);
  } finally {
    await client.close();
  }
}

run();
