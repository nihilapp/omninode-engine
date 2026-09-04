import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const isSidebarOpen = ref(false);

  function onSetSidebarOpen(value: boolean) {
    isSidebarOpen.value = value;
  }

  function reset() {
    isSidebarOpen.value = false;
  }

  return {
    isSidebarOpen,
    onSetSidebarOpen,
    reset,
  };
});
