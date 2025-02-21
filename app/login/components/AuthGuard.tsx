"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/utils/supabase";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.replace("/");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.replace("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (isLoading) {
    return <div>Загрузка...</div>; // Можно заменить на компонент загрузки
  }

  return <>{children}</>;
}
