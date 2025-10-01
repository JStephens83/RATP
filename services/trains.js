import { getStopTimes } from "../db/queries.js";
import { hhmmssToSeconds, secondsToHHMM } from "../utils/time.js";

export async function computeLastTrains(stationId) {
  const stopTimes = await getStopTimes(stationId);

  const departures = stopTimes
    .map((row) => hhmmssToSeconds(row.departure_time || row.arrival_time))
    .sort((a, b) => a - b);

  if (departures.length === 0) {
    console.log("⚠️ Aucun horaire trouvé pour cet arrêt");
    return null;
  }

  const lastDepartures = departures.slice(-10);
  const lastTrain = lastDepartures[lastDepartures.length - 1];

  const result = {
    station_id: stationId,
    date: new Date().toISOString().split("T")[0],
    last_train: secondsToHHMM(lastTrain),
    last_trains: lastDepartures.map(secondsToHHMM),
    alert_time: secondsToHHMM(lastTrain - 15 * 60)
  };

  console.log("Résultat calculé :", result);
  return result;
}