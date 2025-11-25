// download/unzip/cleanup
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import unzipper from "unzipper";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env.local" });

const WORKDIR = process.env.WORKDIR || path.resolve(__dirname, "../db");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXTRACT_DIR = path.resolve(__dirname, "../db/gtfsData");
const ZIP_PATH = path.resolve(__dirname, "../db/gtfsData/gtfs.zip");

export async function ensureDirs() { 
  console.log("🔍 Debug - EXTRACT_DIR:", EXTRACT_DIR);
  console.log("🔍 Debug - __dirname:", __dirname);
  // true crée aussi les dossiers parents si nécessaire
  fs.mkdirSync(WORKDIR, { recursive: true });
  fs.mkdirSync(EXTRACT_DIR, { recursive: true });
  console.log("📁 Dossiers créés/vérifiés :", EXTRACT_DIR);
}

export async function downloadZip(url, apiKey) {
  console.log("📥 Téléchargement du ZIP depuis :", url);

  const res = await fetch(url, {
    headers: apiKey ? { apikey: apiKey } : {}
  });

  if (!res.ok) {
    throw new Error(`❌ Erreur téléchargement: ${res.status} ${res.statusText}`);
  }

  const fileStream = fs.createWriteStream(ZIP_PATH);

  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    fileStream.on("finish", () => {
      fileStream.close(resolve); 
    });
    fileStream.on("error", reject);
  });

  // Vérification finale
  if (!fs.existsSync(ZIP_PATH)) {
    throw new Error("❌ ZIP introuvable après téléchargement.");
  }

  const size = fs.statSync(ZIP_PATH).size;
  console.log("✅ ZIP téléchargé :", ZIP_PATH);
  console.log("📏 Taille ZIP :", size.toLocaleString(), "octets");

  if (size < 100000) {
    throw new Error("⚠️ ZIP trop petit, probablement corrompu ou incomplet.");
  }
}

export async function unzip() {
  const allowedFiles = new Set([
    "calendar.txt",
    "calendar_dates.txt",
    "routes.txt",
    "stop_times.txt",
    "stops.txt",
    "trips.txt"
  ]);

  console.log("📦 Extraction GTFS en cours...");

  return new Promise((resolve, reject) => {
    const extractionPromises = [];

    fs.createReadStream(ZIP_PATH)
      .pipe(unzipper.Parse())
      .on("entry", (entry) => {
        const fileName = entry.path;
        console.log("📄 Fichier trouvé :", fileName);

        if (allowedFiles.has(fileName)) {
          const outputPath = path.join(EXTRACT_DIR, fileName);
          const writeStream = fs.createWriteStream(outputPath);

          // Attentte que chaque fichier soit complètement écrit
          const promise = new Promise((res, rej) => {
            writeStream.on("finish", () => {
              console.log(`✅ ${fileName} extrait`);
              res();
            });
            writeStream.on("error", rej);
          });

          entry.pipe(writeStream);
          extractionPromises.push(promise);
        } else {
          entry.autodrain();
        }
      })
      .on("close", async () => {        
        try {
          // Attente que TOUS les fichiers soient écrits
          await Promise.all(extractionPromises);
          console.log(`✅ ${extractionPromises.length} fichiers extraits avec succès`);
          resolve();
        } catch (err) {
          reject(err);
        }
      })
      .on("error", (err) => {
        console.error("❌ Erreur lors de l'extraction :", err);
        reject(err);
      });
  });
}

export async function cleanup() {
  console.log("🧹 Nettoyage du fichier zip");
  if (fs.existsSync(ZIP_PATH)) {
    fs.unlinkSync(ZIP_PATH);
    console.log("✅ ZIP supprimé");
  }
}

export { ZIP_PATH, EXTRACT_DIR };