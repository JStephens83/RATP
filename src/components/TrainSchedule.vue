<template>
  <div class="train-schedule">
    <h2 class="list-labels">
      {{ mode === 'next' ? 'Horaires des prochains trains' : 'Horaires des derniers trains' }}
    </h2>
    
    <ul v-if="trainTimes.length > 0" ref="scrollTarget" class="time-list">
      <li v-for="(train, index) in trainTimes" :key="train.tripId || index">

        <span v-if="mode === 'last'" class="train-rank">
          {{ trainTimes.length - index }} - 
          <span v-if="mode === 'last' && index === trainTimes.length - 1" class="last-train-label">
            DERNIER TRAIN : LAST CALL !
          </span>
        </span>

        <!-- Mode NEXT : API temps réel -->
        <template v-if="mode === 'next'">
          {{ formatTime(train.time) }} - {{ calculateTimeDifference(train.time) }}
        </template>
        
        <!-- Mode LAST : API GTFS -->
        <template v-else>
          {{ formatDepartureTime(train.departureTime) }}
        </template>
      </li>
    </ul>
    
    <div v-else-if="isLoading" class="loading">
      <p>Chargement des horaires...</p>
    </div>
    
    <div v-else class="no-trains">
      <p>{{ mode === 'next' ? 'Aucun horaire disponible.' : 'Aucun train prévu prochainement' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useAutoScroll } from "../composables/useAutoScroll";

const props = defineProps({
  trainTimes: {
    type: Array,
    required: true,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    required: true,
    validator: (value) => ['next', 'last'].includes(value)
  }
});

const { scrollTarget, triggerScroll } = useAutoScroll();

// Timer pour mettre à jour le countdown en temps réel
const countdownInterval = ref(null);

// ========== FONCTIONS POUR MODE "NEXT" (API temps réel) ==========

// Formate l'heure pour le mode "next"
const formatTime = (time) => {
  const date = new Date(time);
  return date.toLocaleTimeString("fr-FR", { 
    hour: "2-digit", 
    minute: "2-digit", 
    second: "2-digit" 
  });
};

// Calcule du délai d'arrivée pour le mode "next"
const calculateTimeDifference = (arrivalTime) => {
  const now = new Date();
  const arrival = new Date(arrivalTime);
  const differenceInMs = arrival - now;
  
  if (differenceInMs <= 0) {
    return "Train en approche / à quai";
  }
  
  const minutes = Math.floor(differenceInMs / 60000);
  const seconds = Math.floor((differenceInMs % 60000) / 1000);
  
  return `Arrive dans ${minutes} min ${seconds} sec`;
};

// ========== FONCTIONS POUR MODE "LAST" (API GTFS) ==========

// Formatage de l'heure GTFS (peut dépasser 24h)
const formatDepartureTime = (gtfsTime) => {
  if (!gtfsTime) return '--:--';
  const [hours, minutes] = gtfsTime.split(':');
  const displayHours = parseInt(hours) % 24; // Convertit 25:30 en 01:30
  return `${displayHours.toString().padStart(2, '0')}:${minutes}`;
};

// ========== WATCHERS ET LIFECYCLE ==========

watch(
  () => props.trainTimes,
  async (newVal) => {
    if (newVal.length > 0) {
      await triggerScroll(true);
    }
  },
  { immediate: true }
);

// Mise à jour du countdown chaque seconde
onMounted(() => {
  countdownInterval.value = setInterval(() => {
  }, 1000);
});

onUnmounted(() => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value);
  }
});
</script>

<style scoped>
.train-schedule div > p {
  display: block;
  width: 100%;
  text-align: center;
  font-size: 1.5rem;
  margin: 10vh 0 10vh 0;
}

.time-list {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-wrap: wrap;
}

.time-list li,
.time-list p {
  list-style-type: none;
  padding: 1em;
  margin: 0.5em;
  color: #fff;
  font-size: 1.5rem;
  min-width: 10vw;
  text-align: center;
  transition: 0.3s;
}

.loading p,
.no-trains p {
  color: #fff;
}

.last-train-label {
  color: #ff4500;
  font-weight: bold;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.6;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>