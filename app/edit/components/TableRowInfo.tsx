import { useTheme } from "next-themes";
import { Card, CardBody } from "@heroui/react";

interface TableRowInfoProps {
  activeRow: number | null;
  column4Value: string | null;
}

export const TableRowInfo = ({
  activeRow,
  column4Value,
}: TableRowInfoProps) => {
  const { theme } = useTheme();

  if (activeRow === null) return null;

  return (
    <Card
      className={`mt-2 ${
        theme === "dark" ? "bg-default-100" : "bg-default-50"
      }`}
      radius="none"
      shadow="none"
    >
      <CardBody>
        <p>{column4Value && `${column4Value}`}</p>
      </CardBody>
    </Card>
  );
};
