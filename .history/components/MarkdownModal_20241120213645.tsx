// MarkdownModal.tsx
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import InitializedMDXEditor from "@/components/MDXEditor";

interface MarkdownModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
}

const MarkdownModal = ({ isOpen, onOpenChange }: MarkdownModalProps) => {
  return (
    <Modal 
      size="3xl"
      backdrop="opaque" 
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      classNames={{
        backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Markdown Editor</ModalHeader>
            <ModalBody>
              <InitializedMDXEditor
                markdown="## Start writing here..."
                editorRef={null}
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
};

export default MarkdownModal;