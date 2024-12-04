import { useState } from "react";

import { TokenUsageData } from "@/types";
import { getTokenUsageWithPagination } from "@/utils/supabase";

export function useTokenUsage(itemsPerPage: number) {
  const [isLoading, setIsLoading] = useState(true);
  const [tokenData, setTokenData] = useState<TokenUsageData[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreData = async (userId: string) => {
    try {
      const start = page * itemsPerPage;
      const end = start + itemsPerPage - 1;

      const newData = await getTokenUsageWithPagination(userId, start, end);

      if (newData.length < itemsPerPage) {
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

  return {
    isLoading,
    tokenData,
    hasMore,
    loadMoreData,
    setIsLoading,
  };
}
