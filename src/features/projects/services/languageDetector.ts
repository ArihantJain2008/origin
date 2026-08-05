export function detectLanguage(framework: string): string {
  switch (framework) {
    case "React":
    case "Next.js":
    case "Vue":
    case "Svelte":
    case "Angular":
      return "JavaScript";

    default:
      return "Unknown";
  }
}