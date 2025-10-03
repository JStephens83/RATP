import path from "path";
import { parseCSV } from "../utils/csv.js";
import { getDb } from "./client.js";
import { EXTRACT_DIR } from "../utils/file.js";

export async function importGTFS() {
  const db = await getDb();

  // Nettoyer
  await db.collection("routes").deleteMany({});
  await db.collection("trips").deleteMany({});
  await db.collection("stops").deleteMany({});
  await db.collection("stop_times").deleteMany({});
  await db.collection("calendar").deleteMany({});
  await db.collection("calendar_dates").deleteMany({});

  // Charger
  const routes = await parseCSV(path.join(EXTRACT_DIR, "routes.txt"));
  const trips = await parseCSV(path.join(EXTRACT_DIR, "trips.txt"));
  const stops = await parseCSV(path.join(EXTRACT_DIR, "stops.txt"));
  const stopTimes = await parseCSV(path.join(EXTRACT_DIR, "stop_times.txt"));
  const calendar = await parseCSV(path.join(EXTRACT_DIR, "calendar.txt"));
  const calendar_dates = await parseCSV(path.join(EXTRACT_DIR, "calendar_dates.txt"));

  await db.collection("routes").insertMany(routes);
  await db.collection("trips").insertMany(trips);
  await db.collection("stops").insertMany(stops);
  await db.collection("stop_times").insertMany(stopTimes);
  await db.collection("calendar").insertMany(calendar);
  await db.collection("calendar_dates").insertMany(calendar_dates);

  console.log("✅ Données GTFS importées en base");
}
