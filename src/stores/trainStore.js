import { defineStore } from 'pinia';
import { fetchLastTrain } from '@/api/ratpApi';

export const useTrainStore = defineStore('train', {
  state: () => ({
    lastTrain: null,
    loading: false,
    error: null,
  }),
  actions: {
    async getLastTrain(line) {
      this.loading = true;
      this.error = null;
      try {
        this.lastTrain = await fetchLastTrain(line);
      } catch (err) {
        this.error = "Erreur lors du chargement des données.";
      } finally {
        this.loading = false;
      }
    }
  }
});