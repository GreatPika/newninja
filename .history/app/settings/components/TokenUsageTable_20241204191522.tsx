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

import { TokenUsageData } from "@/types";
import { formatDate } from "@/utils/formatDate";

interface TokenUsageTableProps {
  isLoading: boolean;
  tokenData: TokenUsageData[];
  hasMore: boolean;
  onLoadMore: () => Promise<void>;
}

export function TokenUsageTable({
  isLoading,
  tokenData,
  hasMore,
  onLoadMore,
}: TokenUsageTableProps) {
  return (
    <Table
      isHeaderSticky
      aria-label="Таблица использования токенов"
      bottomContent={
        hasMore ? (
          <div className="flex w-full justify-center">
            <Button isDisabled={isLoading} variant="flat" onPress={onLoadMore}>
              {isLoading ? <Spinner size="lg" /> : "Загрузить еще"}
            </Button>
          </div>
        ) : null
      }
      classNames={{
        base: "max-h-[520px]",
        table: "min-h-[420px]",
      }}
      shadow="none"
    >
      <TableHeader>
        <TableColumn key="created_at" className="text-lg">Дата</TableColumn>
        <TableColumn key="total_cost" className="text-lg">Расходы, $</TableColumn>
      </TableHeader>
      <TableBody
        emptyContent={"Нет данных о расходах"}
        isLoading={isLoading}
        items={tokenData}
        loadingContent={<Spinner label="Загрузка..." />}
      >
        {(item) => (
          <TableRow key={item.id}>
            <TableCell>{formatDate(new Date(item.created_at))}</TableCell>
            <TableCell>{item.total_cost}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
