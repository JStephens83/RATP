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
      v-if="selectedDirection" 
      :stops="stops" 
      @stopSelected="handleStopSelection" 
    />
    <div v-if="isLoading">
      <p>Chargement des horaires...</p>
    </div>
    
    <TrainSchedule 
      v-if="trainTimes.length > 0"
      :trainTimes="trainTimes"
    />
    
    <!-- <button @click="fetchTrainTimes">Afficher les horaires</button> -->

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
  const isLoading = ref(false);

  // GESTION SÉLECTION LIGNE:
  const handleLineSelection = async (line) => {
    selectedLine.value = line;
    // console.log("Ligne sélectionnée :", line);

    // Récupération des directions et arrêts depuis getDirections
    const { stops: fetchedStops, transformedLineId: lineId } = await getDirections(line);
    stops.value = fetchedStops;
    transformedLineId.value = lineId;
    
    // console.log("Résultat de getDirections :", fetchedStops);
    // console.log("Arrêts récupérés :", stops.value);
  };

  // GESTION SÉLECTION DIRECTION:
  const handleDirectionSelection = (direction) => {
    selectedDirection.value = direction;
    // console.log("Direction sélectionnée :", direction);
  };

  // GESTION SÉLECTION ARRÊT:
  const handleStopSelection = async (stopId) => {
    // console.log("Arrêt sélectionné :", stopId);  
    // Vérification si stopId se trouve dans filteredStops
    const matchingStop = stops.value.find(stop => stop.id === stopId);

    if (matchingStop) {
      // Si une correspondance est trouvée, récupération du nom de l'arrêt
      selectedStopName.value = matchingStop.name;
      // console.log("Nom de l'arrêt sélectionné :", selectedStopName.value);
    } else {
      // Si pas de correspondance
      selectedStopName.value = "Nom inconnu";
      // console.log("Aucune correspondance trouvée pour l'arrêt sélectionné.");
    }

    // Mise à jour de l'arrêt sélectionné
    selectedStop.value = stopId;
    
    // Affichage message de chargement
    isLoading.value = true;
    
    // Récupération des horaires
    const response = await getLastTrainTimes(selectedStop.value, transformedLineId.value);
    if (response) {
      trainTimes.value = response;
      // console.log("Horaires des derniers trains :", trainTimes.value);
    }

    // Masquer le message de chargement
    isLoading.value = false;
  };

  // GESTION RÉCUPÉRATION DES HORAIRES:
  /*const fetchTrainTimes = async () => {
    // console.log("Valeur de selectedStop :", selectedStop.value);
    // console.log("Valeur de transformedLineId :", transformedLineId.value);

    if (!selectedStop.value || !transformedLineId.value) {
      console.warn("Arrêt ou ligne non sélectionné !");
      return;
    }

    // console.log("Récupération des horaires pour :", selectedStop.value, transformedLineId.value);

    const response = await getLastTrainTimes(selectedStop.value, transformedLineId.value);
    if (response) {
      trainTimes.value = response; // Stocker les résultats
      // console.log("Horaires des derniers trains :", trainTimes.value);
    }
  };*/
</script>
