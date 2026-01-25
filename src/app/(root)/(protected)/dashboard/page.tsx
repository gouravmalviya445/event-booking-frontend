"use client";

import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const role = useUserStore(state => state.user?.role);
  const router = useRouter();
  if (role) {
    router.push(`/dashboard/${role}`);
  } else {
    router.push("/");
  }
  
  return (
    <div>Dashboard</div>
  );
}