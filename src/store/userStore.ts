import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";


type Role = "attendee" | "admin" | "organizer";

type User = {
  email: string;
  name: string;
  isEmailVerified: boolean;
  role: Role;
};

type UserStore = {
  user: User | null;
  setUser: (user: User) => void;
  logoutUser: () => void;
  updateIsEmailVerified: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logoutUser: () => set({ user: null }),
      updateIsEmailVerified: () => set(state => ({ user: { ...state.user, isEmailVerified: true } as User}))
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
)