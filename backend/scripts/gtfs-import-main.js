// Script principal d'import GTFS + nettoyage + calculs additionnels
import dotenv from "dotenv";
import fs from "fs";
import { ensureDirs, downloadZip, unzip, cleanup, EXTRACT_DIR } from "../utils/file.js";
import { importGTFSStream } from "../db/importGTFS-stream.js";
import { createIndexes } from "../db/indexes.js";
import { computeLastTrains } from "../../services/trains.js";
import { closeDb } from "../db/client.js";
import { verifyGTFSFiles } from "../db/verify.js";

dotenv.config({ path: ".env.local" });

(async function main() {
  try {
    // 📁 Création des dossiers (premier lancement)
    await ensureDirs();

    // 🔍 Vérification si c'est le premier lancement
    const isFirstRun = !fs.existsSync(EXTRACT_DIR) || fs.readdirSync(EXTRACT_DIR).length === 0;
    if (isFirstRun) {
      console.log("🆕 Premier lancement détecté - téléchargement initial");
    }

    // 📥 Téléchargement du ZIP GTFS
    await downloadZip(process.env.GTFS_URL, process.env.PRIM_API_KEY);
    await unzip();

    // ✅ Vérification que tous les fichiers sont bien présents
    verifyGTFSFiles();

    // Import en streaming
    await importGTFSStream();

    // Création des index après import
    await createIndexes();

    // Exemple de calcul si TARGET_STOP_ID est défini
    if (process.env.TARGET_STOP_ID) {
      await computeLastTrains(process.env.TARGET_STOP_ID);
    }
  } catch (e) {
    console.error("Erreur:", e);
  } finally {
    await cleanup();
    await closeDb();
  }
})();