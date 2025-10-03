import fs from "fs";
import path from "path";
import { parse } from "csv-parse";
import { getDb } from "./client.js";
import { EXTRACT_DIR } from "../utils/file.js";

export async function importFileToCollection(fileName, collectionName, batchSize = 5000, filterFn = null, stripFn = null) {
  const db = await getDb();
  const collection = db.collection(collectionName);

  // On supprime les données existantes
  try {
    await collection.dropIndexes();
  } catch (e) {
    if (e.codeName !== "IndexNotFound") console.warn(e.message);
  }
  await collection.deleteMany({});

  return new Promise((resolve, reject) => {
    const batch = [];
    let count = 0;

    const stream = fs.createReadStream(path.join(EXTRACT_DIR, fileName))
      .pipe(parse({ columns: true, skip_empty_lines: true }));

    stream.on("data", async (row) => {
      if (filterFn && !filterFn(row)) return;
      const cleaned = stripFn ? stripFn(row) : row;
      batch.push(cleaned);

      if (batch.length >= batchSize) {
        stream.pause();
        await collection.insertMany(batch.splice(0, batch.length));
        count += batchSize;
        stream.resume();
      }
    });

    stream.on("end", async () => {
      if (batch.length > 0) {
        await collection.insertMany(batch);
        count += batch.length;
      }
      console.log(`✅ ${count} lignes importées dans ${collectionName}`);
      resolve(count);
    });

    stream.on("error", reject);
  });
}
