import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
  LayoutDashboard,
  Radar,
  Workflow,
  Users2,
  Trophy,
  Library,
  MessagesSquare,
  Images,
  ShieldCheck,
  LogOut,
  X,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

type NavItem = {
  name: string;
  path: string;
  icon: typeof LayoutDashboard;
  roles: ('employee' | 'hr' | 'admin')[];
};

const WORKSPACE: NavItem[] = [
  { name: 'Home', path: '/', icon: LayoutDashboard, roles: ['employee', 'hr', 'admin'] },
  { name: 'Pulse', path: '/pulse', icon: Radar, roles: ['employee', 'hr', 'admin'] },
  { name: 'Departments', path: '/departments', icon: Workflow, roles: ['employee', 'hr', 'admin'] },
  { name: 'People', path: '/people', icon: Users2, roles: ['employee', 'hr', 'admin'] },
  { name: 'Recognition', path: '/recognition', icon: Trophy, roles: ['employee', 'hr', 'admin'] },
  { name: 'Knowledge', path: '/documents', icon: Library, roles: ['employee', 'hr', 'admin'] },
  { name: 'Forum', path: '/forum', icon: MessagesSquare, roles: ['employee', 'hr', 'admin'] },
  { name: 'Gallery', path: '/gallery', icon: Images, roles: ['employee', 'hr', 'admin'] },
];

const ADMIN: NavItem[] = [
  { name: 'Admin', path: '/admin', icon: ShieldCheck, roles: ['hr', 'admin'] },
];

export default function Sidebar({
  isCollapsed: isCollapsedProp,
  isMobileOpen,
  setIsMobileOpen,
}: SidebarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setIsMobileOpen?.(false);
    navigate('/login');
  };

  const workspaceItems = WORKSPACE.filter((i) => i.roles.includes(user.role));
  const adminItems = ADMIN.filter((i) => i.roles.includes(user.role));

  // The layout spacer reflects the toggle intent so the page never reflows on hover.
  const layoutCollapsed = isCollapsedProp && !isMobileOpen;
  // The aside's actual visual state — hover expands while the toggle is collapsed.
  const isCollapsed = layoutCollapsed && !isHovered;
  const collapsedW = 'md:w-[76px]';
  const expandedW = 'md:w-[272px]';

  return (
    <>
      <div
        className={[
          'shrink-0 hidden md:block transition-[width] duration-300 ease-apple',
          layoutCollapsed ? collapsedW : expandedW,
        ].join(' ')}
        aria-hidden="true"
      />

      <aside
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        className={[
          'group/sb',
          'fixed inset-y-0 left-0 z-50',
          'h-screen flex flex-col',
          'material-thin border-r border-border/60',
          'transition-[width,transform,box-shadow] duration-300 ease-apple will-change-[width]',
          // Mobile drawer
          'w-72',
          // Desktop width (collapsed by toggle, expanded by hover)
          isCollapsed ? collapsedW : expandedW,
          // Lift the panel when hover-expanded over content
          layoutCollapsed && !isCollapsed ? 'md:shadow-2xl md:shadow-foreground/10' : '',
          // Mobile slide
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0',
        ].join(' ')}
      >
        {/* Trailing edge hairline */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 w-px h-full bg-border/60"
        />

        {/* ============ Brand row ============ */}
        <div
          className={[
            'h-16 shrink-0 flex items-center border-b border-border/50 overflow-hidden',
            isCollapsed ? 'justify-center px-0' : 'justify-between px-3',
          ].join(' ')}
        >
          <button
            onClick={() => {
              navigate('/');
              setIsMobileOpen?.(false);
            }}
            className={[
              'flex items-center gap-2.5 min-w-0',
              isCollapsed ? 'justify-center' : 'flex-1 px-1',
            ].join(' ')}
            aria-label="Go home"
            title="PULSE"
          >
            <div className="w-9 h-9 flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105">
              <svg
                viewBox="0 0 40 48"
                className="w-8 h-8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  fill="#6d28d9"
                  d="m10.7788 6.1817 4.6901 17.5036v-19.24382c.3719-.08679.7478-.16322 1.1273-.22897v19.47459l5.2752-19.6871c.3801.03442.7572.07945 1.1309.13479l-5.3176 19.84571 10.5701-18.30794c.3443.15492.6835.31927 1.0172.49274l-10.6095 18.3763 15.1464-15.1465c.2731.25824.5389.52407.7971.7972l-15.1486 15.1487 18.3784-10.6108c.1734.3337.3377.6729.4926 1.0173l-18.3034 10.5675 19.8403-5.3162c.0553.3737.1003.7508.1347 1.1309l-19.6869 5.2751h19.4741c-.0658.3796-.1422.7554-.229 1.1273h-19.2481l17.507 4.691c-.1798.3443-.3693.6827-.5681 1.0149l-17.2257-4.6156 14.3874 8.3066c-.2723.2801-.5528.5522-.8411.8161l-14.1087-8.1457 10.6759 10.6758c-.3377.1973-.6817.385-1.0316.5628l-10.4426-10.4426 6.8421 11.8508c-.3746.1059-.7537.2012-1.1368.2855l-6.6825-11.5744 3.2219 12.0243c-.2872.0122-.5759.0184-.8661.0184-.0991 0-.198-.0007-.2967-.0022l-3.1483-11.7497v11.4569c-.3795-.0657-.7554-.1421-1.1273-.2289v-11.2261l-2.7759 10.36c-.3541-.1396-.7033-.289-1.0471-.4478l2.7337-10.2024-5.13175 8.8884c-.3177-.2034-.62928-.4156-.9344-.6361l5.09135-8.8186-7.1301 7.1302c-.2731-.2583-.53893-.5241-.79717-.7971l7.12787-7.1279-8.81599 5.0899c-.22059-.3051-.4328-.6167-.6363-.9344l8.89259-5.1341-10.20737 2.735c-.15888-.3438-.3083-.693-.44793-1.047l10.3599-2.776h-11.226124c-.086806-.3719-.163256-.7477-.22903-1.1273h11.452154l-11.74511583-3.1471c-.00145443-.0995-.00218417-.1991-.00218417-.2989 0-.2894.00613487-.5774.0182816-.8639l12.0258184 3.2224-11.57621-6.6836c.084291-.3832.179549-.7623.285427-1.1369l11.855683 6.8449-10.44698-10.447c.17774-.3499.36544-.6939.56273-1.0315l10.68025 10.6802-8.14896-14.1144c.26387-.2882.53605-.56863.81617-.84096l8.30809 14.38996-4.61634-17.22828c.33214-.1988.67064-.38826 1.01484-.56802z"
                />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="leading-none text-left whitespace-nowrap overflow-hidden">
                <div className="text-[15px] font-semibold tracking-tight text-foreground">PULSE</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Corporate Intranet</div>
              </div>
            )}
          </button>

          {/* Mobile close */}
          <button
            onClick={() => setIsMobileOpen?.(false)}
            className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 ml-1"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============ Nav ============ */}
        <nav className="flex-1 px-2.5 py-2 overflow-y-auto overflow-x-hidden">
          {!isCollapsed && <div className="sb-group-label">Workspace</div>}
          {isCollapsed && (
            <div className="h-3" aria-hidden="true" />
          )}

          <ul className={['flex flex-col gap-1', isCollapsed ? 'items-center' : ''].join(' ')}>
            {workspaceItems.map((item) => (
              <NavRow
                key={item.path}
                item={item}
                isCollapsed={isCollapsed}
                onClick={() => setIsMobileOpen?.(false)}
              />
            ))}
          </ul>

          {adminItems.length > 0 && (
            <>
              {!isCollapsed ? (
                <div className="sb-group-label">Admin</div>
              ) : (
                <div className="my-3 mx-auto w-8 h-px bg-border/70" aria-hidden="true" />
              )}
              <ul className={['flex flex-col gap-1', isCollapsed ? 'items-center' : ''].join(' ')}>
                {adminItems.map((item) => (
                  <NavRow
                    key={item.path}
                    item={item}
                    isCollapsed={isCollapsed}
                    onClick={() => setIsMobileOpen?.(false)}
                  />
                ))}
              </ul>
            </>
          )}
        </nav>

        {/* ============ Footer ============ */}
        <div
          className={[
            'p-2.5 border-t border-border/50 shrink-0',
            isCollapsed ? 'flex flex-col items-center gap-1.5' : 'flex flex-col gap-1.5',
          ].join(' ')}
        >
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Sign out' : undefined}
            className={[
              'h-10 flex items-center gap-3 rounded-xl text-[13.5px] font-medium transition-all duration-200 border border-transparent',
              'text-apple-red/90 hover:text-apple-red hover:bg-apple-red/10 hover:border-apple-red/25',
              isCollapsed ? 'w-10 justify-center px-0' : 'w-full justify-start px-3',
            ].join(' ')}
            aria-label="Sign out"
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />
            {!isCollapsed && <span className="truncate whitespace-nowrap">Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

/* ---------- NavRow ---------- */
function NavRow({
  item,
  isCollapsed,
  onClick,
}: {
  item: NavItem;
  isCollapsed: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <li className={isCollapsed ? 'w-10' : 'w-full'}>
      <NavLink
        to={item.path}
        end={item.path === '/'}
        onClick={onClick}
        title={isCollapsed ? item.name : undefined}
        className={({ isActive }) =>
          [
            'sb-item',
            isActive ? 'sb-item-active' : '',
            isCollapsed ? 'w-10 h-10 justify-center px-0' : 'justify-start px-3',
          ].join(' ')
        }
      >
        <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />
        {!isCollapsed && <span className="truncate whitespace-nowrap">{item.name}</span>}
      </NavLink>
    </li>
  );
}
