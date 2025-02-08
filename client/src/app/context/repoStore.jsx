import { create } from "zustand";

const useRepo = create((set) => ({
  repo: {},

  setRepo: (repo) => set({ repo }),
}));

export default useRepo;
