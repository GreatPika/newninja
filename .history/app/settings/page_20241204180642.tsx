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

import {
  supabase,
  getUserProfile,
  signOut,
  getTokenUsageWithPagination,
} from "@/utils/supabase";
import { formatDate } from "@/utils/formatDate";
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
      <Card>
        <CardBody>
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold">{userProfile?.email}</div>
            <Button
              color="danger"
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
        isHeaderSticky
        aria-label="Таблица использования токенов"
        bottomContent={
          hasMore ? (
            <div className="flex w-full justify-center">
              <Button
                isDisabled={isLoading}
                variant="flat"
                onPress={async () => {
                  const {
                    data: { session },
                  } = await supabase.auth.getSession();

                  if (session?.user?.id) {
                    await loadMoreData(session.user.id);
                  }
                }}
              >
                {isLoading ? (
                  <Spinner color="white" size="sm" />
                ) : (
                  "Загрузить еще"
                )}
              </Button>
            </div>
          ) : null
        }
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
          emptyContent={"Нет данных о расходах"}
          isLoading={isLoading}
          items={tokenData}
          loadingContent={<Spinner label="Загрузка..." />}
        >
          {(item) => {
            console.log("Rendering row with id:", item.id);

            return (
              <TableRow key={item.id}>
                <TableCell>{formatDate(new Date(item.created_at))}</TableCell>
                <TableCell>{item.total_cost}</TableCell>
              </TableRow>
            );
          }}
        </TableBody>
      </Table>
    </div>
  );
}
