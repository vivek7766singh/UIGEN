"use client";

import { Loader2 } from "lucide-react";

type ToolCommand =
  | "view"
  | "create"
  | "str_replace"
  | "insert"
  | "undo_edit"
  | "rename"
  | "delete";

interface ToolArgs {
  command?: ToolCommand;
  path?: string;
  file_text?: string;
  old_str?: string;
  new_str?: string;
  insert_line?: number;
  new_path?: string;
}

interface ToolInvocationData {
  toolCallId: string;
  toolName: string;
  args: ToolArgs;
  state: string;
  result?: unknown;
}

interface ToolCallBadgeProps {
  toolInvocation: ToolInvocationData;
}

export function getToolLabel(
  toolName: string,
  args: ToolArgs,
  isDone: boolean
): string {
  const basename = args.path
    ? args.path.split("/").filter(Boolean).pop() ?? args.path
    : "";

  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":
        return isDone ? `Created ${basename}` : `Creating ${basename}`;
      case "str_replace":
        return isDone ? `Edited ${basename}` : `Editing ${basename}`;
      case "insert":
        return isDone ? `Edited ${basename}` : `Editing ${basename}`;
      case "view":
        return isDone ? `Viewed ${basename}` : `Viewing ${basename}`;
      case "undo_edit":
        return isDone ? "Done" : `Undoing edit in ${basename}`;
      default:
        return toolName;
    }
  }

  if (toolName === "file_manager") {
    switch (args.command) {
      case "rename":
        return isDone ? `Renamed ${basename}` : `Renaming ${basename}`;
      case "delete":
        return isDone ? `Deleted ${basename}` : `Deleting ${basename}`;
      default:
        return toolName;
    }
  }

  return toolName;
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const isDone =
    toolInvocation.state === "result" && toolInvocation.result != null;
  const label = getToolLabel(toolInvocation.toolName, toolInvocation.args, isDone);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}
