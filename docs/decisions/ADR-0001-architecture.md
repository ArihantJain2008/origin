# ADR-0001 - Feature Based Architecture

Status: Accepted

Date: 2026-08-04

## Context

Origin is expected to grow into a long-term desktop application with multiple modules including Projects, Workspaces, Sessions, AI, and Plugins.

A scalable folder structure is required.

## Decision

We will organize the frontend using Feature-Based Architecture.

Each feature owns its:

- Components
- Services
- Hooks
- Types
- Store

Shared code lives inside `/shared`.

## Consequences

Advantages

- Better scalability
- Easier maintenance
- Better separation of concerns
- Features remain isolated

Disadvantages

- Slightly more folders in the beginning