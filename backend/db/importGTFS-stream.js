// Script d'import GTFS et nettoyage
import { getDb } from "./client.js";
import { importFileToCollection } from "./importUtils.js";
import { resetDatabase } from "./reset.js";

let validTripIds = new Set();

export async function importGTFSStream() {

  // Nettoyage de la base
  await resetDatabase();

  // 1. Import routes (rail only)
  await importFileToCollection("routes.txt", "routes", 5000,    
    (row) => {
      // Type 1 = métro, et filtre RATP uniquement
      return row.route_type === "1" && row.route_id.includes("IDFM:C01");
    },
    (row) => {
      delete row.wheelchair_accessible;
      delete row.bikes_allowed;
      delete row.shape_id;
      delete row.block_id;
      return row;
    }
  );

  // 2. Import trips (only those linked to rail routes)
  const db = await getDb();
  const metroRoutes = await db.collection("routes").find().project({ route_id: 1 }).toArray();
  const metroRouteIds = new Set(metroRoutes.map(r => r.route_id));
  console.log(`📊 ${metroRouteIds.size} routes métro RATP trouvées`);


  await importFileToCollection("trips.txt", "trips", 5000, 
    (row) => {
      // ✅ Garde uniquement les trips des routes métro RATP
      const keep = metroRouteIds.has(row.route_id);
      if (keep) validTripIds.add(row.trip_id);
      return keep;
    }, 
    (row) => {
      delete row.wheelchair_accessible;
      delete row.bikes_allowed;
      delete row.shape_id;
      delete row.block_id;
      return row;
    }
  );
  console.log(`📊 ${validTripIds.size} trips métro RATP validés`);

  // 3. On récupère les stop_ids depuis stop_times pour être plus efficace
  const metroStopIds = new Set();
  
  // Pré-scan de stop_times pour identifier les stops utilisés
  await importFileToCollection("stop_times.txt", "stop_times_temp", 5000, 
    (row) => {
      if (validTripIds.has(row.trip_id)) {
        metroStopIds.add(row.stop_id);
        return true;
      }
      return false;
    },
    (row) => {
      delete row.start_pickup_drop_off_window;
      delete row.end_pickup_drop_off_window;
      delete row.stop_sequence;
      delete row.local_zone_id;
      delete row.pickup_booking_rule_id;
      delete row.drop_off_booking_rule_id;
      delete row.arrival_time;
      delete row.pickup_type;
      delete row.drop_off_type;
      delete row.timepoint;
      delete row.stop_headsign;
      delete row.shape_dist_traveled;
      return row;
    }
  );

  // Renommer la collection temporaire
  await db.collection("stop_times_temp").rename("stop_times", { dropTarget: true });
  
  console.log(`📊 ${metroStopIds.size} arrêts métro RATP identifiés`);

  // 4. Import des stops filtrés
  await importFileToCollection("stops.txt", "stops", 5000, 
    (row) => metroStopIds.has(row.stop_id),
    (row) => {
      delete row.stop_code;
      delete row.stop_lon;
      delete row.stop_lat;
      delete row.parent_station;
      delete row.stop_timezone;
      delete row.level_id;
      delete row.wheelchair_boarding;
      delete row.platform_code;
      return row;
    }
  );

  // 5. Import calendar + calendar_dates - Uniquement les services utilisés
  const metroServiceIds = new Set(
    await db.collection("trips").distinct("service_id")
  );
  
  console.log(`📊 ${metroServiceIds.size} services métro RATP trouvés`);
  
  await importFileToCollection("calendar.txt", "calendar", 5000,
    (row) => metroServiceIds.has(row.service_id)
  );
  
  await importFileToCollection("calendar_dates.txt", "calendar_dates", 5000,
    (row) => metroServiceIds.has(row.service_id)
  );

  // Log récapitulatif
  const counts = {};
  for (const name of ["routes", "trips", "stops", "stop_times", "calendar", "calendar_dates"]) {
    counts[name] = await db.collection(name).countDocuments();
  }

  console.log("\n📊 ========== RÉCAPITULATIF IMPORT ==========");
  console.log(`📍 Routes métro RATP   : ${counts.routes.toLocaleString()}`);
  console.log(`🚇 Trips               : ${counts.trips.toLocaleString()}`);
  console.log(`🚏 Arrêts              : ${counts.stops.toLocaleString()}`);
  console.log(`⏰ Horaires            : ${counts.stop_times.toLocaleString()}`);
  console.log(`📅 Calendriers         : ${counts.calendar.toLocaleString()}`);
  console.log(`📆 Dates exceptionnelles: ${counts.calendar_dates.toLocaleString()}`);
  console.log("============================================\n");

  return undefined;
}