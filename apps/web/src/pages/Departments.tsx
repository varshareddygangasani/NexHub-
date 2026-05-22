import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDataStore } from '../stores/dataStore';
import { SkeletonCard } from '../components/Skeleton';
import {
  ArrowUpRight,
  Building2,
  CircleDot,
  Search,
  Sparkles,
  UserPlus2,
  Users2,
} from 'lucide-react';
import {
  DEPARTMENTS,
  getDeptIcon,
  getDeptPalette,
} from '../data/departments';

export default function Departments() {
  const { employees } = useDataStore();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 320);
    return () => clearTimeout(timer);
  }, []);

  const stats = useMemo(() => {
    const totalDepts = DEPARTMENTS.length;
    const totalPeople = DEPARTMENTS.reduce((sum, d) => sum + d.headcount, 0);
    const totalOpenRoles = DEPARTMENTS.reduce((sum, d) => sum + d.openRoles, 0);
    const activeInitiatives = DEPARTMENTS.reduce(
      (sum, d) => sum + d.initiatives.filter((i) => i.status === 'in-progress').length,
      0,
    );
    return { totalDepts, totalPeople, totalOpenRoles, activeInitiatives };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DEPARTMENTS;
    return DEPARTMENTS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.mission.toLowerCase().includes(q) ||
        d.slug.toLowerCase().includes(q),
    );
  }, [query]);

  const summaryItems = [
    {
      label: 'Departments',
      value: stats.totalDepts,
      icon: Building2,
      accent: '#6366F1',
    },
    {
      label: 'People',
      value: stats.totalPeople,
      icon: Users2,
      accent: '#10B981',
    },
    {
      label: 'Open roles',
      value: stats.totalOpenRoles,
      icon: UserPlus2,
      accent: '#F59E0B',
    },
    {
      label: 'Active initiatives',
      value: stats.activeInitiatives,
      icon: Sparkles,
      accent: '#EC4899',
    },
  ];

  return (
    <div className="flex flex-col gap-8 text-left animate-fade-in">
      <header className="flex flex-col gap-5 section-rise">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Organisation map
            </span>
            <h1 className="text-[32px] font-semibold tracking-tight text-foreground leading-[1.05]">
              Departments
            </h1>
            <p className="text-[14px] text-muted-foreground max-w-2xl">
              Explore each team&apos;s focus, leadership, headcount, and active initiatives across the
              company.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search teams or missions…"
              className="apple-input pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {summaryItems.map(({ label, value, icon: Icon, accent }) => (
            <div
              key={label}
              className="dept-stat group"
              style={{ ['--stat-accent' as string]: accent }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.14em] font-semibold text-muted-foreground">
                  {label}
                </span>
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `${accent}1A`,
                    color: accent,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-3 text-[26px] font-semibold tracking-tight text-foreground tabular-nums leading-none">
                {value}
              </div>
            </div>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground">
            <Search className="w-5 h-5" />
          </div>
          <div className="text-[15px] font-semibold text-foreground">No matches</div>
          <p className="text-[13px] text-muted-foreground max-w-sm">
            We couldn&apos;t find any departments matching &ldquo;{query}&rdquo;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger">
          {filtered.map((dept) => {
            const palette = getDeptPalette(dept.id);
            const DeptIcon = getDeptIcon(dept.iconName);
            const deptHead = employees.find((e) => e.id === dept.headId);
            const activeCount = dept.initiatives.filter((i) => i.status === 'in-progress').length;
            const shippedCount = dept.initiatives.filter((i) => i.status === 'shipped').length;

            return (
              <Link
                key={dept.id}
                to={`/departments/${dept.slug}`}
                className="dept-card group relative overflow-hidden"
                style={{
                  ['--dept-accent' as string]: palette.accent,
                  ['--dept-soft' as string]: palette.accentSoft,
                  ['--dept-ring' as string]: palette.ring,
                  ['--dept-glow' as string]: palette.glow,
                }}
              >
                <span
                  className="dept-card-accent-strip"
                  style={{ background: palette.gradient }}
                  aria-hidden
                />

                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(120% 70% at 0% 0%, var(--dept-soft) 0%, transparent 55%), radial-gradient(80% 60% at 100% 100%, var(--dept-soft) 0%, transparent 60%)`,
                  }}
                  aria-hidden
                />

                <div className="relative flex items-start justify-between">
                  <div
                    className="dept-card-icon"
                    style={{
                      background: palette.gradient,
                      boxShadow: `0 10px 24px -10px ${palette.glow}, inset 0 1px 0 rgba(255,255,255,0.32)`,
                    }}
                  >
                    <DeptIcon className="w-5 h-5" />
                  </div>

                  {dept.openRoles > 0 ? (
                    <span
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all duration-300 group-hover:scale-105"
                      style={{
                        background: palette.accentSoft,
                        color: palette.accent,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ background: palette.accent }}
                      />
                      {dept.openRoles} open
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
                      Fully staffed
                    </span>
                  )}
                </div>

                <div className="relative flex flex-col gap-1.5 mt-1">
                  <h3 className="text-[15.5px] font-semibold tracking-tight text-foreground leading-snug">
                    {dept.name}
                  </h3>
                  <p className="text-[12.5px] text-muted-foreground line-clamp-3 leading-relaxed">
                    {dept.mission}
                  </p>
                </div>

                <div className="relative flex items-center gap-1.5 text-[11px] font-medium">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md"
                    style={{ background: palette.accentSoft, color: palette.accent }}
                  >
                    <CircleDot className="w-3 h-3" />
                    {activeCount} active
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">
                    <Sparkles className="w-3 h-3" />
                    {shippedCount} shipped
                  </span>
                </div>

                <div className="relative flex items-center justify-between pt-4 mt-auto border-t border-border/70">
                  <div className="flex items-center gap-2 min-w-0">
                    {deptHead && (
                      <img
                        src={deptHead.avatar}
                        alt={deptHead.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0 ring-2 ring-card"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="text-[12px] font-medium text-foreground truncate">
                        {deptHead?.name ?? 'Leadership'}
                      </div>
                      <div className="text-[10.5px] text-muted-foreground">Department lead</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[11.5px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Users2 className="w-3.5 h-3.5" />
                      {dept.headcount}
                    </span>
                    <span
                      className="inline-flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      style={{
                        background: palette.accentSoft,
                        color: palette.accent,
                      }}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
