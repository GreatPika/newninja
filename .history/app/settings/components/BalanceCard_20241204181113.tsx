/* eslint-disable no-console */
import { Button, Card, CardBody } from "@nextui-org/react";

interface BalanceCardProps {
  balance: number | undefined;
}

export function BalanceCard({ balance }: BalanceCardProps) {
  return (
    <Card>
      <CardBody>
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold">
            Баланс: ${balance?.toFixed(2) || "0.00"}
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
  );
}
