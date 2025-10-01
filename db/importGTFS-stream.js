import fs from "fs";
import path from "path";
import { parse } from "csv-parse";
import { getDb } from "./client.js";
import { EXTRACT_DIR } from "../utils/file.js";

async function importFileToCollection(fileName, collectionName, batchSize = 5000) {
  const db = await getDb();
  const collection = db.collection(collectionName);

  // Suppression des index existants pour accélérer l'import
  try {
    await collection.dropIndexes();
    console.log(`ndex supprimés sur ${collectionName}`);
  } catch (e) {
    if (e.codeName !== "IndexNotFound") console.warn(e.message);
  }

  // Vidange de la collection
  await collection.deleteMany({});

  return new Promise((resolve, reject) => {
    const batch = [];
    let count = 0;

    const stream = fs.createReadStream(path.join(EXTRACT_DIR, fileName))
      .pipe(parse({ columns: true, skip_empty_lines: true }));

    stream.on("data", async (row) => {
      batch.push(row);
      if (batch.length >= batchSize) {
        stream.pause();
        await collection.insertMany(batch.splice(0, batch.length));
        count += batchSize;
        console.log(`→ ${count} lignes insérées dans ${collectionName}`);
        stream.resume();
      }
    });

    stream.on("end", async () => {
      if (batch.length > 0) {
        await collection.insertMany(batch);
        count += batch.length;
      }
      console.log(`${count} lignes importées dans ${collectionName}`);
      resolve();
    });

    stream.on("error", reject);
  });
}

export async function importGTFSStream() {
  await importFileToCollection("routes.txt", "routes");
  await importFileToCollection("trips.txt", "trips");
  await importFileToCollection("stops.txt", "stops");
  await importFileToCollection("stop_times.txt", "stop_times");
}
