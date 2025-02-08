import { create } from "zustand";

const useAuthUserStore = create((set) => ({
  authUser: {},

  setAuthUser: (authUser) => set({ authUser }),
  removeUser: (()=>set({authUser:{}})),
}));

export default useAuthUserStore;
