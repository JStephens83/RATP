import express from "express";
import { getDb } from "../db/client.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { line, direction } = req.query;
  if (!line || !direction) {
    return res.status(400).json({ error: "Missing line or direction" });
  }

  try {
    const db = await getDb();

    const trips = await db.collection("trips").find({
      route_id: line,
      direction_id: direction
    }).project({ trip_id: 1 }).toArray();

    const tripIds = trips.map(t => t.trip_id);
    if (tripIds.length === 0) return res.json([]);

    const stopTimes = await db.collection("stop_times").find({
      trip_id: { $in: tripIds }
    }).project({ stop_id: 1, stop_sequence: 1 }).toArray();

    const orderedStops = [...new Map(
      stopTimes
        .sort((a, b) => a.stop_sequence - b.stop_sequence)
        .map(item => [item.stop_id, item])
    ).values()];

    const stopIds = orderedStops.map(s => s.stop_id);

    const stops = await db.collection("stops").find({
      stop_id: { $in: stopIds }
    }).project({ stop_id: 1, stop_name: 1 }).toArray();

    const stopMap = Object.fromEntries(stops.map(s => [s.stop_id, s.stop_name]));
    const result = stopIds.map(id => ({ id, name: stopMap[id] }));

    res.json(result);
  } catch (error) {
    console.error("Erreur dans /api/stops :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;