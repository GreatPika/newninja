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
  Button,
} from "@nextui-org/react";

import { getTokenUsage, supabase, getUserProfile } from "@/utils/supabase";
import { formatDate } from "@/utils/formatDate";

interface TokenUsageData {
  created_at: string;
  total_cost: number;
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [tokenData, setTokenData] = React.useState<TokenUsageData[]>([]);
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
          getTokenUsage(session.user.id),
          getUserProfile(session.user.id),
        ]);

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
    <div className="container mx-auto p-4 max-w-[1000px]">
      <div className="flex gap-4">
        <div className="w-1/2">{/* Левая колонка - пока пустая */}</div>

        <div className="w-1/2">
          <h2 className="text-2xl font-bold mb-4">Расходы</h2>
          <Table
            aria-label="Таблица использования токенов"
            classNames={{
              base: "max-h-[520px]",
              table: "min-h-[420px]",
            }}
          >
            <TableHeader>
              <TableColumn key="created_at">Дата</TableColumn>
              <TableColumn key="total_cost">Расходы, $</TableColumn>
            </TableHeader>
            <TableBody
              isLoading={isLoading}
              items={tokenData}
              loadingContent={<Spinner label="Загрузка..." />}
            >
              {(item) => (
                <TableRow key={item.created_at}>
                  <TableCell>{formatDate(new Date(item.created_at))}</TableCell>
                  <TableCell>{item.total_cost}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="mt-6 flex justify-between items-center">
            <div className="text-md">
              Баланс: ${userProfile?.balance?.toFixed(2) || "0.00"}
            </div>
            <Button
              color="primary"
              onClick={() => console.log("Пополнить баланс")}
            >
              Пополнить баланс
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
