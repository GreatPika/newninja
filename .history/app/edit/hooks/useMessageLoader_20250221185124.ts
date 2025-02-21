import { useEffect, useState } from "react";

import { getMessageById } from "@/utils/indexedDB";

export const useMessageLoader = (messageId: number | null) => {
  const [markdown, setMarkdown] = useState("");
  const [sourceData, setSourceData] = useState<
    Record<string, string> | undefined
  >();
  const [isReady, setIsReady] = useState(false);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      if (!messageId) return;

      const message = await getMessageById(messageId);

      if (!message) return;

      setMarkdown(message.text);

      try {
        const parsed = message.source ? JSON.parse(message.source) : {};

        setSourceData(
          typeof parsed === "object" && !Array.isArray(parsed)
            ? parsed
            : undefined,
        );
      } catch (e) {
        setSourceData(undefined);
      }

      setIsReady(true);
    };

    fetchContent();
  }, [messageId]);

  return { markdown, sourceData, isReady, error };
};
