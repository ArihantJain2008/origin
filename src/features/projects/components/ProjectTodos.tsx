import {
  CheckCircle2,
  ListTodo,
} from "lucide-react";

import { useState } from "react";

import {
  Badge,
  Button,
  Card,
} from "@/shared/components/ui";

import { ProjectDetailsModel } from "../model/projectDetailsModel";

interface ProjectTodosProps {
  model: ProjectDetailsModel;
}

export default function ProjectTodos({
  model,
}: ProjectTodosProps) {
  const [isOpen, setIsOpen] =
    useState(false);

  const todos =
    model.analysis?.todos ?? [];

  const hasTodos =
    todos.length > 0;

  const handleViewTodos = () => {
    setIsOpen((current) => !current);
  };

  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <ListTodo
          size={22}
          className="text-[var(--color-accent-primary)]"
        />

        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            TODOs
          </h2>

          <p className="text-sm text-[var(--color-text-secondary)]">
            Outstanding work detected during analysis.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2
              size={18}
              className={
                hasTodos
                  ? "text-yellow-500"
                  : "text-green-500"
              }
            />

            <div>
              <p className="font-medium text-[var(--color-text-primary)]">
                {todos.length} TODO
                {todos.length !== 1 && "s"}
              </p>

              <p className="text-sm text-[var(--color-text-secondary)]">
                {hasTodos
                  ? "Action items found in the project."
                  : "No TODO comments detected."}
              </p>
            </div>
          </div>

          <Badge
            tone={
              hasTodos
                ? "warning"
                : "success"
            }
          >
            {hasTodos
              ? "Pending"
              : "Clear"}
          </Badge>
        </div>

        <Button
          disabled={!hasTodos}
          onClick={handleViewTodos}
          className="mt-5 w-full"
        >
          {isOpen
            ? "Hide TODOs"
            : "View TODOs"}
        </Button>
      </div>

      {isOpen && hasTodos && (
        <div className="mt-4 space-y-3">
          {todos.map(
            (todo, index) => (
              <div
                key={`${todo.file}-${todo.line}-${index}`}
                className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="break-all font-mono text-xs text-[var(--color-text-tertiary)]">
                      {todo.file}
                      <span className="mx-1">
                        :
                      </span>
                      {todo.line}
                    </p>

                    <p className="mt-2 text-sm text-[var(--color-text-primary)]">
                      {todo.text}
                    </p>
                  </div>

                  <Badge tone="neutral">
                    {todo.kind}
                  </Badge>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </Card>
  );
}