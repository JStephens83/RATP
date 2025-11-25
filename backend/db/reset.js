// Suppression des collections sur MongoDB
import { getDb } from "./client.js";

export async function resetDatabase() {
  const db = await getDb();
  const collections = [
    "routes",
    "trips",
    "stops",
    "stop_times",
    "calendar",
    "calendar_dates"
  ];

  for (const name of collections) {
    try {
      await db.collection(name).drop();
      console.log(`🗑️ Collection ${name} supprimée`);
    } catch (e) {
      if (e.codeName !== "NamespaceNotFound") {
        console.warn(`⚠️ Impossible de drop ${name}:`, e.message);
      }
    }
  }
}
