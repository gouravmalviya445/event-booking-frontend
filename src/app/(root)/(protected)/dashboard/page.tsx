"use client";

import { Spinner } from "@/components/Loading";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const role = useUserStore(state => state.user?.role);
  const router = useRouter();
  useEffect(() => { 
    if (!role) {
      router.push(`/dashboard/${role}`)
      return;
    }
    router.push("/");
  }, [role])
  
  return (
    <div className="text-center"><Spinner /></div>
  );
}