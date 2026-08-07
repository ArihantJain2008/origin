# Origin

> Where every coding session begins.

Origin is a desktop workspace built for developers to organize projects, analyze codebases, and launch development workflows from a single place.

---

## Current Status

🚧 Active Development

Version

v0.6.0-alpha

Current Sprint

Sprint 6 — Architecture Stabilization

---

## Features

### Project Management

- Native project import
- SQLite project persistence
- Favorite projects
- Recent projects
- Project metadata detection
- Launch projects directly

### Project Analysis

- Git repository detection
- Branch & repository status
- README parsing
- TODO detection
- Project health scoring
- Language detection
- Framework detection

### Dashboard

- Workspace overview
- Summary statistics
- Continue Working
- Recent Activity
- Project Insights
- Search projects

### Developer Experience

- Command Palette
- Keyboard shortcuts
- Grid/List layouts
- UI preferences
- Centralized application initialization

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Zustand
- TailwindCSS
- shadcn/ui
- Lucide Icons

### Backend

- Rust
- Tauri
- SQLite

---

## Architecture

Origin follows a feature-first architecture.

```
Application
│
├── Coordinator
├── Stores
├── Services
├── Models
├── Components
└── Shared
```

Key architectural principles:

- Single initialization coordinator
- Centralized project analysis
- Dashboard domain model
- Feature-based organization
- Separation of UI and business logic

---

## Current Roadmap

- ✅ Sprint 1 — Foundation
- ✅ Sprint 2 — Project Management
- ✅ Sprint 3 — Analysis Engine
- ✅ Sprint 4 — Dashboard
- ✅ Sprint 5 — Developer Experience
- ✅ Sprint 6 — Architecture Stabilization

Next

➡ Sprint 7 — Developer Control Center

---

## Vision

Origin aims to become the operating system for developers by bringing projects, tools, automation, and AI into one unified desktop experience.