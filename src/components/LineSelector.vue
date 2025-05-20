<template>
  <div>
    <div v-if="lignes.length > 0">
      <label for="line">Sélectionnez une ligne</label>
      <ul class="line-list">
        <li
          v-for="ligne in lignes"
          :key="ligne.id"
          :class="{ selected: selectedLine && selectedLine.id === ligne.id }"
          @click="selectLine(ligne)"
          :style="{ backgroundColor: ligne.color, color: ligne.textColor }"
        >
          {{ ligne.name }}
        </li>
      </ul>
    <!-- <select 
      id="line" 
      v-model="selectedLine" 
      @change="handleLineChange"
    >
      <option v-for="ligne in lignes" :key="ligne.id" :value="ligne">
        {{ ligne.name }}
      </option>
    </select> -->
    </div>
    <div v-else>
      <p class="loading"
        :style="selectedLine ? { backgroundColor: selectedLine.color, color: selectedLine.textColor } : {}"
      >Chargement des lignes...</p>
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

  // va avec le select/option:
  // const handleLineChange = () => {
  //   console.log("Valeur de selectedLine dans LineSelector :", selectedLine.value);
  //   emit("lineSelected", selectedLine.value); // Emit de la valeur sélectionnée
  // };

  const selectLine = (ligne) => {
    selectedLine.value = ligne;
    emit("lineSelected", ligne);
  };

  onMounted(async () => {
    lignes.value = await getLines();
    console.log("Lignes chargées :", lignes.value);
  });
</script>

<style>
  label {
    display: block;
    text-align: center;
    font-size: 2rem;
    margin: 20vh 0 10vh 0;
  }
  ul {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
  }
  li {
    display: flex;
    border-radius: 50%;
    cursor: pointer;  
    width: 5vw;
    height: 5vw;
    align-items: center;
    justify-content: center;
    font-size: 2.1rem;
    font-weight: bold;
  }
  li:hover {
    /* Ajouter animation */
    box-shadow: 2px 2px 2px #000;
  }
</style>