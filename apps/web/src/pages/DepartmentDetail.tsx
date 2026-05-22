import { useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock,
  Lock,
  Mail,
  Sparkles,
  Users2,
} from 'lucide-react';
import { useDataStore } from '../stores/dataStore';
import { useAuthStore } from '../stores/authStore';
import { checkVisibility } from '@pulse/shared/hooks/useVisibility';
import {
  type Initiative,
  STATUS_META,
  findDepartment,
  getDeptIcon,
  getDeptPalette,
} from '../data/departments';

export default function DepartmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { employees } = useDataStore();
  const { user } = useAuthStore();

  const dept = useMemo(() => (id ? findDepartment(id) : undefined), [id]);

  if (!dept) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-4 py-24 animate-fade-in">
        <div className="text-[28px] font-semibold tracking-tight text-foreground">
          Department not found
        </div>
        <p className="text-[14px] text-muted-foreground max-w-md">
          The department you&apos;re looking for doesn&apos;t exist or has been retired.
        </p>
        <Link to="/departments" className="apple-btn-primary mt-2">
          <ArrowLeft className="w-4 h-4" />
          Back to departments
        </Link>
      </div>
    );
  }

  const palette = getDeptPalette(dept.id);
  const DeptIcon = getDeptIcon(dept.iconName);
  const deptHead = employees.find((e) => e.id === dept.headId);
  const teammates = employees.filter((e) => e.departmentId === dept.id);

  const shippedCount = dept.initiatives.filter((i) => i.status === 'shipped').length;
  const inProgressCount = dept.initiatives.filter((i) => i.status === 'in-progress').length;
  const ideationCount = dept.initiatives.filter((i) => i.status === 'ideation').length;

  return (
    <div className="flex flex-col gap-8 text-left animate-fade-in">
      {/* Breadcrumb / back nav */}
      <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground section-rise">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <span className="opacity-40">/</span>
        <Link to="/departments" className="hover:text-foreground transition-colors">
          Departments
        </Link>
        <span className="opacity-40">/</span>
        <span className="text-foreground font-medium truncate">{dept.name}</span>
      </div>

      {/* Hero */}
      <header
        className="relative overflow-hidden rounded-3xl section-rise"
        style={{
          background: `linear-gradient(135deg, ${palette.accentSoft} 0%, transparent 65%), hsl(var(--card))`,
          border: '1px solid hsl(var(--border))',
        }}
      >
        {/* Decorative aurora */}
        <div
          className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full opacity-50 blur-3xl pointer-events-none"
          style={{ background: palette.gradient }}
        />
        <div
          className="absolute -bottom-32 -left-16 w-[320px] h-[320px] rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ background: palette.gradient }}
        />

        <div className="relative px-6 md:px-10 py-8 md:py-10 flex flex-col gap-6">
          <div className="flex items-start gap-4 md:gap-5">
            <div
              className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-white shrink-0"
              style={{
                background: palette.gradient,
                boxShadow: `0 18px 40px -16px ${palette.glow}, inset 0 1px 0 rgba(255,255,255,0.32)`,
              }}
            >
              <DeptIcon className="w-7 h-7" />
            </div>

            <div className="flex flex-col gap-2 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="inline-flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] px-2 py-0.5 rounded-full"
                  style={{
                    background: palette.accentSoft,
                    color: palette.accent,
                  }}
                >
                  Department
                </span>
                {dept.openRoles > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
                    {dept.openRoles} open role{dept.openRoles !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <h1 className="text-[28px] md:text-[32px] font-semibold tracking-tight text-foreground leading-[1.1]">
                {dept.name}
              </h1>

              <p className="text-[14px] md:text-[15px] text-muted-foreground leading-relaxed max-w-3xl">
                {dept.mission}
              </p>
            </div>
          </div>

          {/* Stat strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-2">
            <StatTile
              icon={Users2}
              label="Headcount"
              value={String(dept.headcount)}
              accent={palette.accent}
            />
            <StatTile
              icon={Briefcase}
              label="Open roles"
              value={String(dept.openRoles)}
              accent={palette.accent}
            />
            <StatTile
              icon={Sparkles}
              label="Shipped"
              value={String(shippedCount)}
              accent="#10B981"
            />
            <StatTile
              icon={Clock}
              label="In flight"
              value={String(inProgressCount + ideationCount)}
              accent="#F59E0B"
            />
          </div>
        </div>
      </header>

      {/* Two column layout: leader + team / initiatives */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Sidebar — leadership + team */}
        <aside className="flex flex-col gap-6">
          {/* Leader card */}
          {deptHead && (
            <div
              className="apple-card p-5 flex flex-col gap-4 relative overflow-hidden"
              style={{
                background: `linear-gradient(180deg, ${palette.accentSoft} 0%, hsl(var(--card)) 60%)`,
              }}
            >
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Department lead
              </span>
              <Link
                to={`/profile/${deptHead.id}`}
                className="flex items-center gap-3 group"
              >
                <div
                  className="rounded-full p-[2px]"
                  style={{ background: palette.gradient }}
                >
                  <img
                    src={deptHead.avatar}
                    alt={deptHead.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-card"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold text-foreground truncate group-hover:underline">
                    {deptHead.name}
                  </div>
                  <div className="text-[12px] text-muted-foreground truncate">
                    {deptHead.jobTitle}
                  </div>
                </div>
              </Link>

              <div className="flex items-center gap-2 text-[12px] text-muted-foreground border-t border-border/70 pt-3">
                <Mail className="w-3.5 h-3.5" />
                <a
                  href={`mailto:${deptHead.email}`}
                  className="truncate hover:text-foreground transition-colors"
                >
                  {deptHead.email}
                </a>
              </div>
            </div>
          )}

          {/* Teammates */}
          <div className="apple-card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-foreground">Team</span>
              <span className="text-[11.5px] text-muted-foreground">
                {teammates.length} member{teammates.length !== 1 ? 's' : ''}
              </span>
            </div>

            {teammates.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border py-6 text-center text-[12px] text-muted-foreground">
                No teammates assigned yet
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {teammates.map((tm) => (
                  <Link
                    key={tm.id}
                    to={`/profile/${tm.id}`}
                    className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-muted/60 transition-colors"
                  >
                    <img
                      src={tm.avatar}
                      alt={tm.name}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium text-foreground truncate">
                        {tm.name}
                      </div>
                      <div className="text-[11.5px] text-muted-foreground truncate">
                        {tm.jobTitle}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main — initiatives board */}
        <section className="flex flex-col gap-5 min-w-0">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-semibold tracking-tight text-foreground">
              Initiatives
            </h2>
            <span className="text-[12px] text-muted-foreground">
              {dept.initiatives.length} total
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['ideation', 'in-progress', 'shipped'] as const).map((status) => {
              const items = dept.initiatives.filter((i) => i.status === status);
              const meta = STATUS_META[status];
              const Icon = meta.icon;

              return (
                <div key={status} className="flex flex-col gap-3 min-w-0">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full"
                        style={{
                          background: `${meta.accent}1F`,
                          color: meta.accent,
                        }}
                      >
                        <Icon className="w-3 h-3" />
                      </span>
                      <span className="text-[12.5px] font-semibold text-foreground">
                        {meta.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{items.length}</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {items.map((init) => (
                      <InitiativeCard
                        key={init.id}
                        init={init}
                        deptId={dept.id}
                        userRole={user?.role}
                        userDept={user?.departmentId}
                      />
                    ))}
                    {items.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-border py-6 text-center text-[12px] text-muted-foreground">
                        Nothing here yet
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Users2;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="apple-card px-4 py-3.5 flex items-center gap-3">
      <span
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
        style={{ background: `${accent}1F`, color: accent }}
      >
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0">
        <div className="text-[18px] font-semibold tracking-tight text-foreground leading-none">
          {value}
        </div>
        <div className="text-[11px] text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  );
}

function InitiativeCard({
  init,
  deptId,
  userRole,
  userDept,
}: {
  init: Initiative;
  deptId: string;
  userRole?: string;
  userDept?: string;
}) {
  const isVisible = checkVisibility(
    init.visibility,
    (userRole ?? 'employee') as Parameters<typeof checkVisibility>[1],
    userDept ?? '',
    deptId,
  );

  const { employees } = useDataStore();
  const owner = employees.find((e) => e.id === init.ownerId);
  const status = STATUS_META[init.status];
  const StatusIcon = status.icon;

  if (!isVisible) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-4 flex flex-col gap-3 bg-muted/30 select-none">
        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium">
          <Lock className="w-3 h-3" />
          <span>Restricted</span>
        </div>
        <div>
          <div className="h-3 w-3/4 bg-muted rounded-md mb-2" />
          <div className="h-2 w-full bg-muted rounded-md mb-1" />
          <div className="h-2 w-2/3 bg-muted rounded-md" />
        </div>
        <div className="text-[11px] text-muted-foreground">
          {init.visibility === 'dept' ? 'Department-scoped' : 'HR / Admin only'}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold"
          style={{
            background: `${status.accent}1F`,
            color: status.accent,
          }}
        >
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </span>
        <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(init.startDate).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>

      <div>
        <h4 className="text-[14px] font-semibold tracking-tight text-foreground leading-snug">
          {init.title}
        </h4>
        <p className="text-[12.5px] text-muted-foreground mt-1 leading-relaxed">
          {init.description}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/70">
        <div className="flex items-center gap-2 min-w-0">
          {owner && (
            <img
              src={owner.avatar}
              alt={owner.name}
              className="w-6 h-6 rounded-full object-cover shrink-0"
              title={`Owner: ${owner.name}`}
            />
          )}
          <span className="text-[12px] text-muted-foreground truncate">
            {owner?.name.split(' ')[0] ?? 'Unassigned'}
          </span>
        </div>

        <div className="flex -space-x-1.5">
          {init.teamIds.slice(0, 3).map((id) => {
            const tm = employees.find((e) => e.id === id);
            if (!tm) return null;
            return (
              <img
                key={id}
                src={tm.avatar}
                alt={tm.name}
                title={tm.name}
                className="w-5 h-5 rounded-full object-cover ring-2 ring-card"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
