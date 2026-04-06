# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TGI BRAIN** is a knowledge management system for the TGI Conglomerate — a Nuxt 4 SPA (SSR disabled) that lets authenticated users capture, tag, and visualize notes across 6 business entities via a D3.js force-directed knowledge graph.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Production build
npm run generate   # Static generation
npm run preview    # Preview production build
```

## Environment Setup

Copy `.env.example` to `.env` and fill in Supabase credentials:

```
NUXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Architecture

### Tech Stack
- **Nuxt 4** (SPA mode, `ssr: false`) + Vue 3 Composition API
- **Pinia** for state management
- **Supabase** (auth + Postgres DB via `@supabase/supabase-js` directly — no official Nuxt Supabase module)
- **TailwindCSS v4** via `@tailwindcss/vite` plugin
- **D3.js** for the force-directed graph
- **md-editor-v3** for markdown editing/rendering
- **@nuxt/icon** with Lucide icons

### Data Model

Supabase tables (all prefixed `tgibrain_`):
- `tgibrain_entities` — 6 fixed business entities (TGI, Enterbiner, SBS, Mbink Farm, TOS, DRC Trans), each with a brand color
- `tgibrain_notes` — notes with `category` (`strategic|technical|marketing|financial|operations`) and `status` (`raw_idea|active_pipeline|shelved`)
- `tgibrain_note_entities` — many-to-many join between notes and entities

Row Level Security is enabled: users can only CRUD their own notes; entities are read-only for all authenticated users.

### State Management

Two Pinia stores:
- `useNotesStore` (`app/stores/useNotesStore.ts`) — fetches and mutates notes/entities, computes `synergyLinks` (entity co-occurrence counts used by the graph) and `filteredNotes`
- `useFilterStore` (`app/stores/useFilterStore.ts`) — active filters (entity, category, status, search query); `useNotesStore.filteredNotes` reads from this store

### Auth Flow

- `app/composables/useAuth.ts` — wraps Supabase auth, exposes `user`, `initAuth`, `isLoading`, `isInitialized`
- `app/middleware/auth.global.ts` — global route guard; redirects unauthenticated users to `/login`, skips on server side (SPA-only)
- `app/composables/useSupabase.ts` — singleton Supabase client, lazy-initialized to avoid SSR issues

### Pages & Layouts

- `/` (`pages/index.vue`) — dashboard/notes list with `DataTable` and `CaptureModal` for creating notes
- `/graph` (`pages/graph.vue`) — `KnowledgeGraph` component rendering the D3 force graph
- `/notes/[id]` (`pages/notes/[id].vue`) — individual note reading/editing view, uses `reading` layout
- `/login` — Supabase email/password auth
- Layouts: `default` (sidebar + header), `auth` (centered), `reading` (full-width reading view)

### Knowledge Graph

`useForceGraph` composable (`app/composables/useForceGraph.ts`) manages the D3 simulation lifecycle. Node size scales with `noteCount`; links use per-link linear gradients blending the two entity colors. The graph receives `GraphNode[]` and `GraphLink[]` derived from `useNotesStore`'s `synergyLinks`.

### Type System

All shared types and display constants (colors, labels) live in `app/types/index.ts`. Import via `~/types`.

### Tailwind

Global styles in `app/assets/css/main.css`. The project uses a custom `brain-*` color palette (e.g. `bg-brain-800`, `text-brain-200`) defined there.
