import axios from "axios";
import linesData from "../assets/lines.json";
import stopsData from "../assets/arrets-lignes.json";

const API_KEY = import.meta.env.VITE_RATP_API_KEY;
// const API_BASE_URL_LINES = "/api/marketplace/ilico/getData?method=getlc&format=json&TransportMode=metro";
const API_BASE_URL_TIMES = "/api/marketplace/estimated-timetable";
const API_BASE_URL_STOPS = "api/marketplace/stop-monitoring?";
const API_BASE_URL_STOP_NAMES = "api/marketplace/icar/getData?idrefa=463181&format=json&GeneralGroupOfEntities=false&multimodalStopPlace=false&monomodalStopPlace=true&Quay_FR1=true&Quay_LOC=true&StopPlaceEntrance=false&destinations=true&TransportMode=metro";

// Données locales :
export const getLines = async () => {
  console.log("Données lignes: ", linesData.dataObjects.CompositeFrame.frames.GeneralFrame[1].members.Line)
  return linesData.dataObjects.CompositeFrame.frames.GeneralFrame[1].members.Line.map(line => ({
    name: line.ShortName,
    id: line.id,
    color: "#" + line.Presentation.Colour,
    textColor: "#" + line.Presentation.TextColour,
  }));; 
};

//////////////////////////////////////////
// Fonction officielle:
// export const getLines = async () => {
//   try {
//     const response = await axios.get(`${API_BASE_URL_LINES}`, {
//       headers: { 
//         "apikey": API_KEY,
//         "Accept": "application/json"
//       }
//     });
//     console.log("Réponse API :", response.data);

//     return response.data.dataObjects.CompositeFrame.frames.GeneralFrame[1].members.Line.map(line => ({
//       name: line.ShortName,
//       id: line.id,
//     }));
//   }
//    catch (error) {
//     console.error("Erreur lors de la récupération des lignes :", error.response?.data || error.message);
//     return [];
//   }
// };
//////////////////////////////////////////

// Récup données + Comparaison id arrêt <=> nom arret :
export const fetchStopsFromOpenData = async () => {
  try {
    console.log("Données stops : ", stopsData);
    const metroStops = stopsData.filter(item => item.mode === "Metro");
    console.log("Arrêts filtrés (mode Métro) :", metroStops);
 
    // Mapping entre  IDs des arrêts et leurs noms + Association stop_id à stop_name
    const stopMapping = metroStops.reduce((acc, item) => {
      acc[item.stop_id] = item.stop_name;
      return acc;
    }, {});

    console.log("Mapping des arrêts depuis fetchStopsFromOpenData:", stopMapping);
    return stopMapping;

  } catch (error) {
    console.error("Erreur lors de la récupération des arrêts :", error);
    return [];
  }
};

// Récup des directions
export const getDirections = async (lineId) => {
  try {
    const transformedLineId = lineId.id.replace("FR1:Line:", "STIF:Line::");
    console.log("ID transformé :", transformedLineId);
    
    const response = await axios.get(`${API_BASE_URL_TIMES}`, {
      headers: { 
        "apikey": API_KEY,
        "Accept" : "application/json" 
      },
      params: { LineRef: transformedLineId }
    });
    console.log("Réponse API directions :", response.data);

    // Extraction des directions
    const vehicleJourneys = response.data?.Siri?.ServiceDelivery?.EstimatedTimetableDelivery?.[0]?.EstimatedJourneyVersionFrame?.[0]?.EstimatedVehicleJourney;
    console.log("vehicleJourneys :", vehicleJourneys)

    if (!vehicleJourneys || !Array.isArray(vehicleJourneys)) {
      console.warn("Aucune donnée trouvée pour les directions.");
      return [];
    }
    
    // Appel fetchStopsFromOpenData pour récupérer stopMapping
    const stopMapping = await fetchStopsFromOpenData();
    console.log("Mapping des arrêts dans getDirections:", stopMapping);

    // EXTRACTION des STOPPOINTREF dans vehicleJourneys et suppression doublons : 
    const stopPointRefs = vehicleJourneys
      .flatMap(journey => {
        if (journey.EstimatedCalls && Array.isArray(journey.EstimatedCalls.EstimatedCall)) {
          return journey.EstimatedCalls.EstimatedCall.map(call => call.StopPointRef.value);
        }
        return [];
      })
      .filter((value, index, self) => value && self.indexOf(value) === index); 

    console.log("StopPointRef extraits :", stopPointRefs);
    
    // Récup des IDs des stopPointRef pour comparaison:
    const filteredStops = stopPointRefs
      .map(ref => {
        const extractedId = ref.match(/:(\d+):$/)?.[1]; 
        // console.log("ID après expression régulière :", extractedId);
        return extractedId;
      })
      .filter(id => {
        // Vérif si ID extrait est contenu dans une des clés de stopMapping
        const isContained = Object.keys(stopMapping).some(key => key.includes(id));
        // console.log(`L'ID ${id} est contenu dans stopMapping :`, isContained);
        return id && isContained;
      })
      .map(id => {
        // Recherche clé correspondante dans stopMapping
        const matchingKey = Object.keys(stopMapping).find(key => key.includes(id));
        return {
          id: matchingKey,
          name: stopMapping[matchingKey],
        };
      })
      .filter((stop, index, self) => 
        // Filtrage des doublons par noms
        index === self.findIndex(s => s.name === stop.name) 
      );

    console.log("Arrêts correspondants entre stopPointRefs & stopMapping:", filteredStops);
    
    // EXTRACTION des noms des DIRECTIONS et suppression doublons
    const directions = vehicleJourneys
      .map(journey => journey.DirectionName?.[0]?.value)
      .filter((value, index, self) => value && self.indexOf(value) === index);

    return {
      directions: directions.map((direction, index) => ({
        id: index.toString(),
        name: direction
      })),
      stops: filteredStops,
      transformedLineId
    };

    
  } catch (error) {
    console.error("Erreur lors de la récupération des directions :", error);
    return { directions: [], stops: [], transformedLineId: null  };
  }
};

// Récupération des arrêts
export const fetchStops = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL_STOP_NAMES}`, {
      headers: { 
        "apikey": API_KEY,
        "Accept" : "application/json" 
       }
    });

    // console.log("réponse fetchStops",JSON.stringify(response.data, null, 2)); // Affiche les données formatées
    console.dir('response fetchStop()', response.data, { depth: null });
    return response.data
  } catch (error) {
    console.error("Erreur lors de la récupération des infos des arrêts :", error); 
    return [];
  }
}

// Récupération des horaires
export const getLastTrainTimes = async (selectedStop, transformedLineId) => {
  try {
    const stopId = selectedStop.replace("IDFM:", "STIF:StopPoint:Q:") + ":";

    // Appel à l'API
    const response = await axios.get(API_BASE_URL_STOPS, {
      headers: { 
        "apikey": API_KEY,
        "Accept": "application/json"
      },
      params: {
        MonitoringRef: stopId,
        LineRef: transformedLineId
      }
    });

    console.log("URL API derniers trains :", response);
    console.log("Réponse API derniers trains :", response.data);
    
    // Extraction horaires derniers trains
    const monitoredStopVisits = response.data?.Siri?.ServiceDelivery?.StopMonitoringDelivery?.[0]?.MonitoredStopVisit;

    if (!monitoredStopVisits || !Array.isArray(monitoredStopVisits)) {
      console.warn("Aucune donnée trouvée pour les horaires des derniers trains.");
      return [];
    }

    // Itération et extraction des horaires
    const trainTimes = monitoredStopVisits.map(visit => {
      const expectedArrivalTime = visit?.MonitoredVehicleJourney?.MonitoredCall?.ExpectedArrivalTime;
      return expectedArrivalTime ? { time: expectedArrivalTime } : null;
    }).filter(item => item !== null);

    console.log("Horaires des derniers trains extraits :", trainTimes);
    return trainTimes;

  } catch (error) {
    console.error("Erreur lors de la récupération des horaires des derniers trains :", error);
    return null;
  }
};