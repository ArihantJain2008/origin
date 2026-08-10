# Origin TODO

---

# Sprint 7 — Developer Control Center

## Dashboard

TODO: Add workspace overview dashboard.
TODO: Add interactive quick actions.
TODO: Add dashboard refresh action.
TODO: Support dashboard customization.

---

## Editor Integration

TODO: Add preferred editor selector.
TODO: Detect installed editors automatically.
TODO: Support multiple editors.
TODO: Launch projects using selected editor.

> Note: Automatic IDE/project detection was intentionally removed.
> Origin now uses explicit project selection for cross-platform reliability.

---

## Session Management

TODO: Track current development session.
TODO: Store session history.
TODO: Remember last active project.
TODO: Track coding time per session.

---

## Developer Widgets

TODO: Git status widget.
TODO: Terminal widget.
DONE: Project notes widget.
TODO: Spotify integration.
TODO: System resource monitor.
TODO: Recent commands widget.

---

## Quality

TODO: Add unit tests.
TODO: Add integration tests.
TODO: Improve startup performance.
TODO: Improve dashboard rendering performance.
TODO: Improve project analysis performance.

---

# Sprint 8 — Origin Overlay

## Core Overlay

DONE: Global shortcut support.
DONE: Floating developer overlay.
DONE: Quick project switcher.
DONE: Explicit project selection.
DONE: Persist selected project.
DONE: Workspace/project context switching.
DONE: Floating Notes widget.
DONE: Floating Todos widget.
DONE: Floating Project widget.
DONE: Floating Music widget.
DONE: Floating Run Commands widget.
DONE: Draggable widgets.
DONE: Persist widget positions.
DONE: Widget visibility management.
DONE: Widget Manager.
DONE: Project-specific widget data isolation.

---

## Overlay Appearance

DONE: Glass mode.
DONE: Solid mode.
DONE: Transparency control.
DONE: Accent color system.
DONE: Green accent.
DONE: Blue accent.
DONE: Cyan accent.
DONE: Purple accent.
DONE: Red accent.
DONE: Persist appearance settings.
DONE: Settings panel.
DONE: Top project search/selector.
DONE: Replace three-dot control with Settings.

TODO: Further visual polish.
TODO: Improve responsive overlay behavior.

---

## Run Commands

DONE: Project-specific run commands.
DONE: Persist commands per project.
DONE: Add command.
DONE: Remove command.
DONE: Run command.
DONE: Stop command.
DONE: Multiple saved commands.
DONE: Terminal-based command execution.

TODO: Fix/complete multiline command execution.
TODO: Edit existing commands.
TODO: Improve command process/session management.
TODO: Show command output/status inside Origin.
TODO: Improve command error handling.
TODO: Recent commands.

---

# Sprint 9 — Developer Control

## Git

TODO: Git status widget.
TODO: Show current branch.
TODO: Show modified files.
TODO: Show staged/unstaged changes.
TODO: Git commit interface.
TODO: Generate commit script from user input.
TODO: Commit changes directly from Origin.
TODO: Push/pull controls.
TODO: Branch switching.

---

## Terminal

TODO: Dedicated terminal widget.
TODO: Show terminal output inside Origin.
TODO: Support persistent terminal sessions.
TODO: Support multiple terminal sessions.
TODO: Terminal session switching.

---

## Project Controls

TODO: Open project folder.
TODO: Open project in preferred editor.
TODO: Open project terminal.
TODO: Copy project path.
TODO: Project health/status overview.

---

## Notes & Todos

DONE: Project-specific Notes.
DONE: Project-specific Todos.
DONE: Notes persistence.
DONE: Todo persistence.
DONE: Pin notes.
DONE: Complete todos.

TODO: Link notes/todos with project activity.
TODO: Todo counter/analysis integration.
TODO: Improve note organization.
TODO: Todo filtering.

---

## Dashboard

TODO: Workspace overview.
TODO: Active development session overview.
TODO: Recent commands.
TODO: Git activity.
TODO: Project health.
TODO: Customizable dashboard widgets.

---

# Sprint 10 — AI Assistant

TODO: AI project summaries.
TODO: AI code insights.
TODO: AI project health recommendations.
TODO: AI project search.
TODO: AI command execution.
TODO: AI development assistant.

---

# Sprint 11 — Integrations

TODO: Spotify integration.
TODO: GitHub integration.
TODO: GitLab integration.
TODO: Docker integration.
TODO: Kubernetes integration.
TODO: Remote SSH projects.

---

# Sprint 12 — Release Candidate

TODO: Application settings backup.
TODO: Automatic update system.
TODO: Error reporting.
TODO: Performance profiling.
TODO: Accessibility improvements.
TODO: Documentation review.
TODO: Security review.
TODO: Startup performance optimization.
TODO: Prepare public alpha release.

---

# Future Ideas

TODO: Plugin system.
TODO: Theme marketplace.
TODO: Cloud synchronization.
TODO: Team workspaces.
TODO: Mobile companion application.

---

# Origin Product Principles

## Project Context

DONE: Explicit project selection.

Origin should NOT depend on:
- IDE detection
- foreground-window detection
- Windows-specific APIs
- VS Code extensions
- OS-specific workspace detection

The selected project is the source of truth for project-specific Origin data.

---

## Data Isolation

DONE: Project-specific Notes.
DONE: Project-specific Todos.
DONE: Project-specific Run Commands.

Each project must maintain its own:

- Notes
- Todos
- Run Commands
- Project context

Switching projects must immediately switch the associated data.

---

## Global State

Global Origin features include:

DONE: Widget positions.
DONE: Widget visibility.
DONE: Appearance settings.
DONE: Transparency.
DONE: Accent color.
DONE: Music.
DONE: Settings.

---

# Overlay Idea

TODO: Git control — user writes a commit message and Origin generates/executes the appropriate Git commit operation.

---

# Current Priority

1. TODO: Fix multiline Run Commands.
2. TODO: Improve Run Command editing.
3. TODO: Improve Run Command process/session handling.
4. TODO: Add command output/status.
5. TODO: Build Git status integration.
6. TODO: Build useful Project/Git controls.
7. TODO: Add dedicated terminal functionality.
8. TODO: Add tests and performance improvements.
9. TODO: Begin AI Assistant layer.

---

# Completed Foundation

Origin currently has:

DONE: Cross-platform project selection architecture.
DONE: Persistent active project.
DONE: Project-specific data isolation.
DONE: Floating draggable overlay.
DONE: Persistent widget positions.
DONE: Notes widget.
DONE: Todos widget.
DONE: Run Commands widget.
DONE: Project widget.
DONE: Music widget.
DONE: Widget Manager.
DONE: Glass/Solid appearance.
DONE: Transparency slider.
DONE: Accent colors.
DONE: Settings panel.
DONE: Global overlay shortcut.
