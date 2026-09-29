"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Root page — redirects to /chat if logged in, /login if not
export default function Home() {
  const { username, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      router.push(username ? "/chat" : "/login");
    }
  }, [username, isLoading, router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  );
}
