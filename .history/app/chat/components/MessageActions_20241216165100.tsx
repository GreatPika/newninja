// components/MessageActions.tsx

import { Button } from "@nextui-org/react";
import { Pencil, Copy, Trash } from "lucide-react";
import { Message } from "@/types/index";

interface MessageActionsProps {
  message: Message;
  hasTable: boolean;
  onEdit: (message: Message) => void;
  onDelete: (id: number) => void;
  onCopyTable: (content: string) => void;
  renderedContent: string;
}

export function MessageActions({
  message,
  hasTable,
  onEdit,
  onDelete,
  onCopyTable,
  renderedContent,
}: MessageActionsProps) {
  return (
    <div className="flex items-center">
      <Button
        isIconOnly
        radius="md"
        size="sm"
        variant="light"
        onPress={() => onEdit(message)}
      >
        <Pencil size={16} />
      </Button>
      {hasTable && (
        <Button
          isIconOnly
          radius="md"
          size="sm"
          variant="light"
          onPress={() => onCopyTable(renderedContent)}
        >
          <Copy size={16} />
        </Button>
      )}
      {typeof message.id === 'number' && (
        <Button
          isIconOnly
          radius="md"
          size="sm"
          variant="light"
          onPress={() => onDelete(message.id as number)}
        >
          <Trash size={16} />
        </Button>
      )}
    </div>
  );
}