import { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

interface NavItemProps {
  icon: LucideIcon;
  title: string;
  to: string;
}

export default function NavItem({
  icon: Icon,
  title,
  to,
}: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-4 py-3 transition ${
          isActive
            ? "bg-blue-600/20 text-blue-400"
            : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
        }`
      }
    >
      <Icon size={18} />
      {title}
    </NavLink>
  );
}