export interface RunCommand {
  id: string;
  name: string;
  command: string;
  workingDirectory?: string;
}