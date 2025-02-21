import { useTheme } from "next-themes";

interface ActiveRowInfoProps {
  activeRow: number | null;
  column4Value: string;
}

export const ActiveRowInfo = ({
  activeRow,
  column4Value,
}: ActiveRowInfoProps) => {
  const { theme } = useTheme();

  return (
    <div
      style={{
        marginTop: "10px",
        padding: "8px",
        backgroundColor: theme === "dark" ? "#333" : "#f0f0f0",
        color: theme === "dark" ? "#fff" : "#000",
        borderRadius: "4px",
      }}
    >
      Активная строка: {activeRow ?? "н/д"}, Значение в 5 колонке:{" "}
      {column4Value}
    </div>
  );
};
