import { PackageJson } from "../types/packageJson";

export function detectFramework(pkg: PackageJson): string {
  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  if (deps.react) return "React";
  if (deps.next) return "Next.js";
  if (deps.vue) return "Vue";
  if (deps.svelte) return "Svelte";
  if (deps["@angular/core"]) return "Angular";

  return "Unknown";
}