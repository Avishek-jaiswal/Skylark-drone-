"use client";

import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types";
import { MessageContent } from "./message-content";

interface MessageProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export function Message({ message, isStreaming }: MessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full gap-3 px-4 py-4",
        "first:pt-6 last:pb-2",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex max-w-[78%] flex-col gap-1.5",
          isUser && "items-end"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed",
            isUser
              ? "bg-secondary text-foreground rounded-br-md shadow-sm"
              : "bg-muted text-foreground rounded-bl-md shadow-sm"
          )}
        >
          <MessageContent
            content={message.content}
            isStreaming={isStreaming}
            isUser={isUser}
          />
        </div>
      </div>
    </div>
  );
}
