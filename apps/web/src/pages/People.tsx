import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDataStore } from '../stores/dataStore';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import {
  Users2,
  Search,
  MapPin,
  ChevronRight,
  X,
  ChevronDown,
  SlidersHorizontal,
  Workflow,
  LayoutGrid,
  ChevronUp,
  Briefcase,
  Pencil,
  Plus,
  Check,
} from 'lucide-react';
import { SkeletonCard } from '../components/Skeleton';

const MAX_TAG_LENGTH = 30;
const MAX_TAGS = 20;

// Apple-tinted department color mapping (token name only; classes built explicitly below)
type AppleTint =
  | 'blue'
  | 'indigo'
  | 'purple'
  | 'pink'
  | 'orange'
  | 'green'
  | 'yellow'
  | 'cyan'
  | 'gray'
  | 'teal';

const getDeptTint = (deptId: string): AppleTint => {
  switch (deptId) {
    case 'dept-eng':
      return 'blue';
    case 'dept-product':
      return 'purple';
    case 'dept-design':
      return 'pink';
    case 'dept-hr':
      return 'orange';
    case 'dept-sales':
      return 'green';
    case 'dept-marketing':
      return 'yellow';
    case 'dept-finance':
      return 'cyan';
    case 'dept-operations':
      return 'gray';
    case 'dept-cs':
      return 'teal';
    case 'dept-exec':
      return 'indigo';
    default:
      return 'gray';
  }
};

const getDeptName = (deptId: string): string => {
  switch (deptId) {
    case 'dept-eng':
      return 'Engineering';
    case 'dept-product':
      return 'Product';
    case 'dept-design':
      return 'Design';
    case 'dept-hr':
      return 'People';
    case 'dept-cs':
      return 'Customer Success';
    case 'dept-sales':
      return 'Sales';
    case 'dept-marketing':
      return 'Marketing';
    case 'dept-finance':
      return 'Finance';
    case 'dept-operations':
      return 'Operations';
    case 'dept-exec':
      return 'Executive';
    default:
      return 'Corporate';
  }
};

// Org-chart reporting line (matches mocked profile structure)
const getManagerId = (id: string): string | undefined => {
  if (id === 'emp-david') return undefined;
  if (id === 'emp-priya' || id === 'emp-tariq') return 'emp-meera';
  if (id === 'emp-elena') return 'emp-marcus';
  return 'emp-david';
};

export default function People() {
  const { employees, updateUserTags } = useDataStore();
  const { user } = useAuthStore();
  const { showToast } = useToastStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'directory' | 'org-chart'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timer);
  }, []);

  // Inline tag-edit drafts for the signed-in user's own profile.
  // `null` means "not editing"; an array means "editing".
  const [draftSkills, setDraftSkills] = useState<string[] | null>(null);
  const [draftInterests, setDraftInterests] = useState<string[] | null>(null);
  const [draftLanguages, setDraftLanguages] = useState<string[] | null>(null);

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'emp-david': true,
    'emp-meera': true,
    'emp-marcus': true,
  });

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  // Legacy deep-link support: ?emp=<id> → redirect to /profile/:id
  useEffect(() => {
    const emp = searchParams.get('emp');
    if (emp) {
      const next = new URLSearchParams(searchParams);
      next.delete('emp');
      setSearchParams(next, { replace: true });
      navigate(`/profile/${emp}`);
    }
  }, [searchParams, setSearchParams, navigate]);

  const employeesWithManagers = useMemo(
    () => employees.map((emp) => ({ ...emp, managerId: getManagerId(emp.id) })),
    [employees]
  );

  const allSkills = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((emp) => emp.skills.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [employees]);

  const allLocations = useMemo(
    () => Array.from(new Set(employees.map((emp) => emp.location))).sort(),
    [employees]
  );

  const filteredEmployees = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return employeesWithManagers.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(q) ||
        emp.jobTitle.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.skills.some((s) => s.toLowerCase().includes(q)) ||
        getDeptName(emp.departmentId).toLowerCase().includes(q);
      const matchesDept = selectedDept === 'all' || emp.departmentId === selectedDept;
      const matchesLocation = selectedLocation === 'all' || emp.location === selectedLocation;
      const matchesSkill = selectedSkill === 'all' || emp.skills.includes(selectedSkill);
      return matchesSearch && matchesDept && matchesLocation && matchesSkill;
    });
  }, [employeesWithManagers, searchQuery, selectedDept, selectedLocation, selectedSkill]);

  const selectedEmployee = useMemo(
    () => employeesWithManagers.find((emp) => emp.id === selectedEmployeeId),
    [employeesWithManagers, selectedEmployeeId]
  );

  const isOwnProfile = !!(user && selectedEmployee && user.id === selectedEmployee.id);

  const subordinates = useMemo(() => {
    if (!selectedEmployeeId) return [];
    return employeesWithManagers.filter((emp) => emp.managerId === selectedEmployeeId);
  }, [employeesWithManagers, selectedEmployeeId]);

  const reportingChain = useMemo(() => {
    if (!selectedEmployee) return [];
    const chain: typeof employeesWithManagers = [];
    let current = selectedEmployee;
    while (current && current.managerId) {
      const manager = employeesWithManagers.find((emp) => emp.id === current.managerId);
      if (!manager) break;
      chain.unshift(manager);
      current = manager;
    }
    return chain;
  }, [employeesWithManagers, selectedEmployee]);

  const resetTagDrafts = () => {
    setDraftSkills(null);
    setDraftInterests(null);
    setDraftLanguages(null);
  };

  const handleOpenProfile = (empId: string) => {
    navigate(`/profile/${empId}`);
  };

  // Sanitize + validate a tag list. Returns null + toast on validation failure.
  const sanitizeTags = (list: string[], label: string): string[] | null => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of list) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      if (trimmed.length > MAX_TAG_LENGTH) {
        showToast(`${label} entries must be ${MAX_TAG_LENGTH} characters or fewer.`, 'warning');
        return null;
      }
      const key = trimmed.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(trimmed);
    }
    if (out.length > MAX_TAGS) {
      showToast(`Limit ${MAX_TAGS} ${label.toLowerCase()} per profile.`, 'warning');
      return null;
    }
    return out;
  };

  const saveSkills = () => {
    if (!user || draftSkills === null) return;
    const cleaned = sanitizeTags(draftSkills, 'Skills');
    if (cleaned === null) return;
    updateUserTags(user.id, { skills: cleaned });
    setDraftSkills(null);
    showToast('Skills updated.', 'success');
  };

  const saveInterests = () => {
    if (!user || draftInterests === null) return;
    const cleaned = sanitizeTags(draftInterests, 'Interests');
    if (cleaned === null) return;
    updateUserTags(user.id, { interests: cleaned });
    setDraftInterests(null);
    showToast('Interests updated.', 'success');
  };

  const saveLanguages = () => {
    if (!user || draftLanguages === null) return;
    const cleaned = sanitizeTags(draftLanguages, 'Languages');
    if (cleaned === null) return;
    updateUserTags(user.id, { languages: cleaned });
    setDraftLanguages(null);
    showToast('Languages updated.', 'success');
  };

  const hasActiveFilters =
    selectedDept !== 'all' || selectedLocation !== 'all' || selectedSkill !== 'all';

  const resetFilters = () => {
    setSelectedDept('all');
    setSelectedLocation('all');
    setSelectedSkill('all');
    setSearchQuery('');
  };

  return (
    <div className="flex flex-col gap-6 text-left animate-fade-in">
      {/* Page title + tabs */}
      <header className="flex flex-col gap-5 section-rise">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-[28px] md:text-[34px] font-semibold tracking-tight text-foreground">
              People
            </h1>
            <p className="text-[14px] text-muted-foreground mt-1 max-w-xl">
              Browse teammates, search by skill or location, and explore how teams report into each other.
            </p>
          </div>

          <div className="apple-segment shrink-0">
            <button
              onClick={() => setActiveTab('directory')}
              className={`apple-segment-item ${activeTab === 'directory' ? 'apple-segment-item-active' : ''}`}
            >
              <LayoutGrid className="w-4 h-4" /> Directory
            </button>
            <button
              onClick={() => setActiveTab('org-chart')}
              className={`apple-segment-item ${activeTab === 'org-chart' ? 'apple-segment-item-active' : ''}`}
            >
              <Workflow className="w-4 h-4" /> Org chart
            </button>
          </div>
        </div>
      </header>

      {/* Sticky toolbar */}
      {activeTab === 'directory' && (
        <div className="lg:sticky lg:top-2 z-20 glass-panel p-4 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search name, title, skill, location, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="apple-input pl-11 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`apple-btn-ghost border border-border/60 ${
                showFilters || hasActiveFilters ? 'bg-apple-blue/12 text-apple-blue border-apple-blue/30' : ''
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-apple-blue" />}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-border/60 animate-slide-up">
              <FilterSelect
                label="Department"
                value={selectedDept}
                onChange={setSelectedDept}
                options={[
                  { value: 'all', label: 'All departments' },
                  { value: 'dept-eng', label: 'Engineering' },
                  { value: 'dept-product', label: 'Product' },
                  { value: 'dept-design', label: 'Design' },
                  { value: 'dept-hr', label: 'People' },
                  { value: 'dept-cs', label: 'Customer Success' },
                  { value: 'dept-sales', label: 'Sales' },
                  { value: 'dept-marketing', label: 'Marketing' },
                  { value: 'dept-finance', label: 'Finance' },
                  { value: 'dept-operations', label: 'Operations' },
                  { value: 'dept-exec', label: 'Executive' },
                ]}
              />
              <FilterSelect
                label="Location"
                value={selectedLocation}
                onChange={setSelectedLocation}
                options={[
                  { value: 'all', label: 'All locations' },
                  ...allLocations.map((l) => ({ value: l, label: l })),
                ]}
              />
              <FilterSelect
                label="Skill"
                value={selectedSkill}
                onChange={setSelectedSkill}
                options={[
                  { value: 'all', label: 'All skills' },
                  ...allSkills.map((s) => ({ value: s, label: s })),
                ]}
              />

              {hasActiveFilters && (
                <div className="md:col-span-3 flex justify-end">
                  <button
                    onClick={resetFilters}
                    className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-[13px] text-muted-foreground">
            <span>
              {filteredEmployees.length} of {employees.length} people
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {allLocations.length} offices
            </span>
          </div>
        </div>
      )}

      {/* Directory grid */}
      {activeTab === 'directory' && (
        <div className="flex flex-col gap-5">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="glass-panel p-12 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-secondary text-muted-foreground flex items-center justify-center">
                <Users2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold tracking-tight text-foreground">
                  No matches
                </h3>
                <p className="text-[13.5px] text-muted-foreground max-w-sm mt-1 mx-auto">
                  Try widening your filters or clearing the search.
                </p>
              </div>
              <button onClick={resetFilters} className="apple-btn-secondary">
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
              {filteredEmployees.map((emp) => {
                const tint = getDeptTint(emp.departmentId);
                const isCurrentUser = emp.id === user?.id;

                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => handleOpenProfile(emp.id)}
                    className="glass-card relative overflow-hidden p-0 text-left active:scale-[0.99] group"
                  >
                    {/* Cover band — liquid glass gradient led by the department tint */}
                    <div
                      aria-hidden="true"
                      className={`h-20 w-full bg-gradient-to-br from-apple-${tint}/40 via-apple-cyan/25 to-apple-teal/30 relative`}
                    >
                      <span className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--apple-cyan)/0.45),transparent_55%)]" />
                      <span className="absolute inset-0 bg-[radial-gradient(circle_at_85%_70%,hsl(var(--apple-indigo)/0.25),transparent_55%)]" />
                    </div>

                    {/* Card body */}
                    <div className="px-5 pb-5 pt-0 -mt-9">
                      <div className="flex items-end justify-between gap-3">
                        <div className="avatar-ring avatar-ring-square avatar-ring-lg shrink-0 relative">
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-16 h-16 object-cover"
                          />
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card z-10 ${
                              emp.isActive ? 'bg-apple-green' : 'bg-muted-foreground/40'
                            }`}
                            aria-label={emp.isActive ? 'Online' : 'Offline'}
                          />
                        </div>

                        <span
                          className={`text-[10.5px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-apple-${tint}/15 text-apple-${tint} border border-apple-${tint}/25 mb-1`}
                        >
                          {getDeptName(emp.departmentId)}
                        </span>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-[16px] font-semibold tracking-tight text-foreground truncate">
                            {emp.name}
                          </h3>
                          {isCurrentUser && (
                            <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-apple-cyan via-apple-blue to-apple-teal text-white shadow-sm">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] text-muted-foreground truncate mt-0.5">
                          {emp.jobTitle}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-[12px] text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-apple-blue/80" />
                        <span className="truncate">{emp.location}</span>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-apple-blue/20 to-apple-cyan/20 border border-apple-blue/25"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-apple-blue" />
                          </span>
                          <span className="text-[11.5px] text-muted-foreground">
                            <span className="font-semibold text-foreground">L{emp.level}</span>
                            <span className="mx-1.5 text-border">·</span>
                            <span className="font-semibold text-foreground">{emp.points}</span> pts
                          </span>
                        </div>
                        <span className="text-[12px] font-semibold text-apple-blue flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                          View <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Org chart */}
      {activeTab === 'org-chart' && (
        <div className="glass-panel p-6 overflow-x-auto">
          <div className="min-w-[900px] flex flex-col items-center py-4">
            <div className="flex items-center gap-4 mb-8 px-4 py-2 rounded-full bg-secondary/70">
              <span className="text-[12px] text-muted-foreground">Legend</span>
              <LegendDot tint="indigo" label="Executive" />
              <LegendDot tint="purple" label="Leadership" />
              <LegendDot tint="blue" label="Contributor" />
            </div>

            {(() => {
              const ceo = employeesWithManagers.find((e) => e.id === 'emp-david');
              if (!ceo) return null;
              const isExpanded = expandedNodes['emp-david'];
              const level2 = employeesWithManagers.filter((e) => e.managerId === 'emp-david');

              return (
                <div className="flex flex-col items-center w-full">
                  <div className="relative flex flex-col items-center">
                    <OrgCard
                      employee={ceo}
                      tint="indigo"
                      size="lg"
                      label="CEO"
                      onClick={() => handleOpenProfile(ceo.id)}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNode('emp-david');
                      }}
                      className="w-6 h-6 rounded-full bg-card border border-border hover:bg-primary hover:text-primary-foreground flex items-center justify-center absolute -bottom-3 z-10 transition-colors shadow-sm"
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="w-full flex flex-col items-center mt-8">
                      <div className="w-px h-8 bg-border" />
                      <div className="w-[85%] border-t border-border" />
                      <div className="flex justify-center gap-5 mt-6 flex-wrap max-w-full">
                        {level2.map((sub) => {
                          const subReports = employeesWithManagers.filter(
                            (e) => e.managerId === sub.id
                          );
                          const hasSubs = subReports.length > 0;
                          const subExpanded = expandedNodes[sub.id];
                          const subTint = getDeptTint(sub.departmentId);

                          return (
                            <div key={sub.id} className="flex flex-col items-center">
                              <div className="relative flex flex-col items-center">
                                <OrgCard
                                  employee={sub}
                                  tint={subTint}
                                  size="md"
                                  label={getDeptName(sub.departmentId)}
                                  onClick={() => handleOpenProfile(sub.id)}
                                />
                                {hasSubs && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleNode(sub.id);
                                    }}
                                    className="w-5 h-5 rounded-full bg-card border border-border hover:bg-primary hover:text-primary-foreground flex items-center justify-center absolute -bottom-2.5 z-10 transition-colors shadow-sm"
                                    aria-label={subExpanded ? 'Collapse' : 'Expand'}
                                  >
                                    {subExpanded ? (
                                      <ChevronUp className="w-3 h-3" />
                                    ) : (
                                      <ChevronDown className="w-3 h-3" />
                                    )}
                                  </button>
                                )}
                              </div>

                              {hasSubs && subExpanded && (
                                <div className="flex flex-col items-center mt-6">
                                  <div className="w-px h-6 bg-border" />
                                  <div className="w-[60%] border-t border-border" />
                                  <div className="flex justify-center gap-4 mt-4 flex-wrap">
                                    {subReports.map((child) => {
                                      const childTint = getDeptTint(child.departmentId);
                                      return (
                                        <OrgCard
                                          key={child.id}
                                          employee={child}
                                          tint={childTint}
                                          size="sm"
                                          label={getDeptName(child.departmentId)}
                                          onClick={() => handleOpenProfile(child.id)}
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Small components ---------- */

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] text-muted-foreground">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="apple-input pr-10 appearance-none cursor-pointer"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}

function LegendDot({ tint, label }: { tint: AppleTint; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2.5 h-2.5 rounded-full bg-apple-${tint}`} />
      <span className="text-[12px] text-foreground/80">{label}</span>
    </div>
  );
}

function OrgCard({
  employee,
  tint,
  size,
  label,
  onClick,
}: {
  employee: { id: string; avatar: string; name: string; jobTitle: string };
  tint: AppleTint;
  size: 'lg' | 'md' | 'sm';
  label: string;
  onClick: () => void;
}) {
  const dims =
    size === 'lg'
      ? 'w-60 p-4'
      : size === 'md'
      ? 'w-52 p-3.5'
      : 'w-44 p-3';
  const imgSize = size === 'lg' ? 'w-12 h-12' : size === 'md' ? 'w-10 h-10' : 'w-9 h-9';
  const titleSize = size === 'sm' ? 'text-[12px]' : 'text-[13.5px]';
  const subtitleSize = size === 'sm' ? 'text-[10.5px]' : 'text-[11.5px]';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`glass-card ${dims} text-center flex flex-col items-center gap-2 active:scale-[0.98]`}
    >
      <img src={employee.avatar} alt={employee.name} className={`${imgSize} rounded-xl bg-secondary`} />
      <div className="w-full">
        <h4 className={`${titleSize} font-semibold tracking-tight text-foreground truncate`}>
          {employee.name}
        </h4>
        <p className={`${subtitleSize} text-muted-foreground truncate mt-0.5`}>
          {employee.jobTitle}
        </p>
      </div>
      <span
        className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-apple-${tint}/12 text-apple-${tint}`}
      >
        {label}
      </span>
    </button>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary/60 p-4">
      <div className="text-[12px] text-muted-foreground">{label}</div>
      <div className="text-[16px] font-semibold tracking-tight text-foreground mt-1">{value}</div>
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-[13.5px]">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="truncate text-right">{value}</span>
    </div>
  );
}

function ChainRow({
  employee,
  role,
  compact,
  onClick,
}: {
  employee: { id: string; avatar: string; name: string; jobTitle: string };
  role: string;
  compact?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 p-2.5 rounded-2xl bg-secondary/60 hover:bg-secondary transition-colors text-left ${
        compact ? 'min-w-0' : ''
      }`}
    >
      <img src={employee.avatar} alt={employee.name} className="w-8 h-8 rounded-lg bg-card shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-foreground truncate">{employee.name}</div>
        <div className="text-[11.5px] text-muted-foreground truncate">{employee.jobTitle}</div>
      </div>
      <span className="text-[10.5px] text-muted-foreground flex items-center gap-1 shrink-0">
        <Briefcase className="w-3 h-3" />
        {role}
      </span>
    </button>
  );
}

function SocialBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="w-9 h-9 rounded-full bg-secondary hover:bg-apple-blue/12 hover:text-apple-blue text-foreground/80 flex items-center justify-center transition-colors active:scale-[0.97]"
    >
      {children}
    </a>
  );
}

/* ---------- Tag editing ---------- */

function TagSection({
  title,
  tags,
  isOwner,
  draft,
  setDraft,
  onSave,
  chipClass,
  placeholder,
}: {
  title: string;
  tags: string[];
  isOwner: boolean;
  draft: string[] | null;
  setDraft: (next: string[] | null) => void;
  onSave: () => void;
  chipClass: string;
  placeholder: string;
}) {
  const editing = draft !== null;
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-semibold tracking-tight text-foreground">{title}</h3>
        {isOwner && !editing && (
          <button
            type="button"
            onClick={() => setDraft([...tags])}
            className="apple-btn-ghost text-[12px] py-1 px-2.5"
            aria-label={`Edit ${title.toLowerCase()}`}
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        )}
      </div>

      {!editing ? (
        tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className={`px-2.5 py-1 rounded-full text-[12px] font-medium ${chipClass}`}
              >
                {t}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[12.5px] text-muted-foreground italic">
            No {title.toLowerCase()} added yet.
          </p>
        )
      ) : (
        <div className="flex flex-col gap-3">
          <TagChipsEditor
            tags={draft as string[]}
            setTags={(next) => setDraft(next)}
            chipClass={chipClass}
            placeholder={placeholder}
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="apple-btn-ghost text-[12px] py-1 px-3"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              className="apple-btn-primary text-[12px] py-1 px-3"
            >
              <Check className="w-3.5 h-3.5" />
              Save
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function TagChipsEditor({
  tags,
  setTags,
  chipClass,
  placeholder,
}: {
  tags: string[];
  setTags: (next: string[]) => void;
  chipClass: string;
  placeholder: string;
}) {
  const [draftInput, setDraftInput] = useState('');

  const addTag = () => {
    const trimmed = draftInput.trim();
    if (!trimmed) return;
    const exists = tags.some((t) => t.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setDraftInput('');
      return;
    }
    if (trimmed.length > MAX_TAG_LENGTH) return;
    if (tags.length >= MAX_TAGS) return;
    setTags([...tags, trimmed]);
    setDraftInput('');
  };

  const removeTag = (idx: number) => {
    setTags(tags.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((t, i) => (
        <span
          key={`${t}-${i}`}
          className={`group/chip inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium ${chipClass}`}
        >
          <span>{t}</span>
          <button
            type="button"
            onClick={() => removeTag(i)}
            aria-label={`Remove ${t}`}
            className="w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-foreground/10 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <div className="inline-flex items-center gap-1 rounded-full bg-foreground/[0.04] border border-border/60 pl-2.5 pr-1 py-0.5">
        <input
          type="text"
          value={draftInput}
          onChange={(e) => setDraftInput(e.target.value.slice(0, MAX_TAG_LENGTH))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
          maxLength={MAX_TAG_LENGTH}
          className="bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground outline-none w-28 sm:w-32"
        />
        <button
          type="button"
          onClick={addTag}
          aria-label="Add tag"
          className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40"
          disabled={!draftInput.trim() || tags.length >= MAX_TAGS}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
