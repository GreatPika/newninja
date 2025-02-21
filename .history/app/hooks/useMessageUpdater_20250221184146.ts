import { updateMessage } from "@/utils/indexedDB";

export const useMessageUpdater = () => {
  const handleContentChange = async (messageId: number | null, content: string) => {
    if (!messageId) return;

    try {
      await updateMessage(messageId, { text: content });
      console.log("Изменения сохранены");
    } catch (error) {
      console.error("Ошибка при сохранении изменений:", error);
    }
  };

  return { handleContentChange };
}; 