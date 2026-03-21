import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getToolLabel } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// Pure helper: getToolLabel
// ---------------------------------------------------------------------------

test("getToolLabel: str_replace_editor create in-progress", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "/components/Card.jsx" }, false)).toBe("Creating Card.jsx");
});

test("getToolLabel: str_replace_editor create done", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "/components/Card.jsx" }, true)).toBe("Created Card.jsx");
});

test("getToolLabel: str_replace_editor str_replace in-progress", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "/src/App.tsx" }, false)).toBe("Editing App.tsx");
});

test("getToolLabel: str_replace_editor str_replace done", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "/src/App.tsx" }, true)).toBe("Edited App.tsx");
});

test("getToolLabel: str_replace_editor insert in-progress", () => {
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "/src/index.ts" }, false)).toBe("Editing index.ts");
});

test("getToolLabel: str_replace_editor insert done", () => {
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "/src/index.ts" }, true)).toBe("Edited index.ts");
});

test("getToolLabel: str_replace_editor view in-progress", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "/README.md" }, false)).toBe("Viewing README.md");
});

test("getToolLabel: str_replace_editor view done", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "/README.md" }, true)).toBe("Viewed README.md");
});

test("getToolLabel: str_replace_editor undo_edit in-progress", () => {
  expect(getToolLabel("str_replace_editor", { command: "undo_edit", path: "/src/App.tsx" }, false)).toBe("Undoing edit in App.tsx");
});

test("getToolLabel: str_replace_editor undo_edit done", () => {
  expect(getToolLabel("str_replace_editor", { command: "undo_edit", path: "/src/App.tsx" }, true)).toBe("Done");
});

test("getToolLabel: file_manager rename in-progress", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "/old/Button.jsx" }, false)).toBe("Renaming Button.jsx");
});

test("getToolLabel: file_manager rename done", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "/old/Button.jsx" }, true)).toBe("Renamed Button.jsx");
});

test("getToolLabel: file_manager delete in-progress", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "/src/Foo.tsx" }, false)).toBe("Deleting Foo.tsx");
});

test("getToolLabel: file_manager delete done", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "/src/Foo.tsx" }, true)).toBe("Deleted Foo.tsx");
});

test("getToolLabel: unknown toolName falls back to tool name", () => {
  expect(getToolLabel("custom_tool", { command: "create", path: "/a.ts" }, false)).toBe("custom_tool");
});

test("getToolLabel: known tool with unknown command falls back to tool name", () => {
  expect(getToolLabel("str_replace_editor", { command: "undo_edit" as any, path: "/a.ts" }, false)).toBe("Undoing edit in a.ts");
});

test("getToolLabel: basename extracted from deeply nested path", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "/a/b/c/deep.tsx" }, false)).toBe("Creating deep.tsx");
});

test("getToolLabel: basename extracted from leading slash path", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "/file.ts" }, false)).toBe("Viewing file.ts");
});

test("getToolLabel: path with no slashes returns the path itself as basename", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "standalone.tsx" }, false)).toBe("Creating standalone.tsx");
});

test("getToolLabel: missing path returns empty basename gracefully", () => {
  expect(getToolLabel("str_replace_editor", { command: "create" }, false)).toBe("Creating ");
});

// ---------------------------------------------------------------------------
// Component render tests
// ---------------------------------------------------------------------------

function makeInvocation(overrides: Partial<{
  toolName: string;
  args: Record<string, unknown>;
  state: string;
  result: unknown;
}> = {}) {
  return {
    toolCallId: "test-id",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/components/Button.tsx" },
    state: "call",
    result: undefined,
    ...overrides,
  };
}

test("shows spinner when state is not result", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation({ state: "call" })} />);
  const spinner = document.querySelector(".animate-spin");
  expect(spinner).not.toBeNull();
});

test("shows green dot when state is result and result is non-null", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation({ state: "result", result: "ok" })} />);
  const spinner = document.querySelector(".animate-spin");
  expect(spinner).toBeNull();
  const greenDot = document.querySelector(".bg-emerald-500");
  expect(greenDot).not.toBeNull();
});

test("state=result with null result renders as in-progress (spinner)", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation({ state: "result", result: null })} />);
  const spinner = document.querySelector(".animate-spin");
  expect(spinner).not.toBeNull();
});

test("shows friendly label for str_replace_editor create in-progress", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation({ state: "call" })} />);
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("shows friendly label for str_replace_editor create done", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation({ state: "result", result: "ok" })} />);
  expect(screen.getByText("Created Button.tsx")).toBeDefined();
});

test("shows friendly label for str_replace_editor str_replace in-progress", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation({ args: { command: "str_replace", path: "/App.tsx" }, state: "call" })} />);
  expect(screen.getByText("Editing App.tsx")).toBeDefined();
});

test("shows friendly label for file_manager rename done", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation({ toolName: "file_manager", args: { command: "rename", path: "/old.tsx" }, state: "result", result: "ok" })} />);
  expect(screen.getByText("Renamed old.tsx")).toBeDefined();
});

test("shows raw tool name for unknown tool", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation({ toolName: "unknown_tool", args: {}, state: "call" })} />);
  expect(screen.getByText("unknown_tool")).toBeDefined();
});

test("applies correct wrapper CSS classes", () => {
  const { container } = render(<ToolCallBadge toolInvocation={makeInvocation()} />);
  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper.className).toContain("inline-flex");
  expect(wrapper.className).toContain("items-center");
  expect(wrapper.className).toContain("bg-neutral-50");
  expect(wrapper.className).toContain("rounded-lg");
  expect(wrapper.className).toContain("font-mono");
});
