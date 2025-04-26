<template>
  <div>
    <h2>Horaires des derniers trains</h2>
    <ul v-if="trainTimes.length > 0">
      <li v-for="(train, index) in trainTimes" :key="index">
        Direction : {{ train.direction }} - Heure : {{ train.time }}
      </li>
    </ul>
    <p v-else>Aucun horaire disponible.</p>
  </div>
</template>

<script setup>
const props = defineProps({
  trainTimes: {
    type: Array,
    required: true,
  },
});
</script>