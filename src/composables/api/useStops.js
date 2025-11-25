// 2. Fonction de récupéraiton des arrêts de métro (en API)

// const API_BASE_URL_STOP_NAMES = "api/marketplace/icar/getData?format=json&GeneralGroupOfEntities=false&multimodalStopPlace=false&monomodalStopPlace=true&Quay_FR1=true&Quay_LOC=true&StopPlaceEntrance=false&destinations=true&TransportMode=metro";

export function useStops() {
  // Récupération depuis MongoDB via l'API interne
  const getStopsFromBackend = async (lineId, directionId) => {
    try {
      const transformedLineId = lineId.replace("FR1:Line:", "IDFM:");
      const response = await fetch(`/api/stops?line=${transformedLineId}&direction=${directionId}`);
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération des arrêts depuis le backend :", error);
      return [];
    }
  };
  
  return { getStopsFromBackend };
}