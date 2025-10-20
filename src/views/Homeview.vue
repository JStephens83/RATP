<template>
  <div>
    <LineSelector 
      @lineSelected="handleLineSelection" 
    />

    <div v-if="isLoadingDirections">
      <p class="loading"><span>Chargement des directions...</span></p>
    </div>

    <DirectionSelector
      v-if="selectedLine && !isLoadingDirections"
      :selectedLine="selectedLine"
      :directions="directions"
      @directionSelected="handleDirectionSelection"
    />

    <div v-if="isLoadingStops">
      <p class="loading"><span>Chargement des arrêts...</span></p>
    </div>

    <StopSelector 
      v-if="selectedDirection" 
      :stops="stops" 
      @stopSelected="handleStopSelection" 
    />

    <div v-if="selectedStop">
      <label>Choisir l'affichage</label>
      <select v-model="scheduleMode">
        <option value="next">Voir les PROCHAINS trains</option>
        <option value="last">Voir les DERNIERS trains</option>
      </select>
    </div>


    <div v-if="isLoadingSchedules">
      <p class="loading"><span>Chargement des horaires...</span></p>
    </div>

    <TrainSchedule 
      v-if="trainTimes.length > 0"
      :trainTimes="trainTimes"
    />
  </div>
</template>

<script setup>
  import { ref } from "vue";
  import { useDirections } from "../composables/api/useDirections";
  import { useTrainTimes } from "../composables/api/useTrainTimes";
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
  const scheduleMode = ref('next');
  const directions = ref([]);
  const isLoadingDirections = ref(false);
  const isLoadingStops = ref(false);
  const isLoadingSchedules = ref(false);

  // GESTION SÉLECTION LIGNE:
  const handleLineSelection = async (line) => {
    selectedLine.value = line;
    // console.log("Ligne sélectionnée :", line);
    selectedDirection.value = null;
    directions.value = [];
    stops.value = [];
    trainTimes.value = [];
    isLoadingDirections.value = true;

    // Récupération des directions et arrêts depuis useDirections
    const { getDirections } = useDirections();
    const { stops: fetchedStops, transformedLineId: lineId } = await getDirections(line);
    stops.value = fetchedStops;
    transformedLineId.value = lineId;

    isLoadingDirections.value = false;
    
    console.log("Résultat de useDirections :", fetchedStops);
    console.log("Arrêts récupérés :", stops.value);
  };

  // GESTION SÉLECTION DIRECTION:
  const handleDirectionSelection = (direction) => {
    selectedDirection.value = direction;
    // console.log("Direction sélectionnée :", direction);
  };

  // GESTION SÉLECTION ARRÊT:
  const handleStopSelection = async (stopId) => {
    console.log("Arrêt sélectionné :", stopId, typeof stopId);
    console.log("IDs disponibles :", stops.value.map(s => [s.id, typeof s.id]));
    // Vérification si stopId se trouve dans filteredStops
    const matchingStop = stops.value.find(stop => stop.id === stopId);
    
    // Si une correspondance est trouvée, récupération du nom de l'arrêt sinon "Nom inconnu"
    selectedStopName.value = matchingStop ? matchingStop.name : "Nom inconnu";
    // console.log("Nom de l'arrêt sélectionné :", selectedStopName.value);
    // console.log("Aucune correspondance trouvée pour l'arrêt sélectionné.");
    
    // Mise à jour de l'arrêt sélectionné
    selectedStop.value = stopId;
    
    // réinitialisation des horaires:
    trainTimes.value = [];

    // Affichage message de chargement
    isLoadingSchedules.value = true;
    
    // Récupération des horaires
    const { getNextTrainTimes, getLastTrainTimes } = useTrainTimes();
    let response;

    // Choix entre prochains ou derniers trains
    if (scheduleMode.value === "last") {
      response = await getLastTrainTimes(selectedStop.value, transformedLineId.value);
    } else {
      response = await getNextTrainTimes(selectedStop.value, transformedLineId.value);
    }

    if (response) {
      trainTimes.value = response;
      // console.log("Horaires des derniers trains :", trainTimes.value);
    }

    // Masquer le message de chargement
    isLoadingSchedules.value = false;
  };

  // GESTION RÉCUPÉRATION DES HORAIRES:
  const fetchTrainTimes = async () => {
    console.log("Valeur de selectedStop :", selectedStop.value);
    console.log("Valeur de transformedLineId :", transformedLineId.value);

    if (!selectedStop.value || !transformedLineId.value) {
      console.warn("Arrêt ou ligne non sélectionné !");
      return;
    }

    console.log("Récupération des horaires pour :", selectedStop.value, transformedLineId.value);

    const { getNextTrainTimes } = useTrainTimes();
    const response = await getNextTrainTimes(selectedStop.value, transformedLineId.value);
    if (response) {
      trainTimes.value = response; // Stocker les résultats
      console.log("Horaires des derniers trains :", trainTimes.value);
    }
  };
</script>
