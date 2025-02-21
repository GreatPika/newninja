import { useTheme } from "next-themes";

interface ActiveRowInfoProps {
  activeRow: number | null;
  column4Value: string | null;
}

export const ActiveRowInfo = ({ activeRow, column4Value }: ActiveRowInfoProps) => {
  const { theme } = useTheme();

  // Добавляем стилизацию через CSS-переменные
  const panelStyle: React.CSSProperties = {
    margin: "16px",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    backgroundColor: "var(--background)",
    color: "var(--foreground)",
    border: "1px solid var(--border)"
  };

  return (
    <div
      style={panelStyle}
    >
      Активная строка: {activeRow ?? 'н/д'}, Значение в 5 колонке: {column4Value ?? 'н/d'}
    </div>
  );
}; 