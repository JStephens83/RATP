// scripts/gtfs-import.js
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import unzipper from "unzipper";
import { MongoClient } from "mongodb";
import { parse } from "csv-parse";

const GTFS_URL = process.env.GTFS_URL;
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || "idfm";
const COLLECTION_LAST = process.env.COLLECTION_LAST || "last_train";
const COLLECTION_TEN = process.env.COLLECTION_TEN || "last_trains";
const TARGET_STOP_ID = process.env.TARGET_STOP_ID;

const WORKDIR = path.resolve("data");
const ZIP_PATH = path.join(WORKDIR, "gtfs.zip");
const EXTRACT_DIR = path.join(WORKDIR, "gtfs");

async function ensureDirs() {
  if (!fs.existsSync(WORKDIR)) fs.mkdirSync(WORKDIR);
  if (!fs.existsSync(EXTRACT_DIR)) fs.mkdirSync(EXTRACT_DIR);
}

async function downloadZip() {
  const res = await fetch(GTFS_URL);
  if (!res.ok) throw new Error(`Erreur téléchargement: ${res.statusText}`);
  await new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(ZIP_PATH);
    res.body.pipe(stream);
    res.body.on("error", reject);
    stream.on("finish", resolve);
  });
}

async function unzip() {
  await fs.createReadStream(ZIP_PATH).pipe(unzipper.Extract({ path: EXTRACT_DIR })).promise();
}

async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const records = [];
    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on("data", (row) => records.push(row))
      .on("end", () => resolve(records))
      .on("error", reject);
  });
}

function hhmmssToSeconds(hhmmss) {
  const [h, m, s] = hhmmss.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}

function secondsToHHMM(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

async function computeTrains() {
  const stopTimes = await parseCSV(path.join(EXTRACT_DIR, "stop_times.txt"));
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];

  const departures = stopTimes
    .filter((row) => row.stop_id === TARGET_STOP_ID)
    .map((row) => hhmmssToSeconds(row.departure_time || row.arrival_time))
    .sort((a, b) => a - b);

  if (departures.length === 0) return null;

  // Dernier train
  const lastTrain = departures[departures.length - 1];

  // 10 derniers trains
  const lastDepartures = departures.slice(-10);

  return {
    date: dateStr,
    station_id: TARGET_STOP_ID,
    lastTrain: {
      time: secondsToHHMM(lastTrain),
      alert_time: secondsToHHMM(lastTrain - 15 * 60),
    },
    lastTrains: lastDepartures.map(secondsToHHMM),
  };
}

async function saveToMongo(result) {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  // Collection "last_train"
  const colLast = db.collection(COLLECTION_LAST);
  await colLast.deleteMany({ station_id: result.station_id, date: result.date });
  await colLast.insertOne({
    station_id: result.station_id,
    date: result.date,
    last_train: result.lastTrain.time,
    alert_time: result.lastTrain.alert_time,
  });

  // Collection "last_trains"
  const colTen = db.collection(COLLECTION_TEN);
  await colTen.deleteMany({ station_id: result.station_id, date: result.date });
  await colTen.insertOne({
    station_id: result.station_id,
    date: result.date,
    last_trains: result.lastTrains,
  });

  await client.close();
}

async function cleanup() {
  if (fs.existsSync(ZIP_PATH)) fs.unlinkSync(ZIP_PATH);
  if (fs.existsSync(EXTRACT_DIR)) {
    fs.readdirSync(EXTRACT_DIR).forEach((f) => fs.unlinkSync(path.join(EXTRACT_DIR, f)));
    fs.rmdirSync(EXTRACT_DIR);
  }
}

(async function main() {
  try {
    await ensureDirs();
    await downloadZip();
    await unzip();
    const result = await computeTrains();
    if (result) {
      await saveToMongo(result);
      console.log(`Dernier train : ${result.lastTrain.time} (alerte à ${result.lastTrain.alert_time})`);
      console.log(`10 derniers trains : ${result.lastTrains.join(", ")}`);
    } else {
      console.log("Aucun train trouvé pour aujourd'hui.");
    }
  } catch (e) {
    console.error("Erreur:", e);
    process.exitCode = 1;
  } finally {
    await cleanup();
  }
})();
