import { updateMessage } from "@/utils/indexedDB";

export const useMessageUpdater = () => {
  const handleContentChange = (messageId: number | null) => {
    return async (content: string) => {
      if (!messageId) return;

      try {
        await updateMessage(messageId, { text: content });
      } catch (error) {}
    };
  };

  return { handleContentChange };
};
