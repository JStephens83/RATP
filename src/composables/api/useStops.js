import stopsData from "../../assets/arrets-lignes.json";
import { axiosClient } from "../../composables/api/utils/axiosClient";

const API_BASE_URL_STOP_NAMES = "api/marketplace/icar/getData?idrefa=463181&format=json&GeneralGroupOfEntities=false&multimodalStopPlace=false&monomodalStopPlace=true&Quay_FR1=true&Quay_LOC=true&StopPlaceEntrance=false&destinations=true&TransportMode=metro";

export function useStops() {

  // Mapping local stop_id -> stop_name
  const fetchStopsFromOpenData = async () => {
    try {
      const metroStops = stopsData.filter(item => item.mode === "Metro");
      return metroStops.reduce((acc, item) => {
        acc[item.stop_id] = item.stop_name;
        return acc;
      }, {});
    } catch (error) {
      console.error("Erreur lors de la récupération des arrêts locaux :", error);
      return {};
    }
  };

  // Récupération API
  const fetchStops = async () => {
    try {
      const response = await axiosClient.get(API_BASE_URL_STOP_NAMES);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des infos des arrêts :", error);
      return [];
    }
  };

  return { fetchStopsFromOpenData, fetchStops };
}