import fs from "fs";
import path from "path";
import { parse } from "csv-parse";
import { getDb } from "./client.js";
import { EXTRACT_DIR } from "../utils/file.js";

export async function importFileToCollection(fileName, collectionName, batchSize = 5000, filterFn = null, stripFn = null) {
  const db = await getDb();
  const collection = db.collection(collectionName);
  
  try {
    await collection.dropIndexes();
  } catch (e) {
    if (e.codeName !== "IndexNotFound") console.warn(e.message);
  }
  await collection.deleteMany({});
  
  return new Promise((resolve, reject) => {
    const batch = [];
    let count = 0;
    let processing = false;
    
    const filePath = path.join(EXTRACT_DIR, fileName);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Fichier introuvable : ${filePath}`);
    } else {
      console.log(`📄 Lecture du fichier : ${filePath}`);
    }

    const stream = fs.createReadStream(path.join(EXTRACT_DIR, fileName))
      .pipe(parse({ columns: true, skip_empty_lines: true }));
    
    stream.on("data", (row) => {
      if (filterFn && !filterFn(row)) return;
      const cleaned = stripFn ? stripFn(row) : row;
      batch.push(cleaned);
      
      if (batch.length >= batchSize && !processing) {
        processing = true;
        stream.pause();
        
        collection.insertMany(batch.splice(0, batch.length))
          .then((result) => {
            // count += batchSize;
            count += result.insertedCount;
            processing = false;
            stream.resume();
          })
          .catch(reject);
      }
    });
    
    stream.on("end", () => {
      if (batch.length > 0) {
        collection.insertMany(batch)
          .then((result) => {
            count += result.insertedCount;
            console.log(`✅ ${count} lignes importées dans ${collectionName}`);
            resolve(count);
          })
          .catch(reject);
      } else {
        console.log(`✅ ${count} lignes importées dans ${collectionName}`);
        resolve(count);
      }
    });
    
    stream.on("error", reject);
  });
}