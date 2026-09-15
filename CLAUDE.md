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
- **Adding a tool later**: create its folder, add one entry to `tools.js`, add
  its section container to `index.html`. No existing tool's files change.

### Data model (localStorage, prefixed `tm.*`)

- `tm.apiKey` — student's own AI provider API key (BYOK). Shared by all tools
  that need AI. Entered once via a settings panel, editable/clearable. Never
  hardcoded or committed.
- `tm.quizzes` — saved quizzes: `{ id, topic, createdAt, questions: [{ question, choices[], answerIndex, explanation? }] }`.
- `tm.decks` — saved flashcard decks: `{ id, topic, source: 'ai'|'manual'|'mixed', createdAt, cards: [{ id, front, back }] }`.
- Generated content persists locally so it's still there next visit (a "my
  quizzes" / "my decks" list per tool), not regenerated fresh each time.

### Phase 1 — Portal shell + 2 tools (current)

- Shell: header, catalog view, hash-routed tool view, footer, tool registry.
- Settings panel for `tm.apiKey` (BYOK), shared across tools.
- **Quiz Generator**: student enters a topic → calls AI provider directly
  from client JS using `tm.apiKey` → renders an interactive multiple-choice
  quiz with immediate feedback → saves to `tm.quizzes` for replay.
- **Flashcard Trainer**: student enters a topic for an AI-generated starter
  deck, or creates/edits cards manually → flip/cycle drill UI → saves to
  `tm.decks`, editable anytime.

### Future phases

- Add more tools via the registry pattern above; scope and specifics TBD per
  tool when planned.
