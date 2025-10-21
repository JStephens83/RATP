// 2. Fonction de récupéraiton des arrêts de métro (en local ou API)
// import stopsData from "../../assets/arrets-lignes.json";
// import { axiosClient } from "../../composables/api/utils/axiosClient";

// const API_BASE_URL_STOP_NAMES = "api/marketplace/icar/getData?format=json&GeneralGroupOfEntities=false&multimodalStopPlace=false&monomodalStopPlace=true&Quay_FR1=true&Quay_LOC=true&StopPlaceEntrance=false&destinations=true&TransportMode=metro";

export function useStops() {

  // Récupération en local: Mapping local stop_id -> stop_name
  // const fetchStopsFromOpenData = async () => {
  //   try {
  //     const metroStops = stopsData.filter(item => item.mode === "Metro");
  //     return metroStops.reduce((acc, item) => {
  //       acc[item.stop_id] = item.stop_name;
  //       console.log("Données des arrêts récupérées en local :", item);
  //       return acc;
  //     }, {});
  //   } catch (error) {
  //     console.error("Erreur lors de la récupération des arrêts locaux :", error);
  //     return {};
  //   }
  // };

  // Récupération depuis l'API
  /*const fetchStops = async () => {
    try {
      const response = await axiosClient.get(API_BASE_URL_STOP_NAMES);
      console.log("Données des arrêts récupérées depuis l'API :", response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des infos des arrêts :", error);
      return [];
    }
  };*/

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
  

  // return { fetchStopsFromOpenData, fetchStops };
  return { getStopsFromBackend };
}