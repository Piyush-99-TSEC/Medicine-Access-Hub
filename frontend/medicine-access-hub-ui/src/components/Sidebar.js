import { NavLink } from 'react-router-dom';
import { Search, MapPinned, ClipboardList } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { ROLES } from '../mock/mockData';

const PATIENT_NAV = [
  { to: '/search', label: 'Search Medicine', icon: Search, end: true },
  { to: '/map', label: 'Map Workspace', icon: MapPinned },
  { to: '/reservations', label: 'My Reservations', icon: ClipboardList }
];

// Pharmacy Owner and Admin dashboards use their own top horizontal tabs
// (see PharmacyDashboard.js / AdminDashboard.js), so no sidebar renders for them.
export default function Sidebar() {
  const { role } = useApp();
  if (role !== ROLES.PATIENT) return null;

  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-border bg-surface min-h-[calc(100vh-64px)] py-4 px-3">
      <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wide text-ink-soft">
        Navigation
      </p>
      <nav className="flex flex-col gap-1">
        {PATIENT_NAV.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-tint text-primary' : 'text-ink-soft hover:bg-app hover:text-ink'
                }`
              }
            >
              <Icon size={16} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
