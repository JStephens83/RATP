// download/unzip/cleanup
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import unzipper from "unzipper";

const WORKDIR = path.resolve("data");
const ZIP_PATH = path.join(WORKDIR, "gtfs.zip");
const EXTRACT_DIR = path.join(WORKDIR, "gtfs");

export async function ensureDirs() {
  if (!fs.existsSync(WORKDIR)) fs.mkdirSync(WORKDIR);
  if (!fs.existsSync(EXTRACT_DIR)) fs.mkdirSync(EXTRACT_DIR);
}

export async function downloadZip(url, apiKey) {
  const res = await fetch(url, {
    headers: apiKey ? { apikey: apiKey } : {}
  });
  if (!res.ok) throw new Error(`Erreur téléchargement: ${res.status} ${res.statusText}`);
  await new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(ZIP_PATH);
    res.body.pipe(stream);
    res.body.on("error", reject);
    stream.on("finish", resolve);
  });
}

export async function unzip() {
  await fs.createReadStream(ZIP_PATH).pipe(unzipper.Extract({ path: EXTRACT_DIR })).promise();
}

export async function cleanup() {
  if (fs.existsSync(ZIP_PATH)) fs.unlinkSync(ZIP_PATH);
  if (fs.existsSync(EXTRACT_DIR)) {
    fs.readdirSync(EXTRACT_DIR).forEach((f) => fs.unlinkSync(path.join(EXTRACT_DIR, f)));
    fs.rmdirSync(EXTRACT_DIR);
  }
}

export { ZIP_PATH, EXTRACT_DIR };