import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Sun, Moon, Bell, Search, Menu, Check, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopbarProps {
  pageTitle?: string;
  onOpenMobileMenu?: () => void;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

interface Notification {
  id: number;
  text: string;
  time: string;
  read: boolean;
}

const DEFAULT_NOTIFICATIONS: Notification[] = [
  { id: 1, text: 'Arjun Rao gave you a Team Player kudo.', time: '10 min ago', read: false },
  { id: 2, text: 'New policy announcement pinned by David Chen.', time: '2 h ago', read: false },
  { id: 3, text: 'Wellness Townhall is tomorrow at 10:00 AM.', time: '1 d ago', read: true },
];

export default function Topbar({
  pageTitle = 'Home',
  onOpenMobileMenu,
  onToggleSidebar,
  isSidebarCollapsed,
}: TopbarProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('pulse_theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const raw = localStorage.getItem('pulse_notifications');
      if (raw) return JSON.parse(raw);
    } catch { /* fall through */ }
    return DEFAULT_NOTIFICATIONS;
  });

  const [showNotifications, setShowNotifications] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pulse_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pulse_theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('pulse_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (!showNotifications) return;
    const onClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [showNotifications]);

  if (!user) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <header className="sticky top-0 z-30 apple-sheet-header h-16 flex items-center px-3 md:px-4 gap-2 md:gap-4 relative">
      {/* Hairline under the topbar */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-border/60"
      />

      {/* Desktop sidebar toggle — leftmost */}
      <button
        onClick={onToggleSidebar}
        className="hidden md:inline-flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors active:scale-95"
        aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isSidebarCollapsed
          ? <PanelLeftOpen className="w-[18px] h-[18px]" />
          : <PanelLeftClose className="w-[18px] h-[18px]" />}
      </button>

      {/* Mobile menu trigger */}
      <button
        onClick={onOpenMobileMenu}
        className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <div className="flex-shrink-0 flex items-center gap-2.5 ml-1">
        <h1 className="text-[17px] md:text-[20px] font-semibold tracking-tight text-foreground leading-none">
          {pageTitle}
        </h1>
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div className="hidden md:flex items-center w-72 relative">
        <Search className="absolute left-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search people, docs, posts…"
          className="apple-input pl-10 text-[13px] py-2"
        />
      </div>

      {/* Theme toggle */}
      <button
        onClick={() => setIsDark((v) => !v)}
        className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors active:scale-95"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Light' : 'Dark'}
      >
        {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
      </button>

      {/* Notifications */}
      <div className="relative" ref={popoverRef}>
        <button
          onClick={() => setShowNotifications((v) => !v)}
          className="relative p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors active:scale-95"
          aria-label="Notifications"
        >
          <Bell className="w-[18px] h-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-apple-red text-white text-[9px] font-semibold flex items-center justify-center border-[1.5px] border-card">
              {unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <div
            className="absolute right-0 mt-2 w-80 material-thick rounded-2xl shadow-apple-lg overflow-hidden animate-scale-in origin-top-right"
            role="dialog"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
              <span className="text-[13px] font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] font-medium text-apple-blue hover:opacity-80 flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-xs text-muted-foreground">
                  You're all caught up.
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="px-4 py-3 flex gap-3 hover:bg-foreground/[0.03] transition-colors">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? 'bg-transparent' : 'bg-apple-blue'}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] text-foreground leading-relaxed">{n.text}</p>
                      <span className="text-[10.5px] text-muted-foreground">{n.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowNotifications(false)}
              className="w-full px-4 py-2.5 border-t border-border/60 text-[11.5px] font-medium text-apple-blue hover:opacity-80"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* User avatar */}
      <button
        onClick={() => navigate('/profile')}
        className="flex items-center gap-2.5 pl-3 ml-1 border-l border-border/60 hover:opacity-90 transition-opacity group"
        title="My profile"
      >
        <span className="relative inline-block rounded-full p-[2px] bg-gradient-to-br from-foreground/60 via-foreground/40 to-foreground/20 shadow-[0_4px_12px_-4px_hsl(var(--foreground)/0.25)] group-hover:shadow-[0_6px_16px_-4px_hsl(var(--foreground)/0.35)] transition-shadow">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full bg-card block"
          />
        </span>
        <div className="hidden lg:flex flex-col items-start leading-none">
          <span className="text-[12.5px] font-semibold text-foreground">{user.name.split(' ')[0]}</span>
          <span className="text-[10.5px] text-muted-foreground mt-0.5 capitalize">{user.role}</span>
        </div>
      </button>
    </header>
  );
}
