import { addDays } from "date-fns";

// Conversion horaire
export function hhmmssToSeconds(hhmmss) {
  const [h, m, s] = hhmmss.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}

export function secondsToHHMM(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Fonction utilitaire pour convertir une heure GTFS (HH:MM:SS) en objet Date (peut dépasser 24h)
export function parseGTFSTime(gtfsTime, serviceDate) {
  const [hours, minutes, seconds] = gtfsTime.split(':').map(Number);
  
  // Parse la date de service (format YYYYMMDD)
  const year = parseInt(serviceDate.substring(0, 4));
  const month = parseInt(serviceDate.substring(4, 6)) - 1; // Mois en base 0
  const day = parseInt(serviceDate.substring(6, 8));
  
  let date = new Date(year, month, day);
  
  // Si l'heure >= 24, c'est le lendemain
  if (hours >= 24) {
    date = addDays(date, 1);
    date.setHours(hours - 24, minutes, seconds, 0);
  } else {
    date.setHours(hours, minutes, seconds, 0);
  }
  
  return date;
}