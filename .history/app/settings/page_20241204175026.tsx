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
  Card,
  CardBody,
} from "@nextui-org/react";
import { useAsyncList } from "@react-stately/data";

import {
  getTokenUsage,
  supabase,
  getUserProfile,
  signOut,
} from "@/utils/supabase";
import { formatDate } from "@/utils/formatDate";

interface TokenUsageData {
  created_at: string;
  total_cost: number;
}

export default function SettingsPage() {
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [userProfile, setUserProfile] = React.useState<{
    balance: number;
    email: string;
  } | null>(null);

  const list = useAsyncList({
    async load({ cursor }) {
      if (cursor) {
        setPage((prev) => prev + 1);
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user?.id) {
          throw new Error("Пользователь не авторизован");
        }

        const tokenUsageData = await getTokenUsage(session.user.id, page);
        
        if (!cursor) {
          setIsLoading(false);
        }

        return {
          items: tokenUsageData,
          cursor: tokenUsageData.length === 10 ? page + 1 : undefined,
        };
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        return { items: [], cursor: undefined };
      }
    },
  });

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
    <div className="container mx-auto max-w-[400px] flex flex-col gap-4">
      <Card>
        <CardBody>
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold">{userProfile?.email}</div>
            <Button
              color="danger"
              variant="light"
              onClick={async () => {
                try {
                  await signOut();
                  window.location.href = "/";
                } catch (error) {
                  console.error("Ошибка при выходе:", error);
                }
              }}
            >
              Выйти из аккаунта
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold">
              Баланс: ${userProfile?.balance?.toFixed(2) || "0.00"}
            </div>
            <Button
              color="primary"
              onClick={() => console.log("Пополнить баланс")}
            >
              Пополнить баланс
            </Button>
          </div>
        </CardBody>
      </Card>

      <Table
        aria-label="Таблица использования токенов"
        bottomContent={
          list.cursor ? (
            <div className="flex w-full justify-center">
              <Button 
                isDisabled={list.isLoading} 
                variant="flat" 
                onPress={list.loadMore}
              >
                {list.isLoading && <Spinner color="white" size="sm" />}
                Загрузить еще
              </Button>
            </div>
          ) : null
        }
        classNames={{
          base: "max-h-[520px] overflow-scroll",
          table: "min-h-[420px]",
        }}
      >
        <TableHeader>
          <TableColumn key="created_at">Дата</TableColumn>
          <TableColumn key="total_cost">Расходы, $</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={"Нет данных о расходах"}
          isLoading={isLoading}
          items={list.items}
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
    </div>
  );
}
