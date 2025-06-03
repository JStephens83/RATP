<template>
  <div>
    <div v-if="directions.length > 0">
      <h2 class="list-labels">Sélectionnez une direction :</h2>
      <ul class="direction-list">
        <li
          v-for="direction in directions"
          :key="direction.id"
          :class="{ selected: selectedDirection }"
          @click="selectDirection(direction)"
        >
          {{ direction.name }}
        </li>
      </ul>
      <!-- <select id="direction" v-model="selectedDirection"  @change="emitData">
        <option v-for="direction in directions" :key="direction.id" :value="direction.name">
          {{ direction.name }}
        </option>
      </select> -->
    </div>
    <div v-else>
      <p class="loading">Chargement des directions...</p>
    </div>
  </div>
</template>

<script setup>
  // API Prochains passages - requête globale
  // https://prim.iledefrance-mobilites.fr/fr/apis/idfm-ivtr-requete_globale
  import { ref, watch } from "vue";
  import { getDirections } from "../services/ratpService";

  // Réception de la ligne sélectionnée depuis Homeview.vue
  const props = defineProps({
    selectedLine: {
      type: String,
      required: true,
    },
  });

  const directions = ref([]);
  const selectedDirection = ref(null);

  watch(() => props.selectedLine, async (newLineId) => {
      if (newLineId) {
        console.log("Appel de getDirections avec la ligne :", newLineId.name);
        const { directions: fetchedDirections } = await getDirections(newLineId);
        directions.value = fetchedDirections;
        console.log("Directions récupérées :", directions.value);
        // console.log("Arrêts récupérés dans DirectionSelector.vue :", stops.value);
      }
    },
    { immediate: true }
  );

  
  // Déclaration événement "directionSelected"
  const emit = defineEmits(["directionSelected"]);

  // Emit de la direction sélectionnée   
  const selectDirection = (direction) => {
    selectedDirection.value = direction;
    emit("directionSelected", direction);
  };
</script>

<style scoped>
  ul.direction-list {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
  }

  ul.direction-list > li {
    list-style-type: none;
    padding: 1em;
    cursor: pointer;
    background-color: #050D9E;
    color : #fff;font-size: 1.5rem;
    min-width: 10vw;
    text-align: center;
    transition: 0.3s;
  }

  ul.direction-list > li:hover {
    box-shadow: 2px 2px 2px #000;
  }
</style>
