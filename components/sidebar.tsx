"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PanelLeft, Plus, MessageSquare, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  onClearChat: () => void;
  hasMessages: boolean;
}

export function Sidebar({ onClearChat, hasMessages }: SidebarProps) {
  return (
    <Sheet>
      <SheetTrigger
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[min(var(--radius-md),12px)] text-muted-foreground/60 hover:text-foreground transition-colors"
      >
        <PanelLeft className="h-4 w-4" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-7 w-7 rounded-xl bg-primary flex items-center justify-center shadow-sm shadow-primary/15">
              <span className="text-[11px] font-bold text-primary-foreground tracking-tight">
                S
              </span>
            </div>
            <SheetTitle className="text-base font-semibold tracking-tight">
              SkyLark
            </SheetTitle>
          </div>
          <p className="text-[13px] text-muted-foreground pl-[38px]">
            Business Intelligence
          </p>
        </SheetHeader>

        <Separator className="opacity-40" />

        <div className="flex flex-col gap-0.5 px-3 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.reload()}
            className="justify-start gap-3 text-muted-foreground hover:text-foreground rounded-xl h-9"
          >
            <Plus className="h-4 w-4 opacity-60" />
            New Conversation
          </Button>

          {hasMessages && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearChat}
              className="justify-start gap-3 text-muted-foreground hover:text-destructive rounded-xl h-9"
            >
              <Trash2 className="h-4 w-4 opacity-60" />
              Clear Chat
            </Button>
          )}
        </div>

        <Separator className="opacity-40" />

        {hasMessages && (
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 bg-muted/30">
              <MessageSquare className="h-4 w-4 text-muted-foreground/50" />
              <span className="text-[13px] text-muted-foreground truncate">
                Current Conversation
              </span>
            </div>
          </div>
        )}

        <div className="mt-auto px-3 pb-4">
          <div className="rounded-2xl border border-border/30 bg-muted/20 p-3.5">
            <p className="text-[12px] text-muted-foreground/60 leading-relaxed">
              Connected to Monday.com. Ask me about revenue, pipeline, and operations.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
