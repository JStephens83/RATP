// Fonction de lecture des horaires d'arrêt pour une station donnée
import { getDb } from "./client.js";

export async function getStopTimes(stationId) {
  const db = await getDb();
  return db.collection("stop_times").find({ stop_id: stationId }).toArray();
}