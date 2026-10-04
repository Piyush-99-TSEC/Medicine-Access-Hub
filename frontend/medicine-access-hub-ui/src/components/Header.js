import { useNavigate } from 'react-router-dom';
import { Pill, ChevronDown, User, ClipboardList, Bell, Settings, LogOut, Boxes, ShieldCheck, Store } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext.js';
import { ROLES } from '../mock/mockData';

const ROLE_TITLE = {
  [ROLES.PATIENT]: 'Patient',
  [ROLES.PHARMACY_OWNER]: 'Pharmacy Owner',
  [ROLES.ADMIN]: 'System Admin'
};

const HOME_BY_ROLE = {
  [ROLES.PATIENT]: '/search',
  [ROLES.PHARMACY_OWNER]: '/pharmacy-dashboard/inventory',
  [ROLES.ADMIN]: '/admin/verification'
};

function initials(name = '') {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

export default function Header() {
  const { currentUser, role, logout, showToast } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function handleLogout() {
    setOpen(false);
    logout();
    navigate('/login');
  }

  function placeholder(label) {
    setOpen(false);
    showToast(`${label} is coming soon.`, 'success');
  }

  if (!currentUser) return null;

  const roleLinks = {
    [ROLES.PATIENT]: [
      { label: 'My Profile', icon: User, action: () => placeholder('Profile') },
      { label: 'My Reservations', icon: ClipboardList, action: () => navigate('/reservations') },
      { label: 'List Your Pharmacy', icon: Store, action: () => navigate('/pharmacy-register') }
    ],
    [ROLES.PHARMACY_OWNER]: [
      { label: 'My Profile', icon: User, action: () => placeholder('Profile') },
      { label: 'Inventory', icon: Boxes, action: () => navigate('/pharmacy-dashboard/inventory') },
      { label: 'Reservations', icon: ClipboardList, action: () => navigate('/pharmacy-dashboard/reservations') }
    ],
    [ROLES.ADMIN]: [
      { label: 'My Profile', icon: User, action: () => placeholder('Profile') },
      { label: 'System Administration', icon: ShieldCheck, action: () => navigate('/admin/verification') }
    ]
  }[role] || [];

  return (
    <header className="sticky top-0 z-[1000] bg-surface border-b border-border">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        <button onClick={() => navigate(HOME_BY_ROLE[role])} className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Pill size={18} className="text-white" strokeWidth={2.25} />
          </div>
          <div className="leading-tight text-left">
            <p className="font-display font-semibold text-[15px] text-ink">Medicine Access Hub</p>
            <p className="text-[11px] text-ink-soft -mt-0.5">Find it nearby. Right now.</p>
          </div>
        </button>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-2 rounded-full border border-border bg-app pl-2 pr-2.5 py-1.5 hover:border-primary/40 transition-colors"
          >
            <span className="w-7 h-7 rounded-full bg-primary text-white text-[11px] font-semibold flex items-center justify-center">
              {initials(currentUser.name)}
            </span>
            <span className="text-sm font-medium text-ink hidden sm:inline">{currentUser.name}</span>
            <ChevronDown size={15} className="text-ink-soft" />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-surface shadow-card p-1.5 animate-fade-in">
              <div className="px-2.5 pt-1.5 pb-2 border-b border-border mb-1">
                <p className="text-sm font-medium text-ink">{currentUser.name}</p>
                <p className="text-xs text-ink-soft">{currentUser.email}</p>
                <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary-tint text-primary">
                  {ROLE_TITLE[role]}
                </span>
              </div>

              {roleLinks.map(link => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.label}
                    onClick={link.action}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-ink hover:bg-app transition-colors"
                  >
                    <Icon size={15} />
                    {link.label}
                  </button>
                );
              })}
              <button onClick={() => placeholder('Notifications')} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-ink hover:bg-app transition-colors">
                <Bell size={15} /> Notifications
              </button>
              <button onClick={() => placeholder('Settings')} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-ink hover:bg-app transition-colors">
                <Settings size={15} /> Settings
              </button>

              <div className="border-t border-border mt-1 pt-1">
                <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-danger hover:bg-danger/5 transition-colors">
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
