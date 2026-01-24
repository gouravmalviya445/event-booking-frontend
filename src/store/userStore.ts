import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";


type Role = "attendee" | "admin" | "organizer";

export type User = {
  email: string;
  name: string;
  isEmailVerified: boolean;
  role: Role;
};

type UserStore = {
  user: User | null;
  isLoggedIn: boolean;
  lastVerified: Date;

  setUser: (user: User) => void;
  logoutUser: () => void;
  updateIsEmailVerified: () => void;
  verifyAuth: () => Promise<void>;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      lastVerified: new Date(),

      setUser: (user) => {
        set({
          user,
          lastVerified: new Date(),
          isLoggedIn: true
        })
      },

      logoutUser: () => {
        try {
          apiClient.post("/api/users/logout");
          set({ user: null, isLoggedIn: false })
          localStorage.removeItem("user-storage")
          toast.success("Logged out successfully")
        } catch (error) {
          toast.error("Failed to logout")
        }
      },

      updateIsEmailVerified: () => {
        set(state => ({ user: { ...state.user, isEmailVerified: true } as User }))
      },

      verifyAuth: async () => {
        try {
          const { data: { data: {user} } } = await apiClient.get("/api/users/current-user");
          console.log("user", user)
          set({
            user: {
              email: user.email,
              name: user.name,
              isEmailVerified: user.isEmailVerified,
              role: user.role
            } as User,
            isLoggedIn: true
          });
        } catch (error: any) {
          if (error?.response?.status === 401) {
            toast.error(error?.response?.data?.message || "Please login to continue");
            set({ user: null, isLoggedIn: false });
            return;
          }
          toast.error(error?.response?.data?.message || "Please login to continue");
          set({ user: null, isLoggedIn: false });
        }
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
)