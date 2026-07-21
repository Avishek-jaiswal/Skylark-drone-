"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface MessageContentProps {
  content: string;
  isStreaming?: boolean;
  isUser?: boolean;
}

export const MessageContent = memo(function MessageContent({
  content,
  isStreaming,
  isUser,
}: MessageContentProps) {
  if (!content || content.length === 0) {
    return (
      <div className="flex items-center gap-1.5 min-h-[20px]">
        <span className="inline-block h-2 w-2 rounded-full bg-current opacity-25 animate-pulse" />
        <span className="inline-block h-2 w-2 rounded-full bg-current opacity-25 animate-pulse" style={{ animationDelay: "150ms" }} />
        <span className="inline-block h-2 w-2 rounded-full bg-current opacity-25 animate-pulse" style={{ animationDelay: "300ms" }} />
      </div>
    );
  }

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${i}`}
            className="my-3 overflow-x-auto rounded-xl bg-black/[0.04] p-4 text-[13px] leading-relaxed dark:bg-white/[0.04]"
          >
            <code>{codeLines.join("\n")}</code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (line.startsWith("|") && line.endsWith("|")) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      const cells = line.split("|").slice(1, -1).map((c) => c.trim());
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      if (tableRows.length >= 2) {
        const headerRow = tableRows[0];
        const dataRows = tableRows.filter((_, idx) => idx !== 1);
        elements.push(
          <div key={`table-${i}`} className="my-3 overflow-x-auto rounded-xl border border-border/40">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/40 bg-muted/30">
                  {headerRow?.map((cell, ci) => (
                    <th key={ci} className="px-3 py-2.5 text-left text-[13px] font-semibold text-foreground/80">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, ri) => (
                  <tr key={ri} className="border-b border-border/20 last:border-b-0">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2.5 text-[13px] text-foreground/70">
                        {formatInlineMarkdown(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      inTable = false;
      tableRows = [];
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="mt-4 mb-1.5 text-[15px] font-semibold text-foreground">
          {formatInlineMarkdown(line.slice(4))}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="mt-5 mb-2 text-[17px] font-semibold text-foreground">
          {formatInlineMarkdown(line.slice(3))}
        </h2>
      );
    } else if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} className="mt-5 mb-2 text-lg font-bold text-foreground">
          {formatInlineMarkdown(line.slice(2))}
        </h1>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <li key={i} className="ml-5 list-disc text-foreground/80 leading-relaxed">
          {formatInlineMarkdown(line.slice(2))}
        </li>
      );
    } else if (line.match(/^\d+\.\s/)) {
      const text = line.replace(/^\d+\.\s/, "");
      elements.push(
        <li key={i} className="ml-5 list-decimal text-foreground/80 leading-relaxed">
          {formatInlineMarkdown(text)}
        </li>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2.5" />);
    } else {
      elements.push(
        <p key={i} className="text-foreground/80 leading-relaxed">
          {formatInlineMarkdown(line)}
        </p>
      );
    }
  }

  if (elements.length === 0) {
    elements.push(
      <p key="fallback" className="whitespace-pre-wrap text-foreground/80 leading-relaxed">
        {content}
      </p>
    );
  }

  const textColor = isUser ? "text-foreground/90" : "text-foreground/85";

  return (
    <div className={cn("space-y-0.5", textColor)}>
      {elements}
      {isStreaming && (
        <span className="inline-block h-[1.2em] w-[0.4em] bg-current opacity-40 ml-0.5 align-text-bottom animate-pulse rounded-[1px]" />
      )}
    </div>
  );
});

function formatInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const codeMatch = remaining.match(/`(.+?)`/);
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);

    const all = [
      { m: boldMatch, t: "bold" as const },
      { m: codeMatch, t: "code" as const },
      { m: italicMatch, t: "italic" as const },
    ].filter((a) => a.m !== null)
     .sort((a, b) => a.m!.index! - b.m!.index!);

    if (all.length === 0) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    const { m: match, t: type } = all[0];
    const idx = match!.index!;

    if (idx > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
    }

    const matchContent = match![1];
    if (type === "bold") {
      parts.push(<strong key={key++} className="font-semibold">{matchContent}</strong>);
    } else if (type === "code") {
      parts.push(
        <code key={key++} className="rounded-md bg-black/[0.06] px-1.5 py-0.5 text-[0.9em] font-mono dark:bg-white/[0.08]">
          {matchContent}
        </code>
      );
    } else {
      parts.push(<em key={key++}>{matchContent}</em>);
    }

    remaining = remaining.slice(idx + match![0].length);
  }

  return <>{parts}</>;
}
