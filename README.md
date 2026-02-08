# Discrete Math, Visualized

Interactive playgrounds that turn abstract discrete math concepts into aha moments. Each concept page teaches one core insight in under 3 minutes through hands-on mini-games and visualizations.

**Live, static site** — no database, no server, no accounts. Progress is saved in localStorage.

## Current Status

**4 of 9 concept interactives are implemented:**

| Concept | Route | Status |
|---------|-------|--------|
| Graph Traversal ("Maze Runner") | `/concepts/graph-traversal` | Done |
| Growth Rates ("Beat the Clock") | `/concepts/growth-rates` | Done |
| Hashing Collisions ("Hash Carnival") | `/concepts/hashing-collisions` | Done |
| Subsets ("Subset Dungeon") | `/concepts/subsets` | Done |
| Permutations ("Rune Lock") | `/c/permutations` | Planned |
| All-Pairs ("Stress Test") | `/c/pairs` | Planned |
| Invariants ("Invariant Detective") | `/c/invariants` | Planned |
| Birthday Paradox ("Collision Counter") | `/c/birthday-paradox` | Planned |
| Recursion ("Recurrence Tree Builder") | `/c/recursion` | Planned |

Stretch goals: `/playground` combined "boss level", `/c/toposort` task ordering.

## Tech Stack

- **Astro** — static site generator, route-per-page
- **React islands** — interactive components hydrated with `client:load`
- **Tailwind CSS v4** — styling via `@tailwindcss/vite`
- **D3** (scales/arrays only) — math utilities; React owns all DOM/SVG rendering
- **TypeScript** throughout
- **localStorage** for progress/theme persistence

## Project Structure

```
src/
├── pages/
│   ├── index.astro                    # Landing page
│   ├── 404.astro                      # Not found
│   └── concepts/
│       ├── graph-traversal.astro      # Concept pages (one per interactive)
│       ├── growth-rates.astro
│       ├── hashing-collisions.astro
│       └── subsets.astro
├── layouts/
│   └── BaseLayout.astro               # Shell: nav, dark mode, footer
├── components/
│   ├── shared/                        # Reusable UI
│   │   ├── AnimationController.tsx    # Play/pause/step controls
│   │   ├── InteractiveGrid.tsx        # Generic grid component
│   │   ├── Slider.tsx                 # Parameter slider
│   │   ├── ThemeToggle.tsx            # Light/dark mode switch
│   │   ├── ConceptCard.tsx            # Card for concept listing
│   │   ├── Legend.tsx                 # Color/symbol legend
│   │   ├── InfoPanel.tsx              # Collapsible info section
│   │   └── LandingCards.tsx           # Homepage concept cards
│   ├── graph-traversal/              # BFS/DFS maze interactive
│   │   ├── TraversalPlayground.tsx    # Orchestrator
│   │   ├── MazeGrid.tsx
│   │   ├── QueueStackVisualizer.tsx
│   │   └── TraversalControls.tsx
│   ├── growth-rates/                 # Big-O race interactive
│   │   ├── GrowthRacePlayground.tsx   # Orchestrator
│   │   ├── RaceChart.tsx
│   │   ├── RaceControls.tsx
│   │   └── ComplexityTable.tsx
│   ├── hashing/                      # Pigeonhole/hash interactive
│   │   ├── HashingPlayground.tsx       # Orchestrator
│   │   ├── BucketVisualizer.tsx
│   │   ├── DraggableItem.tsx
│   │   ├── HashFunctionSelector.tsx
│   │   └── CollisionCounter.tsx
│   └── subsets/                      # Subset enumeration interactive
│       ├── SubsetsPlayground.tsx       # Orchestrator
│       ├── ElementPool.tsx
│       ├── SubsetCounter.tsx
│       ├── SubsetGrid.tsx
│       └── SizeDistributionChart.tsx
├── hooks/
│   ├── useAnimationController.ts      # Step-based animation (pre-computed arrays)
│   ├── useProgress.ts                 # Milestone tracking per concept
│   └── useTheme.ts                    # Dark mode toggle
├── lib/
│   ├── progress.ts                    # localStorage progress API
│   ├── graph.ts                       # Graph generation & traversal logic
│   ├── growth.ts                      # Growth function computations
│   ├── hashing.ts                     # Hash function implementations
│   └── subsets.ts                     # Subset generation & combinatorics
├── content/
│   └── concepts/                      # Markdown with frontmatter
│       ├── graph-traversal.md         # title, description, milestones[]
│       ├── growth-rates.md
│       ├── hashing-collisions.md
│       └── subsets.md
├── content.config.ts                  # Astro content collection schema
└── styles/
    └── global.css                     # Tailwind imports + custom properties
```

## Key Patterns

- **Pre-computed step arrays** for all animations — index into array, play/pause/step are trivial
- **D3 for math only**, React owns all DOM and SVG rendering
- **Pointer events** for cross-device interaction (mouse + touch)
- **Dark mode** via `.dark` class on `<html>`, with inline script in `<head>` to prevent flash
- **Each concept page is independent** — only theme and progress are shared via localStorage
- **Astro content collections** use `glob` loader with Zod schema validation
- **Orchestrator pattern** — each concept has a top-level `*Playground.tsx` that composes sub-components

## Getting Started

```bash
npm install
npm run dev        # Dev server at localhost:4321
npm run build      # Static build to ./dist/
npm run preview    # Preview production build locally
```

## Roadmap

### Milestones

**M1 — Skeleton shipped** (complete)
- Homepage, concept directory, BaseLayout, dark mode, nav

**M2 — Shared engine ready** (complete)
- Progress/milestones system, animation controller hook, shared UI components

**M3 — MVP launch** (complete)
- 3 priority interactives: Graphs, Big-O, Hashing

**M4 — Full concept set** (in progress)
- Subsets interactive done
- Remaining 5 interactives: Permutations, Pairs, Invariants, Birthday Paradox, Recursion

**M5 — Stretch**
- Playground "boss level" combining concepts
- Shareable seeds via URL query params
- Tour mode (next/prev concept navigation)

### Planned Concepts

Each new concept follows this pattern:

| Concept | Interactive | Core Aha |
|---------|------------|----------|
| Subsets | "Subset Dungeon" | Exponential blowup: 2^n subsets from n items |
| Permutations | "Rune Lock" | Permutations vs combinations and when order matters |
| All-Pairs | "Stress Test" | C(n,2) grows quadratically — every pair counts |
| Invariants | "Invariant Detective" | Some quantity never changes, no matter the moves |
| Birthday Paradox | "Collision Counter" | Collisions arrive shockingly early (Monte Carlo sim) |
| Recursion | "Recurrence Tree Builder" | Visualize how recurrences unfold into trees |

### Epic Breakdown

**Epic A — Site scaffold** (done): project init, routes, layout, progress, design system

**Epic B — Shared engine** (partially done):
- Done: animation hook, progress API, graph/growth/hashing/subsets math
- Remaining: seeded RNG, chart primitives, input helpers, query param state codec

**Epic C — Interactives**: C1 Growth Rates (done), C2 Graphs (done), C3 Hashing (done), C4 Subsets (done), C5-C9 planned

**Epic D — Finish**: consistency pass, Lighthouse/perf baseline, tour mode, launch checklist

## Design Principles

- **Aha in < 3 minutes** — each concept page should deliver one clear insight quickly
- **Static-first** — no network calls needed to function; works offline after load
- **Progressive enhancement** — explanations readable with JS disabled; interactives enhance
- **Mobile + desktop** — pointer events, responsive layout, touch-friendly controls
- **Lightweight** — D3 for math only (no DOM manipulation), minimal bundle
- **Accessible** — keyboard navigation, contrast-aware theming, reduced-motion support

## Adding a New Concept

1. Create `src/content/concepts/<slug>.md` with frontmatter:
   ```yaml
   ---
   title: "Concept Name"
   description: "One-line description"
   milestones: ["milestone-1", "milestone-2"]
   ---
   ```

2. Create components in `src/components/<concept>/`:
   - `<Name>Playground.tsx` — orchestrator
   - Supporting sub-components as needed

3. Add pure logic to `src/lib/<concept>.ts`

4. Create `src/pages/concepts/<slug>.astro` that imports the playground with `client:load`

5. Add nav link in `src/layouts/BaseLayout.astro`

6. Update the `ConceptId` type in `src/lib/progress.ts`

## Launch Checklist

- [ ] No network calls needed to function
- [ ] Works without cookies (localStorage optional/graceful)
- [ ] Pages render fine with JS disabled (explanations still readable)
- [ ] Interactive islands fail gracefully
- [ ] Build is deterministic
- [ ] Deploy via Vercel / Netlify / GitHub Pages
