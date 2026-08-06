import { Command } from "../types/command";

export function filterCommands(
  commands: Command[],
  query: string
): Command[] {
  if (!query.trim()) {
    return commands;
  }

  const search = query.toLowerCase();

  return commands.filter((command) => {
    return (
      command.title.toLowerCase().includes(search) ||
      command.subtitle?.toLowerCase().includes(search) ||
      command.keywords?.some((keyword) =>
        keyword.toLowerCase().includes(search)
      )
    );
  });
}