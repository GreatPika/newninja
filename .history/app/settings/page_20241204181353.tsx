/* eslint-disable no-console */
"use client";

import React from "react";

import { UserCard } from "./components/UserCard";
import { BalanceCard } from "./components/BalanceCard";
import { TokenUsageTable } from "./components/TokenUsageTable";
import { useTokenUsage } from "./hooks/useTokenUsage";

import {
  supabase,
  getUserProfile,
  getTokenUsageWithPagination,
} from "@/utils/supabase";
import { TokenUsageData } from "@/types";

export default function SettingsPage() {
  const ITEMS_PER_PAGE = 10;
  const { isLoading, tokenData, hasMore, loadMoreData, setIsLoading } = useTokenUsage(ITEMS_PER_PAGE);
  const [userProfile, setUserProfile] = React.useState<{
    balance: number;
    email: string;
  } | null>(null);

  React.useEffect(() => {
    async function loadData() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user?.id) {
          throw new Error("Пользователь не авторизован");
        }

        const [tokenUsageData, profile] = await Promise.all([
          getTokenUsageWithPagination(session.user.id, 0, ITEMS_PER_PAGE - 1),
          getUserProfile(session.user.id),
        ]);

        if (tokenUsageData.length < ITEMS_PER_PAGE) {
          setHasMore(false);
        }

        setTokenData(tokenUsageData);
        setUserProfile(profile);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [setIsLoading]);

  return (
    <div className="container mx-auto max-w-[400px] flex flex-col gap-4">
      <UserCard email={userProfile?.email} />
      <BalanceCard balance={userProfile?.balance} />
      <TokenUsageTable
        isLoading={isLoading}
        tokenData={tokenData}
        hasMore={hasMore}
        onLoadMore={async () => {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user?.id) {
            await loadMoreData(session.user.id);
          }
        }}
      />
    </div>
  );
}
