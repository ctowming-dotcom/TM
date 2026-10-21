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
the page to that tool's view (hash-routed, e.g. `#fuel-system-overview`)
without a page reload. Built to keep growing: adding tool N+1 never touches existing
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

- None currently — no tool stores anything. `storage.js` (the shared helper
  module) was removed with the Quiz Generator; re-add it if a future tool
  needs persisted state, following the `tm.*`-prefixed key convention.

### Visual direction

Bright Lab: white/near-black base, coral accent (`#ff5c6c`), a rotating
pastel tint per card (coral/teal/amber) so new cards keep cycling through
it, pill-shaped buttons and inputs, Fredoka (display) + Karla (body) via
Google Fonts. Full dark-mode token set in `styles.css`.

### Phase 1 — Portal shell + 3 tools (current)

- Shell: header, catalog view, hash-routed tool view, footer, tool registry.
- **Fuel System Overview**: interactive SVG diagram of a jet engine's fuel
  system (adapted from a supplied reference file). Toggle between start and
  shutdown flow states; hover a component for its title and description.
  No stored state — purely explanatory, no localStorage key.
- **Oil System Overview**: interactive SVG diagram of a turbofan oil system
  (adapted from a supplied reference file). Switch spool configuration
  (single/twin/triple), toggle supply/scavenge/return circuits on and off,
  hover a component for its title and description. No stored state.
  Both diagram tools keep their own reference-sheet visual style (not the
  portal's Bright Lab palette) since their colors are semantic — e.g. green
  = open/flowing, red = closed or a return line, amber = active selection.
- **Virtual Lab on Engine Practical** (`virtual-physical-lab`): animated
  engine cross-section (inlet/compressor/combustor/turbine/exhaust) with a
  throttle slider driving RPM. Compressor/turbine fans spin and airflow
  particles speed up with RPM; the combustor glow and exhaust jet scale
  with fuel flow/thrust. Live readouts for RPM, thrust, T1–T4/P1–P4 per
  stage, fuel flow, and Compressor Pressure Ratio (CPR = P2/P1). Hover a
  stage or the CPR tile for its purpose/explanation (text sourced from the
  supplied lab answer key, `Lab_1_Engine_Run_ANS_v8.0.docx`). The RPM→
  readout model is 22 real anchor points extracted from the ascending
  throttle sweep in the supplied `Engine_Run_Sample_Result.xlsx`, linearly
  interpolated; column mapping (P4=nozzle exit press, T4=EGT, not the
  sheet's own same-named columns) was verified against the answer key's
  worked peak-RPM figures. Unlike the two diagram tools above, this one
  **does** use the portal's own Bright Lab chrome (fonts/accent/tiles) —
  only the engine graphic's colors are semantic (blue=cool, orange/red=hot).
  Uses the portal's `TM.registerTool`/`mount` pattern plus one addition:
  returns an `unmount` (cancels its `requestAnimationFrame` loop) — `app.js`
  was patched to call the outgoing tool's `unmount` on direct hash-to-hash
  tool switches, not just when returning to the catalog (a latent gap that
  only mattered once a tool had a continuous animation loop).
- Quiz Generator and Flashcard Trainer were both built for Phase 1, then
  removed by request — see git history if either is wanted back. Quiz
  Generator: static Web Basics question bank, scored, saved attempt history
  to `tm.quizAttempts` via `storage.js` (also removed). Flashcard Trainer:
  BYOK Anthropic key, called directly from client JS with the
  `anthropic-dangerous-direct-browser-access: true` header, no backend.

### Phase 2 — Scaffolded topics, content pending

Four tools registered as placeholders ("Coming soon" card using shared
`.placeholder-tool` styling from `styles.css`, in the portal's own Bright
Lab look). Each is just a `mount()` stub in its own folder, ready to be
replaced with real content without touching any other tool:

- `air-system` — Air System
- `fire-system` — Fire Protection System (folder/id kept as `fire-system`;
  display name renamed by request)
- `apu-system` — APU System
- `starting-system` — Starting System

Catalog order (set by request, `tools.js` array order): Virtual Lab on
Engine Practical, Oil System Overview, Fuel System Overview, Air System,
Starting System, APU System, Fire Protection System.

### Future phases

- Fill in real content for the four remaining Phase 2 placeholders above
  (likely following the Fuel/Oil diagram pattern, or the Virtual Lab's
  data-driven-simulation pattern, depending on what's supplied for each).
- Add further tools via the registry pattern above; scope and specifics TBD
  per tool when planned.
