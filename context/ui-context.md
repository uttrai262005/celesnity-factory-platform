# UI Context

## Theme

Light, dense, operational dashboard — this is a tool for factory managers
scanning tables and status indicators quickly, not a marketing site. Think
industrial/utilitarian: high contrast for status states, minimal decoration,
information density over whitespace. No dark mode required for this
assessment (skip building it — time is scarce).

## Colors

| Role | CSS Variable | Value |
|---|---|---|
| Page background | `--bg-base` | `#F7F8FA` |
| Surface (cards/tables) | `--bg-surface` | `#FFFFFF` |
| Primary text | `--text-primary` | `#111827` |
| Muted text | `--text-muted` | `#6B7280` |
| Border | `--border-default` | `#E5E7EB` |
| Primary accent (actions) | `--accent-primary` | `#2563EB` |
| State: PLANNED | `--state-planned` | `#9CA3AF` |
| State: IN_PROGRESS | `--state-in-progress` | `#2563EB` |
| State: BLOCKED | `--state-blocked` | `#DC2626` |
| State: COMPLETED | `--state-completed` | `#16A34A` |
| State: stale/warning | `--state-warning` | `#D97706` |
| Error | `--state-error` | `#DC2626` |
| Success | `--state-success` | `#16A34A` |

## Typography

| Role | Font | Variable |
|---|---|---|
| UI text | Inter | `--font-sans` |
| Data/IDs/codes | JetBrains Mono | `--font-mono` |

Use `--font-mono` for work order IDs, batch IDs, and station codes so they
scan easily in dense tables.

## Border Radius

| Context | Class |
|---|---|
| Inline badges/status pills | `rounded-full` |
| Cards / panels | `rounded-lg` |
| Modals / dialogs | `rounded-xl` |

## Component Library

Tailwind CSS utility classes directly, no external component library
(shadcn/ui is nice-to-have but not worth the setup time for a 6-day
assessment). Build a small internal set in `apps/web/components/`:
`StatusBadge`, `DataTable`, `RunHistoryRow`, `SourceCard`.

## Layout Patterns

- **Data Sources page**: list of source cards at top (one per registered
  source: Application API, Supplier Crawler, Database, MQTT), each showing
  last test status and a "Test" / "Run collection" button. Below: a table
  of recent collection runs with status, duration, counts, error count —
  clicking a run expands its error list.
- **Production Lines page**: one section per line (single line for this
  assessment is fine — "Line 1"), with six station columns matching the
  six steps. Each station column shows: WIP count, batches currently there
  (as cards), freshness indicator (relative time + color per
  `--state-warning` if stale). Clicking a batch opens a detail panel showing
  full event history with provenance links.
- **Status pills**: small rounded-full badges using the state color
  tokens above, used consistently for both batch state and run status.
- **Tables**: dense, borderless rows separated by `--border-default`,
  monospace font for ID columns.

## Icons

Lucide React. Stroke-based icons only. `h-4 w-4` for inline/table icons,
`h-5 w-5` for buttons. Suggested icons: `RefreshCw` (run collection),
`AlertTriangle` (stale/warning), `Lock` (blocked), `CheckCircle2`
(completed), `Clock` (in progress/pending).
