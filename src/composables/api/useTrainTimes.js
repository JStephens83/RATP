import { axiosClient } from "../../composables/api/utils/axiosClient";

const API_BASE_URL_IDFM = "/api/idfm/stop-monitoring";
const API_BASE_URL_LAST_TRAIN = "/api/train-times/last";

// Fonction de récupération des prochains trains
export function useTrainTimes() {

  const getNextTrainTimes = async (selectedStop, transformedLineId) => {
    try {
      const MonitoringRef = selectedStop.replace("IDFM:", "STIF:StopPoint:Q:") + ":";
      const LineRef = transformedLineId.replace("IDFM:", "STIF:Line::") + ":";
      console.log("🛰️ Appel backend IDFM avec :", { MonitoringRef, LineRef });

      const response = await axiosClient.get(API_BASE_URL_IDFM, {
        params: { MonitoringRef, LineRef }
      });

      const monitoredStopVisits =
        response.data?.Siri?.ServiceDelivery?.StopMonitoringDelivery?.[0]?.MonitoredStopVisit;

      if (!monitoredStopVisits || !Array.isArray(monitoredStopVisits)) return [];

      return monitoredStopVisits
        .map(visit => {
          const call = visit?.MonitoredVehicleJourney?.MonitoredCall;
          if (!call) return null;

          // Formatage de l'heure en HH:mm
          const arrivalISO = call.ExpectedArrivalTime;
          const departureISO = call.ExpectedDepartureTime;
          const arrival = arrivalISO ? new Date(arrivalISO).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : null;
          const departure = departureISO ? new Date(departureISO).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : null;

          return {
            stopName: call?.StopPointName?.[0]?.value || "Arrêt inconnu",
            destination: call?.DestinationDisplay?.[0]?.value || "Destination inconnue",
            time: call?.ExpectedArrivalTime,
            expectedDeparture: call?.ExpectedDepartureTime,
            status: call?.DepartureStatus || "inconnu"
          };
        })
        .filter(Boolean);

    } catch (error) {
      console.error("❌ Erreur lors de la récupération des horaires :", error);
      return [];
    }
  };

// Fonction de récupération du dernier train depuis MongoDB
  const getLastTrainTimes = async (selectedStop, transformedLineId, directionId) => {
    try {
      const stopId = selectedStop; // ex: "IDFM:5678"
      const routeId = transformedLineId; // ex: "IDFM:1234"

      const response = await axiosClient.get(API_BASE_URL_LAST_TRAIN, {
        params: {
          stopId,
          routeId,
          directionId
        }
      });
      console.log("Réponse du backend :", response.data);

      return response.data || null;
    } catch (error) {
      console.error("Erreur lors de la récupération du dernier train (MongoDB) :", error);
      return null;
    }
  };

  return { 
    getNextTrainTimes,
    getLastTrainTimes  
  };
}