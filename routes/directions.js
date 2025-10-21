import express from "express";
import { getDb } from "../db/client.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { line } = req.query;
  if (!line) return res.status(400).json({ error: "Missing line parameter" });

  try {
    const db = await getDb();

    const trips = await db.collection("trips").aggregate([
      { $match: { route_id: line } },
      {
        $group: {
          _id: "$direction_id",
          headsign: { $first: "$trip_headsign" }
        }
      },
      {
        $project: {
          id: { $toString: "$_id" },
          name: "$headsign"
        }
      }
    ]).toArray();

    console.log("Directions récupérées depuis MongoDB :", trips);

    res.json(trips);
  } catch (error) {
    console.error("Erreur dans /api/directions :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;