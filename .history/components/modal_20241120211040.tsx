'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from '@nextui-org/react';

// Динамический импорт MDXEditor с отключением SSR
const MDXEditor = dynamic(
  () => import('@mdxeditor/editor').then((mod) => mod.MDXEditor),
  { ssr: false }
);

export default function MDXEditorModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [markdown, setMarkdown] = useState<string>('');

  return (
    <>
      <Button onPress={onOpen}>Открыть редактор</Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>MDX Редактор</ModalHeader>
              <ModalBody>
                <MDXEditor
                  markdown={markdown}
                  onChange={setMarkdown}
                  plugins={[]}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Закрыть
                </Button>
                <Button color="primary" onPress={onClose}>
                  Сохранить
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
