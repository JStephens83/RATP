<template>
  <div>
    <div v-if="lignes.length > 0">
      <label for="line">Sélectionnez une ligne :</label>
    <select 
      id="line" 
      v-model="selectedLine" 
      @change="handleLineChange"
    >
      <option v-for="ligne in lignes" :key="ligne.id" :value="ligne">
        {{ ligne.name }}
      </option>
    </select>
    </div>
    <div v-else>
      <p>Chargement des lignes...</p>
    </div>
  </div>
</template>

<script setup>
  // API Diffusion des données du référentiel des lignes - ILICO : https://prim.iledefrance-mobilites.fr/fr/apis/idfm-ilico
  import { ref, onMounted } from "vue";
  import { getLines } from "../services/ratpService";

  const lignes = ref([]);
  const selectedLine = ref(null);

  // Vérification de l'emit:
  const emit = defineEmits(["lineSelected"]);

  const handleLineChange = () => {
    console.log("Valeur de selectedLine dans LineSelector :", selectedLine.value);
    emit("lineSelected", selectedLine.value); // Emit de la valeur sélectionnée
  };

  onMounted(async () => {
    lignes.value = await getLines();
    console.log("Lignes chargées :", lignes.value);
  });
</script>
