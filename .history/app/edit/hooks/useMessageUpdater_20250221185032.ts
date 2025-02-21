import { updateMessage } from "@/utils/indexedDB";

export const useMessageUpdater = () => {
  const handleContentChange = (messageId: number | null) => {
    return async (content: string) => {
      if (!messageId) return;

      await updateMessage(messageId, { text: content });
    };
  };

  return { handleContentChange };
};
