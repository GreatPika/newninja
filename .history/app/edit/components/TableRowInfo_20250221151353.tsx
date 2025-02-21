import { useTheme } from "next-themes";

interface TableRowInfoProps {
  activeRow: number | null;
  column4Value: string | null;
}

export const TableRowInfo = ({ activeRow, column4Value }: TableRowInfoProps) => {
  const { theme } = useTheme();
  
  if (activeRow === null) return null;

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
      Активная строка: {activeRow}, Значение в 5 колонке: {column4Value}
    </div>
  );
}; 