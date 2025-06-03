<template>
  <h1>Horaires des derniers trains RATP</h1>
  <Homeview />
</template>

<script setup>
  import Homeview from './views/Homeview.vue'
</script>

<style scoped>
  h1 {
    display: block;
    text-align: center;
    font-size: 3em;
    margin: 10vh;
  }
</style>
