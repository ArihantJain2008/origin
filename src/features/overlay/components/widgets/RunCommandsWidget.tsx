import { useEffect, useState } from "react";

import {
  Play,
  Square,
  Plus,
  Trash2,
} from "lucide-react";

import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

import { RunCommand } from "@/features/projects/types/runCommand";

import { useRunCommandStore } from "@/features/projects/store/runCommandStore";

interface RunCommandsWidgetProps {
  projectId: string;
  projectPath: string;
}

const EMPTY_COMMANDS: RunCommand[] = [];

export default function RunCommandsWidget({
  projectId,
  projectPath,
}: RunCommandsWidgetProps) {
  const commands = useRunCommandStore((state) => state.commandsByProject[projectPath] ?? EMPTY_COMMANDS);

  const addCommand =
    useRunCommandStore(
      (state) => state.addCommand
    );

  const removeCommand =
    useRunCommandStore(
      (state) => state.removeCommand
    );

  const [running, setRunning] =
    useState<Record<string, boolean>>(
      {}
    );

  const [launching, setLaunching] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [output, setOutput] = useState<Record<string, string[]>>({});

  const [showForm, setShowForm] =
    useState(false);

  const [name, setName] =
    useState("");

  const [command, setCommand] =
    useState("");

  useEffect(() => {
    let active = true;
    const eventId = `${projectId}:`;
    let unlistenOutput: (() => void) | undefined;
    let unlistenExit: (() => void) | undefined;

    const subscribe = async () => {
      const outputCleanup = await listen<{ id: string; text: string }>(
        "run-command-output",
        (event) => {
          if (!active || !event.payload.id.startsWith(eventId)) return;
          const commandId = event.payload.id.slice(eventId.length);
          setOutput((state) => ({
            ...state,
            [commandId]: [...(state[commandId] ?? []).slice(-39), event.payload.text],
          }));
        }
      );
      const exitCleanup = await listen<{ id: string; success: boolean; code?: number }>(
        "run-command-exited",
        (event) => {
          if (!active || !event.payload.id.startsWith(eventId)) return;
          const commandId = event.payload.id.slice(eventId.length);
          setRunning((state) => ({ ...state, [commandId]: false }));
          if (!event.payload.success) {
            setErrors((state) => ({
              ...state,
              [commandId]: `Command exited${event.payload.code == null ? "" : ` with code ${event.payload.code}`}`,
            }));
          }
        }
      );

      if (!active) {
        outputCleanup();
        exitCleanup();
        return;
      }

      unlistenOutput = outputCleanup;
      unlistenExit = exitCleanup;
    };

    void subscribe();
    return () => {
      active = false;
      unlistenOutput?.();
      unlistenExit?.();
    };
  }, [projectId]);

  async function runCommand(
    commandId: string,
    commandValue: string
  ) {
    if (running[commandId] || launching[commandId]) return;
    setLaunching((state) => ({ ...state, [commandId]: true }));
    setErrors((state) => ({ ...state, [commandId]: "" }));
    setOutput((state) => ({ ...state, [commandId]: [] }));
    try {
        await invoke("launch_run_command", {
          id: `${projectId}:${commandId}`,
          command: commandValue,
          workingDirectory: projectPath,
        });

      setRunning((state) => ({
        ...state,
        [commandId]: true,
      }));
    } catch (error) {
      setErrors((state) => ({ ...state, [commandId]: String(error) }));
      console.error(
        "Failed to launch command:",
        error
      );
    } finally {
      setLaunching((state) => ({ ...state, [commandId]: false }));
    }
  }

  async function stopCommand(
    commandId: string
  ) {
    try {
        await invoke("stop_run_command", { id: `${projectId}:${commandId}` });

      setRunning((state) => ({
        ...state,
        [commandId]: false,
      }));
    } catch (error) {
      console.error(
        "Failed to stop command:",
        error
      );
    }
  }

  function createCommand() {
    const trimmedName =
      name.trim();

    const trimmedCommand =
      command.trim();

    if (
      !trimmedName ||
      !trimmedCommand
    ) {
      return;
    }

    addCommand(projectPath, {
      id: crypto.randomUUID(),
      name: trimmedName,
      command: trimmedCommand,
    });

    setName("");
    setCommand("");
    setShowForm(false);
  }

  return (
    <div className="space-y-3">
      {commands.length === 0 && (
        <div className="py-2">
          <p className="text-[11px] text-white/30">
            No run commands configured.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {commands.map((item) => {
          const isRunning =
            running[item.id] ??
            false;
          const isLaunching = launching[item.id] ?? false;
          const commandOutput = output[item.id] ?? [];
          const commandError = errors[item.id];

          return (
            <div
              key={item.id}
              className="
                group
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-white/[0.05]
                bg-white/[0.02]
                px-2.5
                py-2
              "
            >
              <button
                type="button"
                onClick={() =>
                  isRunning
                    ? stopCommand(
                        item.id
                      )
                    : runCommand(
                        item.id,
                        item.command
                      )
                }
                disabled={isLaunching}
                className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-white/[0.05]
                  text-white/50
                  transition
                  hover:bg-white/[0.09]
                  hover:text-white/80
                "
              >
                {isRunning ? (
                  <Square size={12} />
                ) : (
                  <Play size={12} />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-white/70">
                  {item.name}
                </p>

                <pre
  className="
    mt-0.5
    max-h-10
    overflow-hidden
    whitespace-pre-wrap
    break-words
    font-mono
    text-[9px]
    leading-4
    text-white/25
  "
>
  {item.command}
</pre>
              </div>

              {isRunning && (
                <span className="text-[9px] text-emerald-400/60">
                  Running
                </span>
              )}

              {!isRunning && commandError && (
                <span className="max-w-32 truncate text-[9px] text-red-400/70" title={commandError}>
                  Error
                </span>
              )}

              <button
                type="button"
                onClick={() =>
                  removeCommand(projectPath, item.id)
                }
                className="
                  hidden
                  h-6
                  w-6
                  items-center
                  justify-center
                  rounded-md
                  text-white/20
                  transition
                  hover:bg-red-500/10
                  hover:text-red-400/70
                  group-hover:flex
                "
              >
                <Trash2 size={11} />
              </button>

              {commandOutput.length > 0 && (
                <pre className="max-h-16 overflow-auto whitespace-pre-wrap break-words font-mono text-[9px] text-white/35">
                  {commandOutput.join("\n")}
                </pre>
              )}
            </div>
          );
        })}
      </div>

      {showForm ? (
        <div
          className="
            space-y-2
            rounded-xl
            border
            border-white/[0.06]
            bg-black/20
            p-3
          "
        >
          <input
            value={name}
            onChange={(event) =>
              setName(
                event.target.value
              )
            }
            placeholder="Button name"
            className="
              w-full
              rounded-lg
              border
              border-white/[0.06]
              bg-white/[0.03]
              px-3
              py-2
              text-xs
              text-white/75
              outline-none
              placeholder:text-white/20
              focus:border-white/[0.12]
            "
          />

          <textarea
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            placeholder={"cd frontend\nnpm install\nnpm run dev"}
            rows={3}
            className="
              w-full
              rounded-lg
              border
              border-white/[0.06]
              bg-white/[0.03]
              px-3
              py-2
              font-mono
              text-[10px]
              text-white/75
              outline-none
              placeholder:text-white/20
              focus:border-white/[0.12]
              resize-vertical
            "
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setShowForm(false)
              }
              className="
                flex-1
                rounded-lg
                border
                border-white/[0.06]
                px-3
                py-2
                text-[10px]
                text-white/35
                hover:text-white/60
              "
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={createCommand}
              className="
                flex-1
                rounded-lg
                bg-white/[0.08]
                px-3
                py-2
                text-[10px]
                text-white/65
                hover:bg-white/[0.12]
              "
            >
              Add
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() =>
            setShowForm(true)
          }
          className="
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-lg
            border
            border-dashed
            border-white/[0.08]
            py-2
            text-[10px]
            text-white/30
            transition
            hover:border-white/[0.14]
            hover:text-white/60
          "
        >
          <Plus size={12} />
          Add command
        </button>
      )}
    </div>
  );
}