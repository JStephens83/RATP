import { getDb } from "./client.js";

// Index à recréer après import
export async function createIndexes() {
  const db = await getDb();

  console.log("Création des index...");

  await db.collection("stops").createIndex({ stop_id: 1 });
  await db.collection("trips").createIndex({ trip_id: 1, route_id: 1 });
  await db.collection("routes").createIndex({ route_id: 1 });
  await db.collection("stop_times").createIndex({ stop_id: 1 });
  await db.collection("stop_times").createIndex({ trip_id: 1 });

  console.log("Index créés avec succès");
}
