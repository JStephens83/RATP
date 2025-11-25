// Recherche des 5 derniers passages d'un train à un arrêt donné pour une ligne et direction spécifiques (backend express)
import express from "express";
import { getDb } from "../db/client.js";
import { format } from "date-fns";
import { parseGTFSTime } from "../utils/time.js";

const router = express.Router();

router.get("/last", async (req, res) => {
  const { stopId, routeId, directionId } = req.query;
  console.log("📍 Requête pour les 5 derniers trains :", { stopId, routeId, directionId });


  if (!stopId || !routeId || directionId === undefined) {
    return res.status(400).json({ error: "stopId, routeId et directionId requis" });
  }

  try {
    const db = await getDb();
    const now = new Date();
    const today = format(new Date(), "yyyyMMdd");
    const dayOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][new Date().getDay()];
    console.log("📅 Date GTFS :", today, "| Jour :", dayOfWeek);

    // 1. Services du calendrier régulier
    const calendarServices = await db.collection("calendar").find({
      [dayOfWeek]: "1",
      start_date: { $lte: today },
      end_date: { $gte: today }
    }).project({ service_id: 1 }).toArray();

    // 2. Exceptions du calendrier
    const addedServices = await db.collection("calendar_dates").find({
      date: today,
      exception_type: "1"
    }).project({ service_id: 1 }).toArray();

    const removedServices = await db.collection("calendar_dates").find({
      date: today,
      exception_type: "2"
    }).project({ service_id: 1 }).toArray();

    // 3. fusion des services actifs
    const activeServiceIds = new Set([
      ...calendarServices.map(s => s.service_id),
      ...addedServices.map(s => s.service_id)
    ]);
    for (const s of removedServices) activeServiceIds.delete(s.service_id);
    console.log("Services actifs aujourd'hui :", Array.from(activeServiceIds));

    if (activeServiceIds.size === 0) {
      return res.json({ 
        trains: [],
        message: "Aucun service actif aujourd'hui"
      });
    }

    // 4. trips valides AVEC direction
    const trips = await db.collection("trips").find({
      route_id: routeId,
      direction_id: directionId,
      service_id: { $in: Array.from(activeServiceIds) }
    }).project({ trip_id: 1 }).toArray();

    const tripIds = trips.map(t => t.trip_id);
    console.log("🚇 Trips valides trouvés:", tripIds);

    if (tripIds.length === 0) {
      return res.json({ 
        trains: [],
        message: "Aucun train trouvé pour cette ligne/direction aujourd'hui"
      });
    }

    // 5. Récupération de TOUS les stop_times pour cet arrêt
    const stopTimes = await db.collection("stop_times").find({
      trip_id: { $in: tripIds },
      stop_id: stopId
    }).toArray();
    console.log("⏰ Horaires bruts trouvés :", stopTimes.length);

    if (stopTimes.length === 0) {
      return res.json({ 
        trains: [],
        message: "Aucun horaire trouvé pour cet arrêt"
      });
    }

    // 6. Convertir en dates réelles et filtrer les trains futurs
    const trainsWithDates = stopTimes
    .map(st => {
      const departureDate = parseGTFSTime(st.departure_time, today);
      return {
        tripId: st.trip_id,
        departureTime: st.departure_time,
        departureDate,
        stopId: st.stop_id
      };
    })
    .filter(train => train.departureDate > now) // ✅ trains futurs
    .sort((a, b) => a.departureDate - b.departureDate); // ✅ tri croissant
    
    console.log("⏰ Trains futurs :", trainsWithDates.length);
    
    // 7. Retourner les 5 derniers trains
    const lastFiveTrains = trainsWithDates.slice(-5).map(train => ({
      tripId: train.tripId,
      departureTime: train.departureTime,
      departureDate: train.departureDate.toISOString(),
      stopId: train.stopId,
      formattedTime: format(train.departureDate, "HH:mm:ss")
    }));
    
    console.log("✅ 5 derniers trains :", lastFiveTrains.map(t => ({
      time: t.formattedTime,
    })));

    res.json(lastFiveTrains);

  } catch (error) {
    console.error("Erreur backend trainTimes:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
