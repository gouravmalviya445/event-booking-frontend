"use client";

import { Spinner } from "@/components/Loading";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const user = useUserStore(state => state.user);
  const router = useRouter();
  useEffect(() => { 
    if (user != null) {
      router.push(`/dashboard/${user.role}`)
      return;
    }
    router.push("/");
  }, [user])
  
  return (
    <div className="text-center"><Spinner /></div>
  );
}