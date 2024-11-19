import { Card, CardBody, Avatar, Spinner } from "@nextui-org/react";

import { MessageDisplayProps } from "@/types/index";

export function MessageDisplay({ messages, loading }: MessageDisplayProps) {
  return (
    <div className="flex-1 overflow-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <Card
          key={index}
          className={`${
            message.role === "user" ? "ml-auto" : "mr-auto"
          } max-w-[80%]`}
        >
          <CardBody className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Avatar
                fallback={message.role === "user" ? "U" : "A"}
                size="sm"
                src={
                  message.role === "user"
                    ? "/user-avatar.png"
                    : "/assistant-avatar.png"
                }
              />
              <span className="text-sm font-semibold">
                {message.role === "user" ? "You" : "Assistant"}
              </span>
            </div>
            <div className="prose prose-sm max-w-none">{message.text}</div>
            <div className="text-xs text-gray-500 mt-2">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </CardBody>
        </Card>
      ))}
      {loading && (
        <Card className="mr-auto max-w-[80%]">
          <CardBody className="p-3 flex items-center gap-2">
            <Spinner size="sm" />
            <span>Thinking...</span>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
