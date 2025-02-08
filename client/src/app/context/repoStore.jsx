import { create } from "zustand";

const useRepoStore = create((set) => ({
  repoState: {},

  setRepo: (repoState) => set({ repoState }),
}));

export default useRepoStore;
