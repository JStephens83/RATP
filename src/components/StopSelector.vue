<template>
  <div>
    <div v-if="props.stops.length > 0">
      <h2 class="list-labels">Sélectionnez un arrêt :</h2>
      <ul class="stop-list" ref="scrollTarget">
        <li
          v-for="stop in props.stops"
          :key="stop.id"
          :class="{ selected: selectedStop === stop.id }"
          @click="selectStop(stop.id)"
        >
          {{ stop.name }}
        </li>
      </ul>
      <!-- <select id="stop" v-model="selectedStop"  @change="emitStop">
        <option v-for="stop in stops" :key="stop.id" :value="stop.id">
          {{ stop.name }}
        </option>
      </select> -->
    </div>
    <div v-else>
      <p class="loading">Chargement des arrêts...</p>
    </div>
  </div>
</template>

<script setup>
  // API Prochains passages - requête unitaire
  // https://prim.iledefrance-mobilites.fr/fr/apis/idfm-ivtr-requete_unitaire
  import { ref, watch } from "vue";
  import { useAutoScroll } from "../composables/useAutoScroll";

  // Arrêt sélectionné
  const selectedStop = ref(null);
  const { scrollTarget, triggerScroll } = useAutoScroll();

  // Prop pour reception des arrêts depuis DirectionSelector.vue
  const props = defineProps({
    stops: {
      type: Array,
      required: true,
    },
  });
  // console.log("Arrêts reçus dans StopSelector :", props.stops);

  // Déclaration événement "stopSelected"
  const emit = defineEmits(["stopSelected"]);

  // Emit arrêt sélectionné
  const selectStop = (stopId) => {
    selectedStop.value = stopId;
    emit("stopSelected", stopId);
  };
  // console.log("Arrêt sélectionné :", selectedStop.value);
  
  watch(
    () => props.stops,
    async (newVal) => {
      if (newVal.length > 0) {
        console.log("scrollTarget.value", scrollTarget.value);
        await triggerScroll(true);
      }
    },
    { immediate: true }
  );
</script>

<style scoped>
  .loading {
    color: red;
    display: block;
    text-align: center;
    font-size: 1.5rem;
    margin: 10vh 0 10vh 0;
  }
  .stop-list {
    display: flex;
    flex-direction: row;  
    justify-content: center;
    flex-wrap: wrap;
  }
  .stop-list li {
    list-style-type: none;
    padding: 1em;
    margin: 0.5em;
    cursor: pointer;
    background-color: #050D9E;
    color : #fff;font-size: 1.5rem;
    min-width: 10vw;
    text-align: center;
    transition: 0.3s;
  }
  .stop-list li.selected {
    background: #64B5F6;
    color: #292092;
    font-weight: bold;
  }
  .stop-list li:hover {
    box-shadow: 2px 2px 2px #000;
  }
</style>