/* eslint-disable no-console */
"use client";

import React from "react";

import { UserCard } from "./components/UserCard";
import { BalanceCard } from "./components/BalanceCard";
import { TokenUsageTable } from "./components/TokenUsageTable";

import {
  supabase,
  getUserProfile,
  getTokenUsageWithPagination,
} from "@/utils/supabase";
import { TokenUsageData } from "@/types";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [tokenData, setTokenData] = React.useState<TokenUsageData[]>([]);
  const [page, setPage] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);
  const ITEMS_PER_PAGE = 10;
  const [userProfile, setUserProfile] = React.useState<{
    balance: number;
    email: string;
  } | null>(null);

  const loadMoreData = async (userId: string) => {
    try {
      const start = page * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      const newData = await getTokenUsageWithPagination(userId, start, end);

      if (newData.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }

      setTokenData((prev) => {
        const uniqueIds = new Set(prev.map((item) => item.id));
        const filteredNewData = newData.filter(
          (item) => !uniqueIds.has(item.id),
        );

        return [...prev, ...filteredNewData];
      });

      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Ошибка при загрузке дополнительных данных:", error);
    }
  };

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
  }, []);

  return (
    <div className="container mx-auto max-w-[400px] flex flex-col gap-4">
      <UserCard email={userProfile?.email} />
      <BalanceCard balance={userProfile?.balance} />
      <TokenUsageTable
        hasMore={hasMore}
        isLoading={isLoading}
        tokenData={tokenData}
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
