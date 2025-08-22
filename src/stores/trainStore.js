// N'est pas utilisé pour le moment.
import { defineStore } from 'pinia';
import { fetchLastTrain } from '@/api/ratpApi';

export const useTrainStore = defineStore('train', {
  state: () => ({
    lastTrain: null,
    loading: false,
    error: null,
  }),

  // Centralisation de la logique de récupération des données
  getters: {
    hasError: (state) => !!state.error,
    isLoaded: (state) => state.lastTrain !== null && !state.loading
  },

  actions: {
    async getLastTrain(line) {
      this.loading = true;
      this.error = null;

      try {
        const result = await fetchLastTrain(line)
        this.lastTrain = result
      } catch (err) {
        console.error('Erreur API RATP:', err)
        this.error = 'Erreur lors du chargement des données.'
      } finally {
        this.loading = false
      }
    },
    // réinitialisation de l'état (changement de ligne par exemple))
    reset() {
      this.lastTrain = null
      this.error = null
      this.loading = false
    }
  }
});
// export const useTrainStore = defineStore('train', {
//   state: () => ({
//     lastTrain: null,
//     loading: false,
//     error: null,
//   }),
//   actions: {
//     async getLastTrain(line) {
//       this.loading = true;
//       this.error = null;
//       try {
//         this.lastTrain = await fetchLastTrain(line);
//       } catch (err) {
//         this.error = "Erreur lors du chargement des données.";
//       } finally {
//         this.loading = false;
//       }
//     }
//   }
// });