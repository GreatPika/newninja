import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";

import InitializedMDXEditor from "@/components/MDXEditor";

interface MarkdownModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
}

export default function MarkdownModal({
  isOpen,
  onOpenChange,
}: MarkdownModalProps) {
  return (
    <Modal
      backdrop="opaque"
      classNames={{
        backdrop:
          "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
      }}
      isOpen={isOpen}
      size="3xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Markdown Editor
            </ModalHeader>
            <ModalBody>
              <InitializedMDXEditor
                editorRef={null}
                markdown="## Start writing here..."
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={onClose}>
                Save
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
