import { axiosClient } from "../../composables/api/utils/axiosClient";

const API_BASE_URL_STOPS = "idfm/marketplace/stop-monitoring";

export function useTrainTimes() {

  const getNextTrainTimes = async (selectedStop, transformedLineId) => {
    try {
      const stopId = selectedStop.replace("IDFM:", "STIF:StopPoint:Q:") + ":";
      const ligneIdTrainTimes = transformedLineId.replace("IDFM:", "STIF:Line::") + ":";
      console.log("ligneIdTrainTimes", ligneIdTrainTimes);

      const response = await axiosClient.get(API_BASE_URL_STOPS, {
        params: {
          MonitoringRef: stopId,
          LineRef: ligneIdTrainTimes
        }
      });

      const monitoredStopVisits = response.data?.Siri?.ServiceDelivery?.StopMonitoringDelivery?.[0]?.MonitoredStopVisit;
      console.log("monitoredStopVisits", response.data?.Siri?.ServiceDelivery?.StopMonitoringDelivery);
      
      if (!monitoredStopVisits || !Array.isArray(monitoredStopVisits)) return [];

      return monitoredStopVisits
        .map(visit => {
          const time = visit?.MonitoredVehicleJourney?.MonitoredCall?.ExpectedArrivalTime;
          console.log("Heure d'arrivée prévue :", time);
          return time ? { time } : null;
        })
        .filter(Boolean);

    } catch (error) {
      console.error("Erreur lors de la récupération des horaires :", error);
      return [];
    }
  };

  return { 
    getNextTrainTimes,
    // getLastTrainTimes  
  };
}