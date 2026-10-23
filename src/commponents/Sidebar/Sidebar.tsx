import { Bookmark, Globe, Newspaper, Sparkles } from "lucide-react";
import { NavLink } from "react-router";

const links = [
  { id: "feed", label: "Feed", icon: Newspaper },
  { id: "posts", label: "My Posts", icon: Sparkles },
  { id: "community", label: "Community", icon: Globe },
  { id: "saved", label: "Saved", icon: Bookmark },
];

export default function Sidebar() {


  return (
    <aside className="bg-white rounded-2xl p-3 shadow-sm">
      <ul className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;


          return (
            <li key={link.id}>
              <NavLink
                to={`/${link.id}`}
                className={({isActive}) => `flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${isActive ? "bg-main/10 text-main" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <Icon size={18} />
                {link.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
