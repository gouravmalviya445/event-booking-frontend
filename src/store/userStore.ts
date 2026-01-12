import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";


type Role = "attendee" | "admin" | "organizer";

type User = {
  email: string;
  name: string;
  isVerified: boolean;
  role: Role;
};

type UserStore = {
  user: User | null;
  setUser: (user: User) => void;
  logoutUser: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logoutUser: () => set({ user: null }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
)