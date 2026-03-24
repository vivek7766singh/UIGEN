# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# First-time setup (install deps + generate Prisma client + run migrations)
npm run setup

# Development server (Turbopack)
npm run dev

# Run all tests
npm test

# Run a single test file
npx vitest run src/components/chat/__tests__/ChatInterface.test.tsx

# Run tests in watch mode
npx vitest

# Reset the database (destructive)
npm run db:reset

# Lint
npm run lint
```

## Architecture Overview

UIGen is a Next.js 15 App Router application where Claude generates React components via tool calls, and those components are rendered live in an iframe — no files are ever written to disk.

### Request / Response Flow

1. User types a prompt in `ChatInterface` → `ChatProvider` (wraps Vercel AI SDK's `useChat`) sends `POST /api/chat` with the serialized virtual file system and chat history.
2. `src/app/api/chat/route.ts` reconstructs a `VirtualFileSystem`, calls `streamText` with two tools (`str_replace_editor`, `file_manager`), and streams the response back.
3. As tool calls stream in, the client's `onToolCall` callback in `ChatProvider` calls `handleToolCall` from `FileSystemContext`, which mutates the in-memory `VirtualFileSystem`.
4. Every mutation increments `refreshTrigger` in `FileSystemContext`, which causes `PreviewFrame` to re-render the iframe with fresh content.
5. On finish, the server persists messages + serialized file system to the SQLite `Project` row (authenticated users only).

### Virtual File System

`src/lib/file-system.ts` — `VirtualFileSystem` is an in-memory tree (nested `Map<string, FileNode>`). It exposes standard CRUD plus `serialize()` / `deserializeFromNodes()` for JSON round-tripping. The singleton `fileSystem` export is only used server-side inside the API route; the client holds its own instance via `FileSystemContext`.

### AI Tools

- `str_replace_editor` (`src/lib/tools/str-replace.ts`) — handles `create`, `str_replace`, `view`, `insert` commands on the virtual FS.
- `file_manager` (`src/lib/tools/file-manager.ts`) — handles `rename` and `delete`.

Both tools are built by factory functions that close over the per-request `VirtualFileSystem` instance.

### Preview Rendering

`PreviewFrame` (`src/components/preview/PreviewFrame.tsx`) builds an HTML string via `createPreviewHTML` / `createImportMap` (`src/lib/transform/jsx-transformer.ts`). JSX is transpiled client-side in the iframe using `@babel/standalone`. The entry point is auto-detected (prefers `/App.jsx`).

### Language Model Provider

`src/lib/provider.ts` — `getLanguageModel()` returns `anthropic("claude-haiku-4-5")` when `ANTHROPIC_API_KEY` is set, or `MockLanguageModel` (a hardcoded static generator) when it is not. The mock still exercises the full tool-call pipeline so the UI works without an API key.

### Auth

JWT-based, stored in an httpOnly cookie (`auth-token`). `src/lib/auth.ts` handles sign/verify using `jose`. Passwords are bcrypt-hashed. `src/middleware.ts` protects routes. Auth is optional — anonymous users can generate components; persistence requires sign-in.

### State Management

Two React contexts wrap the entire app:
- `FileSystemProvider` (`src/lib/contexts/file-system-context.tsx`) — owns the `VirtualFileSystem` instance and exposes file CRUD + `handleToolCall`.
- `ChatProvider` (`src/lib/contexts/chat-context.tsx`) — owns Vercel AI SDK chat state; calls `handleToolCall` from `FileSystemProvider` on each incoming tool call.

### Data Persistence

Prisma + SQLite (`prisma/dev.db`). Schema has two models: `User` (email/password) and `Project` (stores serialized messages and file system as JSON strings). Generated client lives in `src/generated/prisma/`.

### Testing

Vitest + React Testing Library. Tests live in `__tests__` directories co-located with source files. Config is in `vitest.config.mts`.
