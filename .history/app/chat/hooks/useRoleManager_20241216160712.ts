import { useState, useEffect } from "react";
import { Message } from "@/types/index";
import { updateMessageInDB } from "@/utils/messages";
import { useSnackbar } from "notistack";

export function useRoleManager(messages: Message[]) {
  const { enqueueSnackbar } = useSnackbar();
  const [editingRoles, setEditingRoles] = useState<Record<number, string>>({});

  useEffect(() => {
    const rolesMap: Record<number, string> = {};

    for (const msg of messages) {
      if (msg.id !== undefined && msg.role !== "user") {
        rolesMap[msg.id] = msg.role;
      }
    }
    setEditingRoles((prev) => ({ ...prev, ...rolesMap }));
  }, [messages]);

  const handleRoleChange = (id: number, newRole: string) => {
    setEditingRoles((prev) => ({ ...prev, [id]: newRole }));
  };

  const handleRoleBlur = async (id: number) => {
    const newRole = editingRoles[id];

    // Сохраняем изменение в IndexedDB
    await updateMessageInDB(id, { role: newRole });
    enqueueSnackbar("Роль обновлена", { variant: "success" });
  };

  return {
    editingRoles,
    handleRoleChange,
    handleRoleBlur,
  };
} 