import { create } from "zustand";

const useOnlineUserStore = create((set) => ({
  users: [],

  setUsers: (users) => set({ users }),

  addUser: (user) => set((state) => ({ users: [...state.users, user] })),

  removeUser: (userId) =>
    set((state) => ({
      users: state.users.filter((user) => user.userId !== userId),
    })),

  getUserById: (userId) =>
    set((state) => state.users.find((user) => user.userId === userId)),
}));

export default useOnlineUserStore;
