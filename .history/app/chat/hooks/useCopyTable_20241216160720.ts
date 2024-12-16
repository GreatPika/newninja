import { useSnackbar } from "notistack";
import { useCallback } from "react";
import { handleCopyTable } from "@/utils/handleCopyTable";

export function useCopyTable() {
  const { enqueueSnackbar } = useSnackbar();

  const onCopyTableHandler = useCallback(
    (messageText: string) => {
      handleCopyTable(messageText);
      enqueueSnackbar("Таблица скопирована в буфер обмена", {
        variant: "success",
      });
    },
    [enqueueSnackbar],
  );

  return onCopyTableHandler;
} 