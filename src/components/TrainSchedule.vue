<template>
  <div class="train-schedule">
    <h2 class="list-labels">Horaires des prochains trains</h2>
    <ul v-if="trainTimes.length > 0" ref="scrollTarget" class="time-list">
      <!-- <p>Prochains horaires :</p> -->
      <li v-for="(train, index) in trainTimes" :key="index">
        {{ formatTime(train.time) }} - {{ calculateTimeDifference(train.time) }} 
      </li>
    </ul>
    <div v-else class="loading">
      <p>Chargement des horaires...</p>
    </div>
    <!-- <p v-else-if="trainTimes.length === 0">Aucun horaire disponible.</p> -->
  </div>
</template>

<script setup>
  import { watch } from "vue";
  import { useAutoScroll } from "../composables/useAutoScroll";

  const props = defineProps({
    trainTimes: {
      type: Array,
      required: true,
    },
  });
  
  const { scrollTarget, triggerScroll } = useAutoScroll();

  // Formatage des horaires
  const formatTime = (time) => {
    const date = new Date(time);
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  // Calcul du délai d'arrivée
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

  watch(
    () => props.trainTimes,
    async (newVal) => {
      if (newVal.length > 0) {
        await triggerScroll(true);
      }
    },
    { immediate: true }
  );
</script>
<style scoped>
  .train-schedule div>p {
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
  .time-list li, .time-list p {
    list-style-type: none;
    padding: 1em;
    margin: 0.5em;
    color : #fff;font-size: 1.5rem;
    min-width: 10vw;
    text-align: center;
    transition: 0.3s;
  }
</style>