/* eslint-disable no-console */
import { Button, Card, CardBody } from "@nextui-org/react";
import { Wallet, DollarSign } from "lucide-react";

interface BalanceCardProps {
  balance: number | undefined;
}

export function BalanceCard({ balance }: BalanceCardProps) {
  return (
    <Card shadow="none">
      <CardBody>
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="text-foreground/60" size={24} />{" "}
            {balance?.toFixed(2) || "0.00"} $
          </div>
          <Button color="primary" onClick={() => console.log("Пополнить")}>
            Пополнить
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
