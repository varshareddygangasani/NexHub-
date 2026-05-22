import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ToastContainer from './ToastContainer';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Home',
  '/pulse': 'Pulse',
  '/departments': 'Departments',
  '/people': 'People',
  '/recognition': 'Recognition',
  '/documents': 'Knowledge',
  '/forum': 'Forum',
  '/gallery': 'Gallery',
  '/admin': 'Admin',
  '/profile': 'Profile',
};

function titleFor(pathname: string): string {
  if (pathname.startsWith('/profile')) return 'Profile';
  if (pathname.startsWith('/forum/')) return 'Forum';
  const key = '/' + (pathname.split('/')[1] || '');
  return PAGE_TITLES[key] || 'PULSE';
}

export default function AppShell() {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground relative">
      {/* Ambient backdrop — two soft slate blobs, gentle vignette, faint grain. Pure monochrome. */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-foreground/[0.04] blur-[180px]" />
        <div className="absolute -bottom-48 -right-40 w-[700px] h-[700px] rounded-full bg-foreground/[0.03] blur-[180px]" />
        {/* Gentle vignette — only grounds the cards, never dominates */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,hsl(var(--background))_100%)]" />
        {/* Tiny SVG noise for premium texture */}
        <div
          className="absolute inset-0 mix-blend-overlay opacity-[0.018]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />
      </div>

      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
        />
      )}

      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
        <Topbar
          pageTitle={titleFor(location.pathname)}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onToggleSidebar={() => setIsCollapsed((c) => !c)}
          isSidebarCollapsed={isCollapsed}
        />

        <main className="flex-1 overflow-y-auto">
          <div
            key={location.pathname}
            className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-10 flex flex-col gap-6 md:gap-8 animate-fade-in pb-24"
          >
            <Outlet />
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
