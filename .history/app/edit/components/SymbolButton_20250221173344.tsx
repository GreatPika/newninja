import { ButtonWithTooltip } from "@mdxeditor/editor";
import { useTheme } from "next-themes";

interface SymbolButtonProps {
  symbol: string;
  title: string;
  onInsertSymbol: (symbol: string) => void;
}

export const SymbolButton: React.FC<SymbolButtonProps> = ({
  symbol,
  title,
  onInsertSymbol,
}) => {
  const { theme } = useTheme();

  return (
    <ButtonWithTooltip
      style={{
        margin: "0",
        padding: "0",
      }}
      title={title}
      onClick={() => onInsertSymbol(symbol)}
    >
      <span
        style={{
          fontSize: "24px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "28px",
          height: "28px",
          borderRadius: "4px",
          color: theme === "dark" ? "white" : "black",
        }}
      >
        {symbol}
      </span>
    </ButtonWithTooltip>
  );
}; 