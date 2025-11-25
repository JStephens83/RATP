import fs from "fs";
import path from "path";
import { EXTRACT_DIR } from "../utils/file.js";

const requiredFiles = [
  "routes.txt",
  "trips.txt",
  "stop_times.txt",
  "calendar.txt",
  "calendar_dates.txt",
  "stops.txt"
];

export function verifyGTFSFiles() {
  console.log("🔍 Debug - EXTRACT_DIR dans verify.js:", EXTRACT_DIR);
  console.log("🔍 Vérification dans :", EXTRACT_DIR);

  for (const file of requiredFiles) {
    const filePath = path.join(EXTRACT_DIR, file);
    console.log("🔍 Vérification du fichier :", JSON.stringify(filePath));

    if (!fs.existsSync(filePath)) {
      throw new Error(`⚠️ Fichier introuvable : ${filePath}`);
    }

    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} (${(stats.size / 1024 / 1024).toFixed(2)} Mo)`);
  }
  console.log("✅ Tous les fichiers GTFS requis sont présents.");
}
