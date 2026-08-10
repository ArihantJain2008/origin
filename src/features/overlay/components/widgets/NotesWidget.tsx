import {
  useMemo,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import {
  Check,
  Pin,
  Plus,
  Trash2,
} from "lucide-react";

import {
  useNotesStore,
  type Note,
} from "../../store/notesStore";

function formatTime(timestamp: number) {
  const difference =
    Date.now() - timestamp;

  const seconds =
    Math.floor(difference / 1000);

  if (seconds < 60) {
    return "just now";
  }

  const minutes =
    Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours =
    Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days =
    Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Date(
    timestamp
  ).toLocaleDateString();
}

const EMPTY_NOTES: Note[] = [];

interface NotesWidgetProps {
  projectPath: string | null | undefined;
}

export default function NotesWidget({ projectPath }: NotesWidgetProps) {
  const notes = useNotesStore((state) => (projectPath ? state.notesByProject[projectPath] ?? EMPTY_NOTES : EMPTY_NOTES));

  const addNoteForProject = useNotesStore((state) => state.addNoteForProject);
  const updateNoteForProject = useNotesStore((state) => state.updateNoteForProject);
  const deleteNoteForProject = useNotesStore((state) => state.deleteNoteForProject);
  const togglePinForProject = useNotesStore((state) => state.togglePinForProject);

  const addNote = useNotesStore((state) => state.addNote);
  const updateNote = useNotesStore((state) => state.updateNote);
  const deleteNote = useNotesStore((state) => state.deleteNote);
  const togglePin = useNotesStore((state) => state.togglePin);

  const [value, setValue] =
    useState("");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [editingValue, setEditingValue] =
    useState("");

  const sortedNotes =
    useMemo(
      () =>
        [...notes].sort(
          (a, b) => {
            if (
              a.pinned !== b.pinned
            ) {
              return a.pinned
                ? -1
                : 1;
            }

            return (
              b.updatedAt -
              a.updatedAt
            );
          }
        ),
      [notes]
    );

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

    addNoteForProject(projectPath, value);
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
      updateNoteForProject(projectPath, editingId, editingValue);
    } else {
      updateNote(editingId, editingValue);
    }

    setEditingId(null);
    setEditingValue("");
  };

  const handleEditKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Escape") {
      setEditingId(null);
      setEditingValue("");
      return;
    }

    if (
      event.key.toLowerCase() ===
        "p" &&
      (event.ctrlKey ||
        event.metaKey)
    ) {
      event.preventDefault();

      if (editingId) {
        if (projectPath) {
          togglePinForProject(projectPath, editingId);
        } else {
          togglePin(editingId);
        }
      }

      return;
    }

    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      saveEditing();
    }
  };

  return (
    <div className="space-y-3">
      {/* New note */}
      {projectPath ? (
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
          <Plus size={15} className="shrink-0 text-white/35" />

          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Jot something down..."
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
      ) : (
        <div className="py-2">
          <p className="text-[11px] text-white/30">No project selected</p>
        </div>
      )}

      {/* Empty state */}
      {sortedNotes.length === 0 ? (
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
            Nothing here yet.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {sortedNotes
            .slice(0, 5)
            .map((note) => {
              const editing =
                editingId ===
                note.id;

              if (editing) {
                return (
                  <div
                    key={note.id}
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
                        min-h-[70px]
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
                  key={note.id}
                  className="
                    group
                    flex
                    items-start
                    gap-2
                    rounded-lg
                    px-2
                    py-2
                    transition
                    hover:bg-white/[0.04]
                  "
                >
                  <div
                    className={`
                      mt-1.5
                      h-1.5
                      w-1.5
                      shrink-0
                      rounded-full
                      ${
                        note.pinned
                          ? "bg-blue-400"
                          : "bg-white/20"
                      }
                    `}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      startEditing(
                        note.id,
                        note.text
                      )
                    }
                    className="
                      min-w-0
                      flex-1
                      text-left
                    "
                  >
                    <p
                      className="
                        text-xs
                        leading-5
                        text-white/65
                      "
                    >
                      {note.text}
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-[10px]
                        text-white/20
                      "
                    >
                      {formatTime(
                        note.updatedAt
                      )}
                    </p>
                  </button>

                  <div
                    className="
                      flex
                      shrink-0
                      items-center
                      gap-0.5
                      opacity-0
                      transition
                      group-hover:opacity-100
                    "
                  >
                    <button
                      type="button"
                      onClick={() =>
                        projectPath
                          ? togglePinForProject(projectPath, note.id)
                          : togglePin(note.id)
                      }
                      className={`
                        rounded
                        p-1
                        transition
                        hover:bg-white/[0.06]
                        ${
                          note.pinned
                            ? "text-blue-400"
                            : "text-white/20 hover:text-white/50"
                        }
                      `}
                      aria-label={
                        note.pinned
                          ? "Unpin note"
                          : "Pin note"
                      }
                    >
                      <Pin size={12} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        projectPath
                          ? deleteNoteForProject(projectPath, note.id)
                          : deleteNote(note.id)
                      }
                      className="
                        rounded
                        p-1
                        text-white/20
                        transition
                        hover:bg-white/[0.06]
                        hover:text-red-400/80
                      "
                      aria-label="Delete note"
                    >
                      <Trash2
                        size={12}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {notes.length > 5 && (
        <p className="text-[10px] text-white/25">
          +{notes.length - 5} more notes
        </p>
      )}
    </div>
  );
}