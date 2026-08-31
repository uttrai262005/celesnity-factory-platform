## Application Building Context

Read the following files in order before implementing or making any
architectural decision:

1. `context/project-overview.md` — product definition, goals, features, and scope
2. `context/architecture.md` — system structure, boundaries, storage model, and invariants
3. `context/ui-context.md` — theme, colors, typography, and component conventions
4. `context/code-standards.md` — implementation rules and conventions
5. `context/ai-workflow-rules.md` — development workflow, scoping rules, and delivery approach
6. `context/progress-tracker.md` — current phase, completed work, open questions, and next steps

Update `context/progress-tracker.md` after each meaningful implementation change.

If implementation changes the architecture, scope, or standards documented in
the context files, update the relevant file before continuing.

## This project specifically

This is a take-home assessment for Celesnity (Software Track — Factory Data
and Production Line Platform). There is no real Celesnity codebase to clone;
`architecture.md` documents the stack the assessment mandates and the
architecture we are inventing to satisfy it. Do not assume any Celesnity
internal API, package, or convention beyond what is written in `context/`.

Never implement a feature that does not have a spec file in `context/specs/`.
If asked to build something with no spec, stop and say so instead of guessing.
