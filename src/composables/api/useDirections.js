// 3. Fonction de récupération des directions

// Récupération des direction via l'api interne MongoDB
export function useDirections() {
  const getDirections = async (lineId) => {
    try {
      const transformedLineId = lineId.id.replace("FR1:Line:", "IDFM:").replace(/:$/, "");
      const response = await fetch(`/api/directions?line=${transformedLineId}`);
      const directions = await response.json(); 
      console.log("Réponse brute de /api/directions :", directions);

      return { directions, stops: [], transformedLineId };
    } catch (error) {
      console.error("Erreur lors de la récupération des directions :", error);
      return { directions: [], stops: [], transformedLineId: null };
    }
  };

  return { getDirections };
}

// Récupération ds directions vie l'API RATP:

// import { axiosClient } from "../../composables/api/utils/axiosClient";
// import { useStops } from "./useStops";

// const API_BASE_URL_TIMES = "/api/marketplace/estimated-timetable";

// export function useDirections() {
//   // const { fetchStopsFromOpenData } = useStops();
//   const { fetchStops } = useStops();

//   // Récupération des directions pour une ligne donnée
//   const getDirections = async (lineId) => {
//     try {
//       const transformedLineId = lineId.id.replace("FR1:Line:", "STIF:Line::");

//       const response = await axiosClient.get(API_BASE_URL_TIMES, {
//         params: { LineRef: transformedLineId }
//       });

//       const vehicleJourneys = response.data?.Siri?.ServiceDelivery?.EstimatedTimetableDelivery?.[0]?.EstimatedJourneyVersionFrame?.[0]?.EstimatedVehicleJourney;
//       if (!vehicleJourneys || !Array.isArray(vehicleJourneys)) return [];

//       const stopMapping = await fetchStops();
//       console.log("Clés de stopMapping :", Object.keys(stopMapping).slice(0, 10));

//       // Extraction StopPointRef uniques
//       const stopPointRefs = vehicleJourneys
//         .flatMap(journey => journey.EstimatedCalls?.EstimatedCall?.map(call => call.StopPointRef.value) || [])
//         .filter((value, index, self) => value && self.indexOf(value) === index);
//       console.log("StopPointRefs bruts :", stopPointRefs);

//       const filteredStops = stopPointRefs
//         // .map(ref => ref.match(/:(\d+):$/)?.[1])
//         .map(ref => ref.split(":").slice(-2, -1)[0]) // récupère l'avant-dernier segment
//         .filter(id => id && Object.keys(stopMapping).some(key => key.includes(id)))
//         .map(id => {
//           const matchingKey = Object.keys(stopMapping).find(key => key.includes(id));
//           return { id: matchingKey, name: stopMapping[matchingKey] };
//         })
//         .filter((stop, index, self) => index === self.findIndex(s => s.name === stop.name));
//       console.log("Stops extraits dans getDirections :", filteredStops);


//       const directions = vehicleJourneys
//         .map(journey => journey.DirectionName?.[0]?.value)
//         .filter((value, index, self) => value && self.indexOf(value) === index)
//         .map((direction, index) => ({ id: index.toString(), name: direction }));
//       console.log("Directions extraites :", directions);
//       console.log("vehicleJourneys :", vehicleJourneys);


//       return { directions, stops: filteredStops, transformedLineId };
//     } catch (error) {
//       console.error("Erreur lors de la récupération des directions :", error);
//       return { directions: [], stops: [], transformedLineId: null };
//     }
//   };

//   return { getDirections };
// }