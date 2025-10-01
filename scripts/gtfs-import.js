import dotenv from "dotenv";
import { ensureDirs, downloadZip, unzip, cleanup } from "../utils/file.js";
import { importGTFS } from "../db/importGTFS.js";
import { computeLastTrains } from "../services/trains.js";
import { closeDb } from "../db/client.js";

dotenv.config({ path: ".env.local" });

(async function main() {
  try {
    await ensureDirs();
    await downloadZip(process.env.GTFS_URL, process.env.PRIM_API_KEY);
    await unzip();
    await importGTFS();

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