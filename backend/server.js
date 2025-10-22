// Lance le serveur Express, connecte MongoDB, injecte req.db dans les routes
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import stopsRouter from "./routes/stops.js";
import directionsRouter from "./routes/directions.js";

dotenv.config({ path: "../.env.local" });

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);
let db;

async function startServer() {
  try {
    await client.connect();
    db = client.db(process.env.DB_NAME);
    console.log("✅ Connexion réussie à MongoDB");

    // Injecte la base dans chaque requête
    app.use((req, res, next) => {
      req.db = db;
      next();
    });

    // Routes
    app.use("/api/stops", stopsRouter);
    app.use("/api/directions", directionsRouter);

    // Lancement du serveur
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Serveur Express lancé sur http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Erreur de connexion MongoDB :", err);
  }
}

startServer();