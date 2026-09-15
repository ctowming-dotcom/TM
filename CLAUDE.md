# CLAUDE.md

Guidance for Claude Code (and other agents) working in this repository.

## Stack & Conventions

**Hard constraint: vanilla HTML, CSS, and JavaScript only — no frameworks, no build step.**

- No frontend frameworks or libraries (React, Vue, Svelte, jQuery, etc.).
- No CSS frameworks or preprocessors (Tailwind, Sass, Less, Bootstrap, etc.).
- No bundlers, transpilers, or build tooling (Webpack, Vite, Babel, TypeScript, npm scripts that compile anything).
- No package.json-driven build pipeline — pages must run by opening the `.html` file or serving the static files as-is.
- Write plain `.html`, `.css`, and `.js` files that run directly in the browser with no compilation step.

## Feature Plan

A single-page portal where students browse and use a growing collection of small
learning tools. Home view shows a catalog of tool cards; picking one switches
the page to that tool's view (hash-routed, e.g. `#quiz-generator`) without a
page reload. Built to keep growing: adding tool N+1 never touches existing
tools' code.

### Structure

- `index.html` — the one page: header, catalog view (default), one tool view
  container, footer.
- `tools/<tool-id>/` — one folder per tool (its markup fragment, `.js`, `.css`).
- `tools.js` — shared registry: plain array of `{ id, name, description, entry }`
  metadata. Catalog view renders cards by iterating it; tool views mount by id.
- **Adding a tool later**: create its folder, add one entry to `tools.js`,
  and link its `.css`/`.js` files in `index.html` (plain script/link tags —
  no bundler). Each tool calls `TM.registerTool(id, { mount })` at load time;
  the router calls `mount(container)` when its hash is active. No existing
  tool's files change.

### Data model (localStorage, prefixed `tm.*`)

- `tm.apiKey` — student's own Anthropic API key (BYOK), needed only by the
  Flashcard Trainer's AI-generation path. Entered once via a settings panel,
  editable/clearable. Never hardcoded or committed. Calls go directly from
  client JS to the Anthropic Messages API with the
  `anthropic-dangerous-direct-browser-access: true` header (no backend).
- `tm.quizAttempts` — saved quiz attempt history: `{ quizId, score, total, completedAt }`.
  Quiz content itself is static and bundled with the tool, not generated or
  stored here.
- `tm.decks` — saved flashcard decks: `{ id, topic, source: 'ai'|'manual'|'mixed', createdAt, cards: [{ id, front, back }] }`.
- Generated/attempted content persists locally so it's still there next visit
  (a "my decks" list, quiz score history), not lost each session.

### Phase 1 — Portal shell + 2 tools (current)

- Shell: header, catalog view, hash-routed tool view, footer, tool registry.
- Settings panel for `tm.apiKey` (BYOK, Anthropic), used only by the
  Flashcard Trainer.
- **Quiz Generator**: static question bank bundled with the tool (starter
  topic: Web Basics — HTML/CSS/JS fundamentals, 10 multiple-choice questions,
  each with a short explanation shown after answering). No AI call, no key
  needed. Renders an interactive quiz with immediate feedback; saves attempt
  history to `tm.quizAttempts`.
- **Flashcard Trainer**: student enters a topic for an AI-generated starter
  deck (Anthropic, via `tm.apiKey`), or creates/edits cards manually →
  flip/cycle drill UI → saves to `tm.decks`, editable anytime.

### Future phases

- Add more tools via the registry pattern above; scope and specifics TBD per
  tool when planned.
- Possible: AI-generated/expanded quiz topics (Phase 1 quiz content is
  static-only).
