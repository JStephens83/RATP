import linesData from "../../assets/lines.json";
// import { axiosClient } from "../utils/axiosClient"; // Décommente si tu veux activer l'API distante
// const API_BASE_URL_LINES = "/api/marketplace/ilico/getData?method=getlc&format=json&TransportMode=metro";

export function useLines() {

  // Récupération locale
  const getLocalLines = async () => {
    console.log("Données lignes: ", linesData.dataObjects.CompositeFrame.frames.GeneralFrame[1].members.Line)
    return linesData.dataObjects.CompositeFrame.frames.GeneralFrame[1].members.Line.map(line => ({
      name: line.ShortName,
      id: line.id,
      color: "#" + line.Presentation.Colour,
      textColor: "#" + line.Presentation.TextColour,
    }));
  };

  // Exemple appel API officiel (si activé)
  /*
  const getRemoteLines = async () => {
    try {
      const response = await axiosClient.get(API_BASE_URL_LINES);
      return response.data.dataObjects.CompositeFrame.frames.GeneralFrame[1].members.Line.map(line => ({
        name: line.ShortName,
        id: line.id,
      }));
    } catch (error) {
      console.error("Erreur lors de la récupération des lignes :", error);
      return [];
    }
  };
  */

  return { getLocalLines /*, getRemoteLines*/ };
}