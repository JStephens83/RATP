<template>
  <div>
    <div v-if="stops.length > 0">
      <label for="stop">Sélectionnez un arrêt :</label>
      <select id="stop" v-model="selectedStop"  @change="emitStop">
        <option v-for="stop in stops" :key="stop.id" :value="stop.id">
          {{ stop.name }}
        </option>
      </select>
    </div>
    <div v-else>
      <p class="loading">Chargement des arrêts...</p>
    </div>
  </div>
</template>

<script setup>
  // API Prochains passages - requête unitaire
  // https://prim.iledefrance-mobilites.fr/fr/apis/idfm-ivtr-requete_unitaire
  import { ref, onMounted } from "vue";

  // Arrêt sélectionné
  const selectedStop = ref(null);

  // Prop pour reception des arrêts depuis DirectionSelector.vue
  const props = defineProps({
    stops: {
      type: Array,
      required: true,
    },
  });
  console.log("Arrêts reçus dans StopSelector :", props.stops);

  // Déclaration événement "stopSelected"
  const emit = defineEmits(["stopSelected"]);

  // Emit arrêt sélectionné
  const emitStop = () => {
    emit("stopSelected", selectedStop.value);
  };
  console.log("Arrêt sélectionné :", selectedStop.value);
</script>
