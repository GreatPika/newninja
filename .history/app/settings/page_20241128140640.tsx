/* eslint-disable no-console */
"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
} from "@nextui-org/react";

import { getTokenUsage, supabase } from "@/utils/supabase";
import { formatDate } from "@/utils/formatDate";

interface TokenUsageData {
  created_at: string;
  total_cost: number;
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [tokenData, setTokenData] = React.useState<TokenUsageData[]>([]);

  React.useEffect(() => {
    async function loadTokenUsage() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user?.id) {
          throw new Error("Пользователь не авторизован");
        }

        const data = await getTokenUsage(session.user.id);

        setTokenData(data);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadTokenUsage();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Настройки</h1>

      <Table
        aria-label="Таблица использования токенов"
        classNames={{
          base: "max-h-[520px]",
          table: "min-h-[420px]",
        }}
      >
        <TableHeader>
          <TableColumn key="created_at">Дата</TableColumn>
          <TableColumn key="total_cost">Стоимость</TableColumn>
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          items={tokenData}
          loadingContent={<Spinner label="Загрузка..." />}
        >
          {(item) => (
            <TableRow key={item.created_at}>
              <TableCell>
                {formatDate(new Date(item.created_at))}
              </TableCell>
              <TableCell>{item.total_cost}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
