<template>
  <div>
    <p class="logo">Projet RATP (Last call / Last train)</p>
  </div>
  <h1>🚆 Horaires des derniers trains RATP</h1>
  <Homeview />
</template>

<script setup>
  import Homeview from './views/Homeview.vue'
</script>

<style scoped>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
  }
  h1 {
    margin-top: 10px;
  }
</style>
