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
      <p class="loading" ref="scrollTarget"><span>Chargement des arrêts...</span></p>
    </div>

    <StopSelector 
      v-if="selectedDirection && stops.length > 0" 
      :stops="stops" 
      @stopSelected="handleStopSelection" 
    />

    <div v-if="selectedStop || scheduleMode">
      <div class="nextOrLast">
        <button 
          @click="scheduleMode = 'next'"
          :class="['choiceBtn',{ active: scheduleMode === 'next', 'selected-choice': scheduleMode === 'next' }]"
          ref="scrollTarget">
          Voir les PROCHAINS trains
        </button>
        <button 
          @click="scheduleMode = 'last'"
          :class="['choiceBtn',{ active: scheduleMode === 'last',  'selected-choice': scheduleMode === 'last' }]">
          Voir les DERNIERS trains
        </button>
      </div>
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
  import { ref, watch } from "vue";
  import { useDirections } from "../composables/api/useDirections";
  import { useTrainTimes } from "../composables/api/useTrainTimes";
  import LineSelector from "../components/LineSelector.vue";
  import DirectionSelector from "../components/DirectionSelector.vue";
  import StopSelector from "../components/StopSelector.vue";
  import TrainSchedule from "../components/TrainSchedule.vue";
  import { useStops} from "../composables/api/useStops.js"
  import { useAutoScroll } from "../composables/useAutoScroll";

  const selectedLine = ref(null);
  const selectedDirection = ref(null);
  const stops = ref([]);
  const selectedStop = ref(null);
  const selectedStopName = ref(null);
  const transformedLineId = ref(null);
  const trainTimes = ref([]);
  const scheduleMode = ref('');
  const directions = ref([]);
  const isLoadingDirections = ref(false);
  const isLoadingStops = ref(false);
  const isLoadingSchedules = ref(false);
  const { scrollTarget, triggerScroll } = useAutoScroll();
  const { getStopsFromBackend } = useStops();
  const { getNextTrainTimes } = useTrainTimes();

  // GESTION SÉLECTION LIGNE:
  const handleLineSelection = async (line) => {
    selectedLine.value = line;
    // console.log("Ligne sélectionnée :", line);
    // reset des boutons de choix de mode
    scheduleMode.value = "";
    selectedStop.value = null;
    
    selectedDirection.value = null;
    directions.value = [];
    stops.value = [];
    trainTimes.value = [];
    isLoadingDirections.value = true;

    await triggerScroll(true);

    // Récupération des directions et arrêts depuis useDirections
    const { getDirections } = useDirections();
    const { stops: fetchedStops, transformedLineId: lineId } = await getDirections(line);
    stops.value = fetchedStops;
    console.log("Arrêts récupérés dans handleLineSelection :", stops.value);

    transformedLineId.value = lineId;

    isLoadingDirections.value = false;
    
    console.log("Résultat de useDirections :", fetchedStops);
    console.log("Arrêts récupérés :", stops.value);
  };

  // GESTION SÉLECTION DIRECTION:
  const handleDirectionSelection = async (direction) => {
    selectedDirection.value = direction;
    console.log("Direction sélectionnée ds homeview:", direction);

    // reset des boutons de choix de mode
    scheduleMode.value = "";
    selectedStop.value = null;

    // Une fois la direction sélectionnée, on récupère les arrets en db
    stops.value = [];
    trainTimes.value = [];
    selectedStop.value = null;
    selectedStopName.value = null;
    isLoadingStops.value = true;

    await triggerScroll(true);

    const fetchedStops = await getStopsFromBackend(transformedLineId.value, direction.id);
    stops.value = fetchedStops;

    isLoadingStops.value = false;

    console.log("Arrêts récupérés depuis le backend :", stops.value);
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

    // reset si changement d'arrêt:
    scheduleMode.value = "";

    await triggerScroll(true);
  };

  // CHOIX DU MODE D'AFFICHAGE:
  watch(scheduleMode, async (mode) => {
    if(!mode || !selectedStop.value) return;

    isLoadingSchedules.value = true;
    await triggerScroll(true);

    try {
      if (mode === "next") {
        trainTimes.value = await getNextTrainTimes(selectedStop.value, transformedLineId.value);
      } else {
        trainTimes.value = await getLastTrainTimes(selectedStop.value, transformedLineId.value);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des horaires :", error);
      trainTimes.value = [];
    } finally {
      isLoadingSchedules.value = false;
    }
  });

  // GESTION RÉCUPÉRATION DES HORAIRES:
  // const fetchTrainTimes = async () => {
  //   console.log("Valeur de selectedStop :", selectedStop.value);
  //   console.log("Valeur de transformedLineId :", transformedLineId.value);

  //   if (!selectedStop.value || !transformedLineId.value) {
  //     console.warn("Arrêt ou ligne non sélectionné !");
  //     return;
  //   }

  //   console.log("Récupération des horaires pour :", selectedStop.value, transformedLineId.value);

  //   const { getNextTrainTimes } = useTrainTimes();
  //   const response = await getNextTrainTimes(selectedStop.value, transformedLineId.value);
  //   if (response) {
  //     trainTimes.value = response; // Stocker les résultats
  //     console.log("Horaires des derniers trains :", trainTimes.value);
  //   }
  // };
</script>
<style scoped>
  .nextOrLast {
    display: flex;
    justify-content: center;
    margin: 15vh 0 10vh 0;
  }
  .choiceBtn {
    font-family: "Doto", sans-serif;
    font-size: 1.5rem;
    font-weight: bold;
    background-color: #000;
    color: #ffd700;
    min-height : 10vh;
    margin: 0 1rem;
    padding: 1em;
    border: none;  
    transition: 0.3s;
  }
  .choiceBtn:hover { 
    cursor: pointer;
    outline: 0.2rem dotted #ffd700;
    outline-offset: 2px;
  }
</style>