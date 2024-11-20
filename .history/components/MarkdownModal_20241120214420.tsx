import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { useState,useEffect } from "react";
import InitializedMDXEditor from "@/components/MDXEditor";

interface MarkdownModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  messageText: string;
  onSave: (updatedText: string) => void;
}

const MarkdownModal = ({
  isOpen,
  onOpenChange,
  messageText,
  onSave,
}: MarkdownModalProps) => {
  const [editorContent, setEditorContent] = useState(messageText);

  useEffect(() => {
    setEditorContent(messageText);
  }, [messageText]);

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
                markdown={editorContent}
                onChange={(newContent) => setEditorContent(newContent)}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={() => {
                  onClose();
                  onOpenChange(false);
                }}
              >
                Close
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  onSave(editorContent);
                  onClose();
                  onOpenChange(false);
                }}
              >
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
