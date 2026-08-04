import {
  Activity,
  FolderOpen,
  House,
  Monitor,
  Settings,
} from "lucide-react";

import Logo from "./Logo";
import NavItem from "./NavItem";

export default function Sidebar() {
  return (
    <aside className="flex w-64 flex-col border-r border-zinc-800 bg-zinc-900">

      <Logo />

      <nav className="flex flex-1 flex-col gap-2 p-4">

        <NavItem
    icon={House}
    title="Home"
    to="/"
/>

<NavItem
    icon={FolderOpen}
    title="Projects"
    to="/projects"
/>

<NavItem
    icon={Monitor}
    title="Workspace"
    to="/workspace"
/>

<NavItem
    icon={Settings}
    title="Settings"
    to="/settings"
/>

</nav>

      <div className="border-t border-zinc-800 p-4 text-xs text-zinc-500">
        Origin v0.1.2-alpha
      </div>

    </aside>
  );
}