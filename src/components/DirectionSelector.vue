<template>
  <div>
    <div v-if="directions.length > 0">
      <label for="direction">Sélectionnez une direction :</label>
      <select id="direction" v-model="selectedDirection"  @change="emitData">
        <option v-for="direction in directions" :key="direction.id" :value="direction.name">
          {{ direction.name }}
        </option>
      </select>
    </div>
    <div v-else>
      <p>Chargement des directions...</p>
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
  // Déclaration événement "directionSelected"
  const emit = defineEmits(["directionSelected"]);

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

  // Emit de la direction sélectionnée
  const emitData = () => {
    console.log("Émission de directionSelected avec :", {
      direction: selectedDirection.value,
    });

    emit("directionSelected", { direction: selectedDirection.value});
  };
</script>
