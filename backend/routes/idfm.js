// Route Express sécurisée pour intérroger l'API RATP/IDFM
import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/stop-monitoring", async (req, res) => {
  const { MonitoringRef, LineRef } = req.query;

  if (!MonitoringRef || !LineRef) {
    return res.status(400).json({ error: "MonitoringRef et LineRef requis" });
  }

  try {
    const response = await axios.get(
      "https://prim.iledefrance-mobilites.fr/marketplace/stop-monitoring", 
      {
        params: { MonitoringRef, LineRef },
        headers: {
          apikey: process.env.PRIM_API_KEY, 
        },
    });
    const data = response.data;
    res.json(data);

  } catch (err) {
    console.error("Erreur IDFM backend :", err);
    res.status(500).json({ error: "Erreur serveur IDFM" });
  }
});

export default router;