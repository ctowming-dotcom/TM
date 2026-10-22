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

### Phase 1 — Portal shell + 4 tools (current)

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
- **Virtual Lab on Engine Practical** (`virtual-physical-lab`): a static
  reference cutaway image (`tools/virtual-physical-lab/engine-diagram.png`
  — a user-supplied centrifugal-compressor turbojet diagram, cropped to
  drop its baked-in T1–T5 label strip, then further cleaned to remove
  the original's own 5 leader lines and yellow sensor dots. A manual
  erase-and-flat-recolor pass kept leaving visible patches wherever a
  line crossed real artwork (edges, the duct's dot pattern, highlight
  curves), so the final cleanup used OpenCV inpainting instead
  (`cv2.inpaint`, `INPAINT_TELEA`): a mask of just the line paths and dot
  circles (coordinates found by pixel column/row scans, not eyeballed)
  lets the algorithm reconstruct the engine art underneath rather than
  trying to hand-pick replacement colors per spot. `engine-diagram.png`
  is the finished asset — there's no separate script checked in to
  regenerate it) with a throttle slider driving RPM, and animation
  overlaid on top of the picture rather than drawn into it: an SVG layer
  (`viewBox` matched to the image's pixel size) holds airflow arrows that
  travel two mirrored routes (upper traced over the picture's own gas
  path — straight through the intake, up through the centrifugal
  compressor to its diffuser exit, down the short elbow into the turbine
  inlet, then rearward through the annular passage around the nozzle
  centerbody, converging back to the shaft centerline at the
  centerbody's tip; lower is the same route mirrored about the
  centerline). The route is stored as a handful of waypoints
  (`UPPER_WAYPOINTS`) rather than a fixed path string, smoothed into a
  curve with a Catmull-Rom-to-Bezier conversion (`pathFromPoints`) so it
  can be reshaped in edit mode (see below) without separate bezier-handle
  bookkeeping. Each arrow is an SVG `<path>` positioned and rotated every
  frame via `getPointAtLength`/tangent-angle sampling on a corresponding
  invisible guide `<path>` (one upper, one mirrored lower,
  `fill/stroke: none`, queried only for its geometry, rebuilt whenever a
  waypoint moves); speed scales with RPM and color shifts cool→hot→
  exhaust by fraction of path length travelled. Two independent pulsing
  combustor glows (`GLOWS`, one per duct, both scale with fuel flow) sit
  over the top and bottom red ducts; an exhaust jet gradient scales with
  thrust. The image can't show literal blade rotation (no shapes to
  animate in a raster picture), so that part of the previous animated-
  SVG version was dropped — rotation reads only through the flow/glow/
  jet. 5 percentage-positioned hover markers (`PARTS`, holding position
  plus the tooltip name/desc together) sit exactly on the image's own
  yellow dots (inlet / compressor exit / combustor / turbine / exhaust)
  for tooltips, the same marker-overlay pattern as the Air System tool.

  Has the same password-gated "✎ Edit" button as Air System (password
  `APP`, casual click-guard only). Unlocked, it adds: the 5 part markers
  become draggable and their name/description become retypable
  (`contenteditable`, in a list shown below the diagram only while
  editing); the flow route's waypoints become draggable diamond handles
  (dragging one rebuilds both the upper path and its auto-mirrored lower
  counterpart); the 2 combustor glow centers become draggable dashed-
  circle handles. Waypoint/glow handles are plain SVG shapes positioned
  by converting pointer coordinates through the overlay `<svg>`'s own
  `getScreenCTM()` rather than by percentage math, since they live in the
  SVG's pixel space, not the HTML marker layer. Because a waypoint or
  glow handle can land exactly on top of a part marker (the compressor
  exit waypoint does, by design), the overlay `<svg>` is pointer-events:
  none by default with only `.vlab-waypoint-handle`/`.vlab-glow-handle`
  opted back in, and edit mode raises the whole overlay's z-index above
  the marker layer — otherwise the marker (on top in DOM order) always
  wins the drag and the handle underneath becomes unreachable. A
  floating panel (like Air System's) shows the live, paste-ready
  `PARTS`/`UPPER_WAYPOINTS`/`GLOWS` source to copy back into the file.
  Panel widened to `max-width: 1500px` and all text sized up (headings,
  tile labels/values, tooltip, controls) for legibility at that width.
  Live readouts for RPM, thrust, T1–T4/P1–P4 per stage, fuel flow, and
  Compressor Pressure Ratio (CPR = P2/P1, unchanged by unit mode since
  it's a ratio) — only 4 of the image's 5 dots carry live data (the 5th,
  "turbine", is tooltip-only) since the underlying real dataset has only
  4 measured stations; a 5th number was never fabricated to fill it. A
  Mode 1/Mode 2 toggle switches every readout's units: Mode 1 is as-logged
  (PSIG, °C, Gal/hr, lbf — the default), Mode 2 is SI (Pa, K, L/hr, thrust
  shown as both N and kgf). Hover a stage or the CPR tile for its
  purpose/explanation (text sourced from the supplied lab answer key,
  `Lab_1_Engine_Run_ANS_v8.0.docx`). The RPM→readout model is 22 real
  anchor points extracted from the ascending throttle sweep in the
  supplied `Engine_Run_Sample_Result.xlsx`, linearly interpolated; column
  mapping (P4=nozzle exit press, T4=EGT, not the sheet's own same-named
  columns) and the unit conversions were both verified against the answer
  key's worked peak-RPM figures (near-exact match, e.g. fuel flow converts
  to 18.66 L/hr in Mode 2 vs the key's 18.66 L/HR). Unlike the Fuel/Oil
  diagram tools, this one uses the portal's own Bright Lab chrome (fonts/
  accent/tiles) around the reference image. Uses the portal's
  `TM.registerTool`/`mount` pattern plus one addition: returns an
  `unmount` (cancels its `requestAnimationFrame` loop) — `app.js` was
  patched to call the outgoing tool's `unmount` on direct hash-to-hash
  tool switches, not just when returning to the catalog (a latent gap that
  only mattered once a tool had a continuous animation loop).
- Quiz Generator and Flashcard Trainer were both built for Phase 1, then
  removed by request — see git history if either is wanted back. Quiz
  Generator: static Web Basics question bank, scored, saved attempt history
  to `tm.quizAttempts` via `storage.js` (also removed). Flashcard Trainer:
  BYOK Anthropic key, called directly from client JS with the
  `anthropic-dangerous-direct-browser-access: true` header, no backend.
- **Air System** (`air-system`): static engine cutaway diagram
  (`tools/air-system/engine-diagram.png`, a real turbojet cutaway image
  supplied by the user, who confirmed ownership/rights to use it) shared
  by both modes, with an Internal/External toggle. Each mode overlays its
  own set of colored markers (blue=internal, red=external) at
  percentage-based positions on the image, plus a synced list of the same
  items beside the diagram — hovering either a marker or its list entry
  highlights both; marker positions scale with the image responsively
  since they're plain `%`-positioned `<span>`s over a `position: relative`
  wrapper, not SVG coordinates. 6 internal functions (turbine blade/disc/
  NGV/combustor-liner cooling, labyrinth seal, thrust bearing load relief)
  and 7 external (customer bleed, nacelle ventilation, generator/EEC/
  igniter cooling, turbine case cooling/ACC, anti-icing). List/description
  content sourced from the supplied deck `Chapter_11_Air_System_v1_2hr.pptx`.
  Uses the portal's Bright Lab chrome like the Virtual Lab (not a
  reference-sheet style). Has a password-gated "✎ Edit" button (password
  `APP`, hardcoded client-side — a casual gate against accidental edits,
  not real auth) that, once unlocked, makes every marker draggable and
  every list name/description directly retypable (`contenteditable`) for
  both modes; a floating panel shows the live, ready-to-paste
  `INTERNAL_ITEMS`/`EXTERNAL_ITEMS` source so changes made by dragging/
  retyping in the browser can be copied back into `air-system.js` (no
  backend — this is how content gets edited without writing code by
  hand, but someone still has to paste the result into the file and
  redeploy).

### Phase 2 — Scaffolded topics, content pending

Three tools registered as placeholders ("Coming soon" card using shared
`.placeholder-tool` styling from `styles.css`, in the portal's own Bright
Lab look). Each is just a `mount()` stub in its own folder, ready to be
replaced with real content without touching any other tool:

- `fire-system` — Fire Protection System (folder/id kept as `fire-system`;
  display name renamed by request)
- `apu-system` — APU System
- `starting-system` — Starting System

Catalog order (set by request, `tools.js` array order): Virtual Lab on
Engine Practical, Oil System Overview, Fuel System Overview, Air System,
Starting System, APU System, Fire Protection System.

### Future phases

- Fill in real content for the three remaining Phase 2 placeholders above
  (likely following the Fuel/Oil diagram pattern, or the Virtual Lab's
  data-driven-simulation pattern, depending on what's supplied for each).
- Add further tools via the registry pattern above; scope and specifics TBD
  per tool when planned.
