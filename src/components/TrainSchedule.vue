<template>
  <div>
    <h2 class="list-labels">Horaires des derniers trains</h2>
    <ul v-if="trainTimes.length > 0" ref="scrollTarget">
      <p>Prochains horaires :</p>
      <li v-for="(train, index) in trainTimes" :key="index">
        {{ formatTime(train.time) }} - {{ calculateTimeDifference(train.time) }} 
      </li>
    </ul>
    <p v-else>Aucun horaire disponible.</p>
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