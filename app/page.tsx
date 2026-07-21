"use client";

import { useCallback, useState } from "react";
import { Chat } from "@/components/chat";
import { Header } from "@/components/header";

export default function Home() {
  const [hasMessages, setHasMessages] = useState(false);
  const [chatKey, setChatKey] = useState(0);

  const handleMessagesChange = useCallback((count: number) => {
    setHasMessages(count > 0);
  }, []);

  const handleClearChat = useCallback(() => {
    setChatKey((prev) => prev + 1);
    setHasMessages(false);
  }, []);

  return (
    <div className="flex h-full flex-col">
      <Header onClearChat={handleClearChat} hasMessages={hasMessages} />
      <main className="flex-1 overflow-hidden">
        <Chat
          key={chatKey}
          onMessagesChange={handleMessagesChange}
        />
      </main>
    </div>
  );
}
