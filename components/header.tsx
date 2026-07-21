"use client";

import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onClearChat: () => void;
  hasMessages: boolean;
}

export function Header({ onClearChat, hasMessages }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 shrink-0",
        "border-b border-border/30",
        "bg-background/70 backdrop-blur-xl backdrop-saturate-150",
      )}
    >
      <div className="flex h-13 items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <Sidebar onClearChat={onClearChat} hasMessages={hasMessages} />

          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-xl bg-primary flex items-center justify-center shadow-sm shadow-primary/15">
              <span className="text-[11px] font-bold text-primary-foreground tracking-tight">
                S
              </span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              SkyLark
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground/30 hidden sm:block font-medium">
            Business Intelligence
          </span>
        </div>
      </div>
    </header>
  );
}
