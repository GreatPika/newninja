import React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
} from "@nextui-org/react";

interface ConfirmationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  children: React.ReactNode;
  title: string;
  message: string;
  cancelText?: string;
  confirmText?: string;
}

const ConfirmationPopover: React.FC<ConfirmationPopoverProps> = ({
  isOpen,
  onClose,
  onConfirm,
  children,
  title,
  message,
  cancelText = "Отмена",
  confirmText = "Удалить",
}) => {
  return (
    <Popover
      backdrop="blur"
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent>
        <div className="px-1 py-2">
          <div className="text-lg font-medium mb-2">{title}</div>
          <div
            dangerouslySetInnerHTML={{ __html: message }}
            className="text-md text-neutral-550 "
          />
          <div className="flex justify-end mt-4">
            <Button
              color="primary"
              radius="md"
              variant="light"
              onClick={onClose}
            >
              {cancelText}
            </Button>
            <Button
              color="danger"
              radius="md"
              variant="light"
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ConfirmationPopover;
