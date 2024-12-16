import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";

import { Message } from "@/types/index";
import { updateMessageInDB } from "@/utils/messages";

export function useRoleManager(messages: Message[]) {
  const { enqueueSnackbar } = useSnackbar();
  const [editingRoles, setEditingRoles] = useState<Record<number, string>>({});
  const [originalRoles, setOriginalRoles] = useState<Record<number, string>>({});

  useEffect(() => {
    const rolesMap: Record<number, string> = {};

    for (const msg of messages) {
      if (msg.id !== undefined && msg.role !== "user") {
        rolesMap[msg.id] = msg.role;
      }
    }
    setEditingRoles((prev) => ({ ...prev, ...rolesMap }));
    setOriginalRoles((prev) => ({ ...prev, ...rolesMap }));
  }, [messages]);

  const handleRoleChange = (id: number, newRole: string) => {
    setEditingRoles((prev) => ({ ...prev, [id]: newRole }));
  };

  const handleRoleBlur = async (id: number) => {
    const newRole = editingRoles[id];
    const originalRole = originalRoles[id];

    if (newRole !== originalRole) {
      await updateMessageInDB(id, { role: newRole });
      setOriginalRoles((prev) => ({ ...prev, [id]: newRole }));
      enqueueSnackbar("Название продукта обновлено", { variant: "success" });
    }
  };

  return {
    editingRoles,
    handleRoleChange,
    handleRoleBlur,
  };
}
