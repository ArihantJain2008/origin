import {
  useMemo,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import {
  Check,
  Circle,
  Trash2,
} from "lucide-react";

import { useTodosStore } from "../../store/todosStore";

const EMPTY_TODOS: Todo[] = [];

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

interface TodosWidgetProps {
  projectPath: string | null | undefined;
}

export default function TodosWidget({ projectPath }: TodosWidgetProps) {
  const todos = useTodosStore((state) => (projectPath ? state.todosByProject[projectPath] ?? EMPTY_TODOS : EMPTY_TODOS));

  const addTodoForProject = useTodosStore((state) => state.addTodoForProject);
  const updateTodoForProject = useTodosStore((state) => state.updateTodoForProject);
  const toggleTodoForProject = useTodosStore((state) => state.toggleTodoForProject);
  const deleteTodoForProject = useTodosStore((state) => state.deleteTodoForProject);

  const addTodo = useTodosStore((state) => state.addTodo);
  const updateTodo = useTodosStore((state) => state.updateTodo);
  const toggleTodo = useTodosStore((state) => state.toggleTodo);
  const deleteTodo = useTodosStore((state) => state.deleteTodo);

  const [value, setValue] =
    useState("");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [editingValue, setEditingValue] =
    useState("");

  const sortedTodos = useMemo(
    () =>
      [...todos].sort(
        (a, b) => {
          if (
            a.completed !==
            b.completed
          ) {
            return a.completed
              ? 1
              : -1;
          }

          return (
            b.updatedAt -
            a.updatedAt
          );
        }
      ),
    [todos]
  );

  const activeCount =
    todos.filter(
      (todo) => !todo.completed
    ).length;

  const completedCount =
    todos.filter(
      (todo) => todo.completed
    ).length;

  const handleSubmit = (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!value.trim()) {
      return;
    }

    if (!projectPath) {
      return;
    }

    addTodoForProject(projectPath, value);
    setValue("");
  };

  const startEditing = (
    id: string,
    text: string
  ) => {
    setEditingId(id);
    setEditingValue(text);
  };

  const saveEditing = () => {
    if (!editingId) {
      return;
    }

    if (!editingValue.trim()) {
      return;
    }

    if (projectPath) {
      updateTodoForProject(projectPath, editingId, editingValue);
    } else {
      updateTodo(editingId, editingValue);
    }

    setEditingId(null);
    setEditingValue("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingValue("");
  };

  const handleEditKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Escape") {
      cancelEditing();
      return;
    }

    if (
      event.key === "Enter" &&
      (event.ctrlKey ||
        event.metaKey)
    ) {
      event.preventDefault();
      saveEditing();
    }
  };

  if (!projectPath) {
    return (
      <div className="space-y-3">
        <div className="py-2">
          <p className="text-[11px] text-white/30">No project selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Add todo */}
      <form
        onSubmit={handleSubmit}
        className="
          flex
          items-center
          gap-2
          rounded-xl
          border
          border-white/[0.06]
          bg-white/[0.03]
          px-3
          py-2
        "
      >
        <Circle
          size={14}
          className="shrink-0 text-white/25"
        />

        <input
          value={value}
          onChange={(event) =>
            setValue(
              event.target.value
            )
          }
          placeholder="Add a task..."
          className="
            min-w-0
            flex-1
            bg-transparent
            text-sm
            text-white/80
            outline-none
            placeholder:text-white/25
          "
        />
      </form>

      {/* Todo list */}
      {sortedTodos.length === 0 ? (
        <div
          className="
            flex
            flex-col
            items-center
            justify-center
            py-5
            text-center
          "
        >
          <Check
            size={18}
            className="text-white/20"
          />

          <p className="mt-2 text-xs text-white/30">
            Nothing to do.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {sortedTodos
            .slice(0, 6)
            .map((todo) => {
              const editing =
                editingId ===
                todo.id;

              if (editing) {
                return (
                  <div
                    key={todo.id}
                    className="
                      rounded-lg
                      border
                      border-white/[0.08]
                      bg-white/[0.03]
                      p-2
                    "
                  >
                    <textarea
                      autoFocus
                      value={
                        editingValue
                      }
                      onChange={(
                        event
                      ) =>
                        setEditingValue(
                          event.target
                            .value
                        )
                      }
                      onKeyDown={
                        handleEditKeyDown
                      }
                      className="
                        min-h-[60px]
                        w-full
                        resize-none
                        bg-transparent
                        text-xs
                        leading-5
                        text-white/75
                        outline-none
                      "
                    />

                    <div
                      className="
                        mt-2
                        flex
                        items-center
                        justify-between
                        text-[10px]
                        text-white/25
                      "
                    >
                      <span>
                        Ctrl + Enter to save
                      </span>

                      <button
                        type="button"
                        onClick={
                          saveEditing
                        }
                        className="
                          rounded
                          px-2
                          py-1
                          text-white/50
                          transition
                          hover:bg-white/[0.06]
                          hover:text-white
                        "
                      >
                        Save
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={todo.id}
                  className="
                    group
                    flex
                    items-center
                    gap-2
                    rounded-lg
                    px-2
                    py-2
                    transition
                    hover:bg-white/[0.04]
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      projectPath ? toggleTodoForProject(projectPath, todo.id) : toggleTodo(todo.id)
                    }
                    className="
                      shrink-0
                      text-white/25
                      transition
                      hover:text-white/60
                    "
                    aria-label={
                      todo.completed
                        ? "Mark incomplete"
                        : "Mark complete"
                    }
                  >
                    {todo.completed ? (
                      <Check
                        size={15}
                        className="text-blue-400"
                      />
                    ) : (
                      <Circle
                        size={15}
                      />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      startEditing(
                        todo.id,
                        todo.text
                      )
                    }
                    className="
                      min-w-0
                      flex-1
                      text-left
                    "
                  >
                    <p
                      className={`
                        text-xs
                        leading-5
                        ${
                          todo.completed
                            ? "text-white/25 line-through"
                            : "text-white/65"
                        }
                      `}
                    >
                      {todo.text}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      projectPath ? deleteTodoForProject(projectPath, todo.id) : deleteTodo(todo.id)
                    }
                    className="
                      shrink-0
                      rounded
                      p-1
                      text-white/20
                      opacity-0
                      transition
                      hover:bg-white/[0.06]
                      hover:text-red-400/80
                      group-hover:opacity-100
                    "
                    aria-label="Delete todo"
                  >
                    <Trash2
                      size={12}
                    />
                  </button>
                </div>
              );
            })}
        </div>
      )}

      {/* Footer */}
      {todos.length > 0 && (
        <div
          className="
            flex
            items-center
            justify-between
            border-t
            border-white/[0.05]
            pt-2
            text-[10px]
            text-white/25
          "
        >
          <span>
            {activeCount} remaining
          </span>

          <span>
            {completedCount} completed
          </span>
        </div>
      )}

      {todos.length > 6 && (
        <p className="text-[10px] text-white/25">
          +{todos.length - 6} more tasks
        </p>
      )}
    </div>
  );
}