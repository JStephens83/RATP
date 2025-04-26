<template>
  <div>
    <LineSelector 
      @lineSelected="handleLineSelection" 
    />

    <DirectionSelector 
      v-if="selectedLine" 
      :selectedLine="selectedLine" 
      @directionSelected="handleDirectionSelection" 
    />

    <StopSelector 
      v-if="stops.length > 0" 
      :stops="stops" 
      @stopSelected="handleStopSelection" 
    />
    
    <button @click="fetchTrainTimes">Afficher les horaires</button>

    <TrainSchedule :trainTimes="trainTimes" />
  </div>
</template>

<script setup>
  import { ref } from "vue";
  import { getDirections, getLastTrainTimes } from "../services/ratpService";
  import LineSelector from "../components/LineSelector.vue";
  import DirectionSelector from "../components/DirectionSelector.vue";
  import StopSelector from "../components/StopSelector.vue";
  import TrainSchedule from "../components/TrainSchedule.vue";

  const selectedLine = ref(null);
  const selectedDirection = ref(null);
  const stops = ref([]);
  const selectedStop = ref(null);
  const selectedStopName = ref(null);
  const transformedLineId = ref(null);
  const trainTimes = ref([]);

  const handleLineSelection = async (line) => {
    selectedLine.value = line;
    console.log("Ligne sélectionnée :", line);

    // Récupérer les directions et les arrêts depuis getDirections
    const { stops: fetchedStops, transformedLineId: lineId } = await getDirections(line);
    stops.value = fetchedStops;
    transformedLineId.value = lineId;
    
    console.log("Résultat de getDirections :", fetchedStops);
    console.log("Arrêts récupérés :", stops.value);
  };

  const handleDirectionSelection = (direction) => {
    selectedDirection.value = direction;
    console.log("Direction sélectionnée :", direction);
    // Filtrer les arrêts pour la direction sélectionnée
    // stopsForSelectedDirection.value = Object.entries(stopMapping.value)
    //   .map(([stopId, stopName]) => ({ id: stopId, name: stopName }))
  };

  const handleStopSelection = (stopId) => {
    console.log("Arrêt sélectionné :", stopId);  
      // Vérifier si stopId se trouve dans filteredStops
    const matchingStop = stops.value.find(stop => stop.id === stopId);

    if (matchingStop) {
      // Si une correspondance est trouvée, récupérer le nom de l'arrêt
      selectedStopName.value = matchingStop.name;
      console.log("Nom de l'arrêt sélectionné :", selectedStopName.value);
    } else {
      // Si aucune correspondance n'est trouvée
      selectedStopName.value = "Nom inconnu";
      console.log("Aucune correspondance trouvée pour l'arrêt sélectionné.");
    }

    // Mettre à jour l'arrêt sélectionné
    selectedStop.value = stopId;
  };

  // Gestion de la récupération des horaires
  const fetchTrainTimes = async () => {
    console.log("Valeur de selectedStop :", selectedStop.value);
    console.log("Valeur de transformedLineId :", transformedLineId.value);

    if (!selectedStop.value || !transformedLineId.value) {
      console.warn("Arrêt ou ligne non sélectionné !");
      return;
    }

    console.log("Récupération des horaires pour :", selectedStop.value, transformedLineId.value);

    const response = await getLastTrainTimes(selectedStop.value, transformedLineId.value);
    if (response) {
      trainTimes.value = response; // Stocker les résultats
      console.log("Horaires des derniers trains :", trainTimes.value);
    }
  };
</script>
