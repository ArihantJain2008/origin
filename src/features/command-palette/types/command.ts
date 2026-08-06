export interface Command {
  id: string;

  title: string;

  subtitle?: string;

  keywords?: string[];

  action: () => void;
}