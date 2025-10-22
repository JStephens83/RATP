import { getDb } from "./client.js";
import { importFileToCollection } from "./importUtils.js";
import { resetDatabase } from "./reset.js";

let validTripIds = new Set();

export async function importGTFSStream() {
  // 🔄 Nettoyage de la base
  await resetDatabase();

  // 1. Import routes (rail only)
  const railTypes = ["0", "1", "2", "7"];
  await importFileToCollection("routes.txt", "routes", 5000, (row) => railTypes.includes(row.route_type));

  // 2. Import trips (only those linked to rail routes)
  const db = await getDb();
  const railRoutes = await db.collection("routes").find().project({ route_id: 1 }).toArray();
  const railRouteIds = new Set(railRoutes.map(r => r.route_id));

  await importFileToCollection("trips.txt", "trips", 5000, (row) => {
    const keep = railRouteIds.has(row.route_id);
    if (keep) validTripIds.add(row.trip_id);
    return keep;
  }, (row) => {
    delete row.wheelchair_accessible;
    delete row.bikes_allowed;
    delete row.shape_id;
    delete row.block_id;
    return row;
  });

  // 3. Import stops (all, mais on nettoie)
  await importFileToCollection("stops.txt", "stops", 5000, null, (row) => {
    delete row.stop_code;
    delete row.stop_lon;
    delete row.stop_lat;
    delete row.parent_station;
    delete row.stop_timezone;
    delete row.level_id;
    delete row.wheelchair_boarding;
    return row;
  });

  // 4. Import stop_times (only those linked to valid trips)
  await importFileToCollection("stop_times.txt", "stop_times", 5000, (row) => validTripIds.has(row.trip_id), (row) => {
    delete row.start_pickup_drop_off_window;
    delete row.end_pickup_drop_off_window;
    delete row.stop_sequence;
    delete row.local_zone_id;
    delete row.pickup_booking_rule_id;
    delete row.drop_off_booking_rule_id;
    return row;
  });

  // 5. Import calendar + calendar_dates
  await importFileToCollection("calendar.txt", "calendar");
  await importFileToCollection("calendar_dates.txt", "calendar_dates");

  // 🔎 Log récapitulatif
  const counts = {};
  for (const name of ["routes", "trips", "stops", "stop_times", "calendar", "calendar_dates"]) {
    counts[name] = await db.collection(name).countDocuments();
  }
  console.log("📊 Récapitulatif import :", counts);
}
