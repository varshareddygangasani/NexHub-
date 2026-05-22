import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';
import { useToastStore } from '../stores/toastStore';
import {
  ArrowLeft,
  MapPin,
  Mail,
  CalendarDays,
  Briefcase,
  Building2,
  Star,
  Languages as LanguagesIcon,
  Linkedin,
  Github,
  Twitter,
  Trophy,
  Award,
  Sparkles,
  Pencil,
  Plus,
  Check,
  X,
  MessagesSquare,
  Workflow,
  User as UserIcon,
  Globe,
  Share2,
  Copy,
  MoreHorizontal,
  Activity as ActivityIcon,
  Settings as SettingsIcon,
  LogOut,
  Users as UsersIcon,
  MessageCircle,
  Heart,
  Rocket,
  ChevronRight,
} from 'lucide-react';
import { Skeleton } from '../components/Skeleton';

const MAX_TAG_LENGTH = 30;
const MAX_TAGS = 20;

type AppleTint =
  | 'blue' | 'indigo' | 'purple' | 'pink' | 'orange'
  | 'green' | 'yellow' | 'cyan' | 'gray' | 'teal';

function getDeptTint(deptId: string): AppleTint {
  switch (deptId) {
    case 'dept-eng': return 'blue';
    case 'dept-product': return 'purple';
    case 'dept-design': return 'pink';
    case 'dept-hr': return 'orange';
    case 'dept-sales': return 'green';
    case 'dept-marketing': return 'yellow';
    case 'dept-finance': return 'cyan';
    case 'dept-operations': return 'gray';
    case 'dept-cs': return 'teal';
    case 'dept-exec': return 'indigo';
    default: return 'gray';
  }
}

function getDeptName(deptId: string): string {
  switch (deptId) {
    case 'dept-eng': return 'Engineering';
    case 'dept-product': return 'Product';
    case 'dept-design': return 'Design';
    case 'dept-hr': return 'People';
    case 'dept-cs': return 'Customer Success';
    case 'dept-sales': return 'Sales';
    case 'dept-marketing': return 'Marketing';
    case 'dept-finance': return 'Finance';
    case 'dept-operations': return 'Operations';
    case 'dept-exec': return 'Executive';
    default: return 'Corporate';
  }
}

function sanitizeTags(input: string[], showToast: (m: string, t?: 'warning' | 'success' | 'info' | 'error') => void): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of input) {
    const t = raw.trim().slice(0, MAX_TAG_LENGTH);
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  if (out.length > MAX_TAGS) {
    showToast(`Limited to ${MAX_TAGS} tags — extras removed.`, 'warning');
    return out.slice(0, MAX_TAGS);
  }
  return out;
}

interface TagEditorProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tint: AppleTint;
  value: string[];
  canEdit: boolean;
  onSave: (next: string[]) => void;
}

function TagEditor({ label, icon: Icon, tint, value, canEdit, onSave }: TagEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string[]>(value);
  const [input, setInput] = useState('');

  const start = () => {
    setDraft(value);
    setInput('');
    setEditing(true);
  };
  const cancel = () => {
    setEditing(false);
    setInput('');
  };
  const add = () => {
    const t = input.trim().slice(0, MAX_TAG_LENGTH);
    if (!t) return;
    if (draft.some((d) => d.toLowerCase() === t.toLowerCase())) return;
    if (draft.length >= MAX_TAGS) return;
    setDraft([...draft, t]);
    setInput('');
  };
  const remove = (t: string) => setDraft(draft.filter((d) => d !== t));
  const save = () => {
    onSave(draft);
    setEditing(false);
    setInput('');
  };

  const tintBg = `bg-apple-${tint}/12`;
  const tintText = `text-apple-${tint}`;

  return (
    <div className="glass-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-foreground flex items-center gap-2">
          <span className={`w-7 h-7 rounded-lg ${tintBg} ${tintText} flex items-center justify-center`}>
            <Icon className="w-3.5 h-3.5" />
          </span>
          {label}
          <span className="text-[11px] text-muted-foreground font-normal ml-1">
            ({(editing ? draft : value).length})
          </span>
        </h3>
        {canEdit && !editing && (
          <button
            onClick={start}
            className="text-[12px] font-medium text-apple-blue hover:opacity-80 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-apple-blue/5"
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(editing ? draft : value).length === 0 ? (
          <span className="text-[12px] text-muted-foreground italic">
            {canEdit ? `Add your first ${label.toLowerCase()}.` : `No ${label.toLowerCase()} listed.`}
          </span>
        ) : (
          (editing ? draft : value).map((t) => (
            <span
              key={t}
              className={`group/chip inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${tintBg} ${tintText} text-[12px] font-medium transition-all`}
            >
              {t}
              {editing && (
                <button
                  onClick={() => remove(t)}
                  className="opacity-60 hover:opacity-100 hover:text-apple-red transition-colors"
                  aria-label={`Remove ${t}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))
        )}
      </div>

      {editing && (
        <div className="flex flex-col gap-2 pt-2 border-t border-border/60">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  add();
                }
              }}
              placeholder={`Add a ${label.slice(0, -1).toLowerCase()}…`}
              maxLength={MAX_TAG_LENGTH}
              className="apple-input flex-1 text-[12.5px] py-1.5"
            />
            <button
              onClick={add}
              disabled={!input.trim()}
              className="p-2 rounded-lg bg-apple-blue/10 text-apple-blue hover:bg-apple-blue/15 disabled:opacity-40 transition-colors"
              aria-label="Add"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <button onClick={cancel} className="apple-btn-ghost text-[12px] py-1.5 px-3">
              Cancel
            </button>
            <button onClick={save} className="apple-btn-primary text-[12px] py-1.5 px-3">
              <Check className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Inline Apple-style toggle switch                                          */
/* -------------------------------------------------------------------------- */
interface AppleSwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
}

function AppleSwitch({ checked, onChange, label, description }: AppleSwitchProps) {
  return (
    <label className="flex items-center justify-between gap-4 py-2.5 cursor-pointer">
      <div className="flex flex-col min-w-0">
        <span className="text-[13px] font-medium text-foreground">{label}</span>
        {description && (
          <span className="text-[11.5px] text-muted-foreground mt-0.5">{description}</span>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={[
          'relative shrink-0 inline-flex h-[24px] w-[42px] rounded-full transition-colors duration-200',
          checked ? 'bg-apple-green' : 'bg-foreground/15',
        ].join(' ')}
        aria-pressed={checked}
        aria-label={label}
      >
        <span
          className={[
            'absolute top-[2px] h-[20px] w-[20px] rounded-full bg-white shadow-apple-sm transition-transform duration-200',
            checked ? 'translate-x-[20px]' : 'translate-x-[2px]',
          ].join(' ')}
        />
      </button>
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */
function titleCase(s: string): string {
  return s
    .replace(/[-_]/g, ' ')
    .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const min = 60 * 1000;
  const hr = 60 * min;
  const day = 24 * hr;
  if (diff < hr) return `${Math.max(1, Math.floor(diff / min))}m ago`;
  if (diff < day) return `${Math.floor(diff / hr)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/* -------------------------------------------------------------------------- */
/*  Profile page                                                              */
/* -------------------------------------------------------------------------- */
type TabKey = 'overview' | 'activity' | 'recognition' | 'settings';

export default function Profile() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { user: authUser } = useAuthStore();
  const { employees, kudos, feed, wins, updateUserTags } = useDataStore();
  const { showToast } = useToastStore();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('overview');
  const [recognitionLimit, setRecognitionLimit] = useState(10);

  // Initial paint shimmer
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(t);
  }, [id]);

  // Reset tab when target changes
  useEffect(() => {
    setTab('overview');
    setRecognitionLimit(10);
  }, [id]);

  // Resolve target employee: explicit /profile/:id or /profile (self)
  const employee = useMemo(() => {
    if (!authUser) return null;
    const target = id || authUser.id;
    return employees.find((e) => e.id === target) || null;
  }, [id, authUser, employees]);

  const manager = useMemo(
    () => (employee?.managerId ? employees.find((e) => e.id === employee.managerId) : null),
    [employee, employees],
  );

  const directReports = useMemo(() => {
    if (!employee) return [];
    return employees.filter((e) => e.managerId === employee.id);
  }, [employee, employees]);

  const allReceivedKudos = useMemo(() => {
    if (!employee) return [];
    return kudos
      .filter((k) => k.toId === employee.id)
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [employee, kudos]);

  const givenKudos = useMemo(() => {
    if (!employee) return [];
    return kudos
      .filter((k) => k.fromId === employee.id)
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [employee, kudos]);

  const userPosts = useMemo(() => {
    if (!employee) return [];
    return feed
      .filter((p) => p.authorId === employee.id && p.status === 'published')
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [employee, feed]);

  const userWins = useMemo(() => {
    if (!employee) return [];
    return wins
      .filter((w) => w.teamIds.includes(employee.id))
      .slice()
      .sort((a, b) => new Date(b.wonAt).getTime() - new Date(a.wonAt).getTime())
      .slice(0, 5);
  }, [employee, wins]);

  // Most common kudos value received
  const topKudosValue = useMemo(() => {
    if (allReceivedKudos.length === 0) return null;
    const counts: Record<string, number> = {};
    for (const k of allReceivedKudos) counts[k.value] = (counts[k.value] || 0) + 1;
    let best: string | null = null;
    let max = 0;
    for (const [v, c] of Object.entries(counts)) {
      if (c > max) {
        max = c;
        best = v;
      }
    }
    return best;
  }, [allReceivedKudos]);

  /* ----- Settings local state (own only, optimistic, mocked persistence) -- */
  const [editAbout, setEditAbout] = useState({
    jobTitle: employee?.jobTitle || '',
    pronouns: employee?.pronouns || '',
    location: employee?.location || '',
    bio: employee?.bio || '',
    funFact: employee?.funFact || '',
  });
  useEffect(() => {
    if (employee) {
      setEditAbout({
        jobTitle: employee.jobTitle,
        pronouns: employee.pronouns || '',
        location: employee.location,
        bio: employee.bio,
        funFact: employee.funFact,
      });
    }
  }, [employee?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [visibility, setVisibility] = useState({
    directory: true,
    dms: true,
    showPoints: true,
  });
  const [notifs, setNotifs] = useState({
    daily: true,
    weekly: true,
    kudos: true,
  });

  if (!authUser) return null;

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-9 w-40" rounded="md" />
        <div className="glass-panel p-6 md:p-8 flex flex-col gap-6">
          <div className="flex items-center gap-5">
            <Skeleton rounded="full" className="w-24 h-24" />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-5 flex flex-col gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="glass-panel p-10 text-center">
        <h2 className="text-[20px] font-semibold tracking-tight text-foreground">
          Profile not found
        </h2>
        <p className="text-[13px] text-muted-foreground mt-2">
          We couldn't find a teammate with that ID.
        </p>
        <button onClick={() => navigate('/people')} className="apple-btn-primary mt-5 text-[13px]">
          <ArrowLeft className="w-4 h-4" /> Back to People
        </button>
      </div>
    );
  }

  const isOwn = employee.id === authUser.id;
  const isManagerOfMe = authUser.managerId === employee.id;
  const tint = getDeptTint(employee.departmentId);
  const deptName = getDeptName(employee.departmentId);

  const handleSaveTags = (field: 'skills' | 'interests' | 'languages') => (next: string[]) => {
    const clean = sanitizeTags(next, showToast);
    updateUserTags(employee.id, { [field]: clean });
    showToast(`${field.charAt(0).toUpperCase() + field.slice(1)} updated.`, 'success');
  };

  // Friendly join date
  const joinedDate = new Date(employee.joinedAt);
  const monthsAtCompany = Math.max(
    0,
    (new Date().getFullYear() - joinedDate.getFullYear()) * 12 +
      (new Date().getMonth() - joinedDate.getMonth()),
  );
  const tenure = monthsAtCompany >= 12 ? `${Math.floor(monthsAtCompany / 12)}y ${monthsAtCompany % 12}mo` : `${monthsAtCompany} mo`;

  // Peer & dept stats
  const deptHeadcount = employees.filter((e) => e.departmentId === employee.departmentId).length;
  const peerCount = Math.max(0, deptHeadcount - 1);

  /* --------------------------------- handlers -------------------------------- */
  const handleShare = async () => {
    const link = `${window.location.origin}/profile/${employee.id}`;
    try {
      await navigator.clipboard.writeText(link);
      showToast('Profile link copied.', 'success');
    } catch {
      showToast('Could not copy link.', 'error');
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(employee.email);
      showToast('Email copied.', 'success');
    } catch {
      showToast('Could not copy email.', 'error');
    }
  };

  const handleEditClick = () => setTab('settings');

  const handleSaveAbout = () => {
    showToast('Saved. Backend persistence is mocked.', 'success');
  };
  const handleSaveVisibility = () => {
    showToast('Saved. Backend persistence is mocked.', 'success');
  };
  const handleSaveNotifs = () => {
    showToast('Saved. Backend persistence is mocked.', 'success');
  };
  const handleSignOutEverywhere = () => {
    if (window.confirm('Sign out of every session on every device?')) {
      useAuthStore.getState().logout();
      navigate('/login');
    }
  };

  /* ------------------------------- status dot -------------------------------- */
  const statusColor = employee.isActive ? 'bg-apple-green' : 'bg-apple-gray';
  const statusLabel = employee.isActive ? 'Active' : 'Away';

  /* ----------------------------------- tabs ---------------------------------- */
  const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'overview', label: 'Overview', icon: UserIcon },
    { key: 'activity', label: 'Activity', icon: ActivityIcon },
    { key: 'recognition', label: 'Recognition', icon: Trophy },
    ...(isOwn ? [{ key: 'settings' as TabKey, label: 'Settings', icon: SettingsIcon }] : []),
  ];

  return (
    <div className="flex flex-col gap-6 section-rise">
      {/* Back row & breadcrumb */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <nav className="hidden sm:flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <button onClick={() => navigate('/people')} className="hover:text-foreground transition-colors">
            People
          </button>
          <ChevronRight className="w-3 h-3" />
          <button onClick={() => navigate('/people')} className="hover:text-foreground transition-colors">
            {deptName}
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground/80 font-medium truncate max-w-[160px]">{employee.name}</span>
        </nav>
      </div>

      {/* HERO — cover strip + overlapping avatar */}
      <section className="glass-panel relative overflow-hidden p-0">
        {/* Cover gradient strip */}
        <div className="relative h-32 md:h-36 w-full overflow-hidden rounded-t-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/60 to-card" />
          <div className={`absolute inset-0 bg-apple-${tint}/15 mix-blend-multiply dark:mix-blend-soft-light pointer-events-none`} />
          <div className={`absolute -top-20 -right-12 w-72 h-72 rounded-full bg-apple-${tint}/25 blur-3xl pointer-events-none`} />
          <div className="absolute -bottom-20 -left-12 w-72 h-72 rounded-full bg-foreground/[0.05] blur-3xl pointer-events-none" />
        </div>

        <div className="relative px-6 md:px-8 pb-6 md:pb-8">
          {/* Avatar — overlaps the cover */}
          <div className="flex flex-col md:flex-row md:items-end md:gap-6 -mt-14 md:-mt-16">
            <div className="relative shrink-0">
              <img
                src={employee.avatar}
                alt={employee.name}
                className="w-28 h-28 md:w-32 md:h-32 rounded-3xl bg-secondary border-[4px] border-card shadow-apple-md object-cover"
              />
              <span
                className={[
                  'absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-[3px] border-card flex items-center justify-center',
                  statusColor,
                ].join(' ')}
                title={statusLabel}
              >
                {employee.isActive && <Check className="w-3 h-3 text-white" />}
              </span>
            </div>

            {/* Title & meta */}
            <div className="flex-1 min-w-0 mt-4 md:mt-0 md:pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[26px] md:text-[30px] font-semibold tracking-tight text-foreground leading-tight">
                  {employee.name}
                </h1>
                {employee.pronouns && (
                  <span className="text-[12px] text-muted-foreground">({employee.pronouns})</span>
                )}
                {isOwn && (
                  <span className="text-[10px] uppercase font-semibold tracking-widest px-1.5 py-0.5 rounded-md bg-foreground/[0.08] text-foreground/80">
                    You
                  </span>
                )}
                {isManagerOfMe && !isOwn && (
                  <span className="text-[10px] uppercase font-semibold tracking-widest px-1.5 py-0.5 rounded-md bg-apple-indigo/12 text-apple-indigo">
                    Manager
                  </span>
                )}
              </div>

              <p className="text-[14.5px] text-muted-foreground mt-1">{employee.jobTitle}</p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 text-[12px] text-muted-foreground">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-apple-${tint}/10 text-apple-${tint} font-medium`}>
                  <Building2 className="w-3 h-3" />
                  {deptName}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {employee.location}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  Joined {joinedDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </span>
                <span className="inline-flex items-center gap-1 truncate">
                  <Mail className="w-3 h-3" />
                  <span className="truncate max-w-[200px]">{employee.email}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick action bar */}
          <div className="flex flex-wrap items-center gap-2 mt-5">
            {!isOwn && (
              <>
                <button
                  onClick={() => showToast(`Message to ${employee.name.split(' ')[0]} drafted.`, 'info')}
                  className="apple-btn-primary text-[12.5px] py-2 px-4"
                >
                  <MessagesSquare className="w-4 h-4" /> Message
                </button>
                <button
                  onClick={() => showToast(`Kudos sent to ${employee.name.split(' ')[0]}.`, 'success')}
                  className="apple-btn-secondary text-[12.5px] py-2 px-4"
                >
                  <Trophy className="w-4 h-4" /> Give kudos
                </button>
              </>
            )}
            {isOwn && (
              <button
                onClick={() => navigate('/recognition')}
                className="apple-btn-secondary text-[12.5px] py-2 px-4"
              >
                <Award className="w-4 h-4" /> My recognition
              </button>
            )}
            <button onClick={handleShare} className="apple-btn-ghost text-[12.5px] py-2 px-4">
              <Share2 className="w-4 h-4" /> Share profile
            </button>
            <button onClick={handleCopyEmail} className="apple-btn-ghost text-[12.5px] py-2 px-4">
              <Copy className="w-4 h-4" /> Copy email
            </button>
            {isOwn && (
              <button onClick={handleEditClick} className="apple-btn-ghost text-[12.5px] py-2 px-4">
                <Pencil className="w-4 h-4" /> Edit profile
              </button>
            )}
            <button
              onClick={() => showToast('More options coming soon.', 'info')}
              className="apple-btn-ghost text-[12.5px] py-2 px-2.5 ml-auto"
              aria-label="More"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Stats strip */}
          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Tenure', value: tenure, icon: CalendarDays },
              { label: 'Points', value: String(employee.points), icon: Sparkles },
              { label: 'Level', value: `L${employee.level}`, icon: Trophy },
              { label: 'Badges', value: String(employee.badges.length), icon: Award },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="glass-card glass-shine p-3 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-foreground/[0.06] text-foreground/80 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="leading-tight min-w-0">
                    <div className="text-[16px] font-semibold tracking-tight text-foreground">{s.value}</div>
                    <div className="text-[10.5px] uppercase tracking-widest font-medium text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TABS */}
      <div className="apple-segment self-start max-w-full overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={[
                'apple-segment-item text-[12.5px]',
                active ? 'apple-segment-item-active' : '',
              ].join(' ')}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <div key={tab} className="animate-fade-in">
        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* LEFT — about, highlights, tags */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* About */}
              <div className="glass-card p-5 md:p-6 flex flex-col gap-3">
                <h2 className="text-[14px] font-semibold tracking-tight text-foreground flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-foreground/[0.06] text-foreground/80 flex items-center justify-center">
                    <UserIcon className="w-3.5 h-3.5" />
                  </span>
                  About
                </h2>
                <p className="text-[13.5px] text-foreground/80 leading-relaxed">{employee.bio}</p>
                {employee.funFact && (
                  <div className="mt-2 p-3 rounded-2xl bg-foreground/[0.04] border border-border/60">
                    <div className="text-[10.5px] uppercase tracking-widest font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                      <Star className="w-3 h-3" /> Fun fact
                    </div>
                    <div className="text-[13px] text-foreground/85">{employee.funFact}</div>
                  </div>
                )}
              </div>

              {/* Highlights — NEW */}
              <div className="glass-card p-5 md:p-6 flex flex-col gap-3">
                <h2 className="text-[14px] font-semibold tracking-tight text-foreground flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-foreground/[0.06] text-foreground/80 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                  Highlights
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-2xl bg-foreground/[0.03] border border-border/60 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-widest font-semibold text-muted-foreground">
                      <CalendarDays className="w-3 h-3" /> Tenure
                    </div>
                    <div className="text-[14px] font-semibold text-foreground leading-snug">
                      {tenure} at PULSE
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-foreground/[0.03] border border-border/60 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-widest font-semibold text-muted-foreground">
                      <Trophy className="w-3 h-3" /> Top kudos value
                    </div>
                    <div className="text-[14px] font-semibold text-foreground leading-snug">
                      {topKudosValue ? `Most recognized for: ${titleCase(topKudosValue)}` : 'No kudos yet'}
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-foreground/[0.03] border border-border/60 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-widest font-semibold text-muted-foreground">
                      <ActivityIcon className="w-3 h-3" /> Currently
                    </div>
                    <div className="text-[14px] font-semibold text-foreground leading-snug flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
                      {employee.isActive ? 'Active now' : 'Away'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <TagEditor
                label="Skills"
                icon={Briefcase}
                tint="blue"
                value={employee.skills || []}
                canEdit={isOwn}
                onSave={handleSaveTags('skills')}
              />
              <TagEditor
                label="Interests"
                icon={Star}
                tint="pink"
                value={employee.interests || []}
                canEdit={isOwn}
                onSave={handleSaveTags('interests')}
              />
              <TagEditor
                label="Languages"
                icon={LanguagesIcon}
                tint="green"
                value={employee.languages || []}
                canEdit={isOwn}
                onSave={handleSaveTags('languages')}
              />
            </div>

            {/* RIGHT — manager, reports, org snapshot, socials */}
            <aside className="flex flex-col gap-5">
              {manager && (
                <div className="glass-card p-5 flex flex-col gap-3">
                  <h2 className="text-[13px] font-semibold tracking-tight text-foreground flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-foreground/[0.06] text-foreground/80 flex items-center justify-center">
                      <Workflow className="w-3 h-3" />
                    </span>
                    Reports to
                  </h2>
                  <button
                    onClick={() => navigate(`/profile/${manager.id}`)}
                    className="flex items-center gap-3 p-2 rounded-2xl hover:bg-foreground/5 transition-colors -mx-2 text-left"
                  >
                    <img
                      src={manager.avatar}
                      alt={manager.name}
                      className="w-10 h-10 rounded-full bg-secondary border border-border/60"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-foreground truncate">{manager.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{manager.jobTitle}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              )}

              {directReports.length > 0 && (
                <div className="glass-card p-5 flex flex-col gap-3">
                  <h2 className="text-[13px] font-semibold tracking-tight text-foreground flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-foreground/[0.06] text-foreground/80 flex items-center justify-center">
                      <UsersIcon className="w-3 h-3" />
                    </span>
                    Direct reports
                    <span className="text-[11px] text-muted-foreground font-normal ml-1">({directReports.length})</span>
                  </h2>
                  <div className="flex flex-col gap-1">
                    {directReports.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => navigate(`/profile/${r.id}`)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-foreground/5 transition-colors text-left"
                      >
                        <img
                          src={r.avatar}
                          alt={r.name}
                          className="w-8 h-8 rounded-full bg-secondary border border-border/60"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-[12.5px] font-semibold text-foreground truncate">{r.name}</div>
                          <div className="text-[10.5px] text-muted-foreground truncate">{r.jobTitle}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Org snapshot — NEW */}
              <div className="glass-card p-5 flex flex-col gap-3">
                <h2 className="text-[13px] font-semibold tracking-tight text-foreground flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-foreground/[0.06] text-foreground/80 flex items-center justify-center">
                    <Building2 className="w-3 h-3" />
                  </span>
                  Org snapshot
                </h2>
                <dl className="flex flex-col gap-2 text-[12.5px]">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Department</dt>
                    <dd className="font-medium text-foreground">{deptName}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Dept headcount</dt>
                    <dd className="font-medium text-foreground">{deptHeadcount}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Peers</dt>
                    <dd className="font-medium text-foreground">{peerCount}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Role</dt>
                    <dd className="font-medium text-foreground capitalize">{employee.role}</dd>
                  </div>
                </dl>
              </div>

              {employee.socials && (employee.socials.linkedin || employee.socials.github || employee.socials.twitter) && (
                <div className="glass-card p-5 flex flex-col gap-3">
                  <h2 className="text-[13px] font-semibold tracking-tight text-foreground flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-foreground/[0.06] text-foreground/80 flex items-center justify-center">
                      <Globe className="w-3 h-3" />
                    </span>
                    Find me on
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {employee.socials.linkedin && (
                      <a
                        href={employee.socials.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/[0.06] text-foreground/85 text-[12px] font-medium hover:bg-foreground/[0.1] transition-colors"
                      >
                        <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                      </a>
                    )}
                    {employee.socials.github && (
                      <a
                        href={employee.socials.github}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/[0.06] text-foreground/85 text-[12px] font-medium hover:bg-foreground/[0.1] transition-colors"
                      >
                        <Github className="w-3.5 h-3.5" /> GitHub
                      </a>
                    )}
                    {employee.socials.twitter && (
                      <a
                        href={employee.socials.twitter}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/[0.06] text-foreground/85 text-[12px] font-medium hover:bg-foreground/[0.1] transition-colors"
                      >
                        <Twitter className="w-3.5 h-3.5" /> X
                      </a>
                    )}
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}

        {tab === 'activity' && (
          <div className="flex flex-col gap-5">
            {/* Recent posts */}
            <div className="glass-card p-5 md:p-6 flex flex-col gap-3">
              <h2 className="text-[14px] font-semibold tracking-tight text-foreground flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-foreground/[0.06] text-foreground/80 flex items-center justify-center">
                  <MessagesSquare className="w-3.5 h-3.5" />
                </span>
                Recent posts
                <span className="text-[11px] text-muted-foreground font-normal ml-1">({userPosts.length})</span>
              </h2>
              {userPosts.length === 0 ? (
                <p className="text-[12.5px] text-muted-foreground italic">No posts yet.</p>
              ) : (
                <div className="flex flex-col gap-2.5 stagger">
                  {userPosts.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-foreground/[0.03] border border-border/60"
                    >
                      <p className="text-[13px] text-foreground/85 leading-relaxed line-clamp-2">{p.body}</p>
                      <div className="flex items-center gap-3 mt-2 text-[11.5px] text-muted-foreground">
                        <span>{relativeTime(p.createdAt)}</span>
                        <span className="inline-flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {p.reactions.length}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" /> {p.comments.length}
                        </span>
                        <span className="capitalize px-1.5 py-0.5 rounded bg-foreground/[0.06] text-foreground/70">
                          {p.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Kudos given */}
            <div className="glass-card p-5 md:p-6 flex flex-col gap-3">
              <h2 className="text-[14px] font-semibold tracking-tight text-foreground flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-foreground/[0.06] text-foreground/80 flex items-center justify-center">
                  <Award className="w-3.5 h-3.5" />
                </span>
                Kudos given
                <span className="text-[11px] text-muted-foreground font-normal ml-1">({givenKudos.length})</span>
              </h2>
              {givenKudos.length === 0 ? (
                <p className="text-[12.5px] text-muted-foreground italic">No kudos given yet.</p>
              ) : (
                <div className="flex flex-col gap-2.5 stagger">
                  {givenKudos.map((k) => {
                    const to = employees.find((e) => e.id === k.toId);
                    return (
                      <button
                        key={k.id}
                        onClick={() => to && navigate(`/profile/${to.id}`)}
                        className="w-full text-left flex items-start gap-3 p-3 rounded-2xl bg-foreground/[0.03] border border-border/60 hover:bg-foreground/[0.06] transition-colors"
                      >
                        {to && (
                          <img
                            src={to.avatar}
                            alt={to.name}
                            className="w-8 h-8 rounded-full bg-secondary border border-border/60 shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[12.5px] font-semibold text-foreground">
                              To {to?.name || 'Teammate'}
                            </span>
                            <span className="text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded-md bg-foreground/[0.08] text-foreground/80">
                              {titleCase(k.value)}
                            </span>
                            <span className="text-[10.5px] text-muted-foreground ml-auto">
                              {relativeTime(k.createdAt)}
                            </span>
                          </div>
                          <p className="text-[12.5px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                            {k.message}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Project wins */}
            <div className="glass-card p-5 md:p-6 flex flex-col gap-3">
              <h2 className="text-[14px] font-semibold tracking-tight text-foreground flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-foreground/[0.06] text-foreground/80 flex items-center justify-center">
                  <Rocket className="w-3.5 h-3.5" />
                </span>
                Project wins
                <span className="text-[11px] text-muted-foreground font-normal ml-1">({userWins.length})</span>
              </h2>
              {userWins.length === 0 ? (
                <p className="text-[12.5px] text-muted-foreground italic">No wins logged yet.</p>
              ) : (
                <div className="flex flex-col gap-2.5 stagger">
                  {userWins.map((w) => (
                    <div
                      key={w.id}
                      className="p-3 rounded-2xl bg-foreground/[0.03] border border-border/60"
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="text-[13px] font-semibold text-foreground">{w.projectName}</div>
                        <div className="text-[12px] font-semibold text-foreground/85">{w.value}</div>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11.5px] text-muted-foreground">
                        <span>{w.client}</span>
                        <span>·</span>
                        <span>{new Date(w.wonAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <p className="text-[12.5px] text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                        {w.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'recognition' && (
          <div className="flex flex-col gap-5">
            {/* Top-line stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="glass-card glass-shine p-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-foreground/[0.06] text-foreground/80 flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </span>
                <div className="leading-tight">
                  <div className="text-[18px] font-semibold tracking-tight text-foreground">
                    {allReceivedKudos.length}
                  </div>
                  <div className="text-[10.5px] uppercase tracking-widest font-medium text-muted-foreground">
                    Received
                  </div>
                </div>
              </div>
              <div className="glass-card glass-shine p-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-foreground/[0.06] text-foreground/80 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </span>
                <div className="leading-tight">
                  <div className="text-[18px] font-semibold tracking-tight text-foreground">
                    {kudos.filter((k) => k.fromId === employee.id).length}
                  </div>
                  <div className="text-[10.5px] uppercase tracking-widest font-medium text-muted-foreground">
                    Given
                  </div>
                </div>
              </div>
              <div className="glass-card glass-shine p-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-foreground/[0.06] text-foreground/80 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div className="leading-tight min-w-0">
                  <div className="text-[14px] font-semibold tracking-tight text-foreground truncate">
                    {topKudosValue ? titleCase(topKudosValue) : '—'}
                  </div>
                  <div className="text-[10.5px] uppercase tracking-widest font-medium text-muted-foreground">
                    Top value
                  </div>
                </div>
              </div>
            </div>

            {/* Recognition list */}
            <div className="glass-card p-5 md:p-6 flex flex-col gap-3">
              <h2 className="text-[14px] font-semibold tracking-tight text-foreground flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-foreground/[0.06] text-foreground/80 flex items-center justify-center">
                  <Trophy className="w-3.5 h-3.5" />
                </span>
                Recent recognition
                <span className="text-[11px] text-muted-foreground font-normal ml-1">
                  ({Math.min(recognitionLimit, allReceivedKudos.length)} of {allReceivedKudos.length})
                </span>
              </h2>
              {allReceivedKudos.length === 0 ? (
                <p className="text-[12.5px] text-muted-foreground italic">No recognition received yet.</p>
              ) : (
                <>
                  <div className="flex flex-col gap-2.5 stagger">
                    {allReceivedKudos.slice(0, recognitionLimit).map((k) => {
                      const from = employees.find((e) => e.id === k.fromId);
                      return (
                        <div
                          key={k.id}
                          className="flex items-start gap-3 p-3 rounded-2xl bg-foreground/[0.03] border border-border/60"
                        >
                          {from && (
                            <button onClick={() => navigate(`/profile/${from.id}`)} className="shrink-0">
                              <img
                                src={from.avatar}
                                alt={from.name}
                                className="w-8 h-8 rounded-full bg-secondary border border-border/60"
                              />
                            </button>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[12.5px] font-semibold text-foreground">{from?.name}</span>
                              <span className="text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded-md bg-foreground/[0.08] text-foreground/80">
                                {titleCase(k.value)}
                              </span>
                              <span className="text-[10.5px] text-muted-foreground ml-auto">
                                {relativeTime(k.createdAt)}
                              </span>
                            </div>
                            <p className="text-[12.5px] text-muted-foreground mt-1 leading-relaxed">
                              {k.message}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {allReceivedKudos.length > recognitionLimit && (
                    <button
                      onClick={() => setRecognitionLimit((n) => n + 10)}
                      className="apple-btn-ghost text-[12px] py-1.5 px-3 self-center mt-1"
                    >
                      Show more
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Badges showcase */}
            <div className="glass-card p-5 md:p-6 flex flex-col gap-3">
              <h2 className="text-[14px] font-semibold tracking-tight text-foreground flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-foreground/[0.06] text-foreground/80 flex items-center justify-center">
                  <Award className="w-3.5 h-3.5" />
                </span>
                Badges
                <span className="text-[11px] text-muted-foreground font-normal ml-1">({employee.badges.length})</span>
              </h2>
              {employee.badges.length === 0 ? (
                <p className="text-[12.5px] text-muted-foreground italic">No badges earned yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {employee.badges.map((b) => (
                    <div
                      key={b}
                      className="flex items-center gap-2.5 p-2.5 rounded-full bg-foreground/[0.04] border border-border/60"
                    >
                      <span className="w-8 h-8 rounded-full bg-foreground/[0.08] text-foreground/85 flex items-center justify-center shrink-0">
                        <Award className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[12px] font-semibold text-foreground truncate">
                        {titleCase(b)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'settings' && isOwn && (
          <div className="flex flex-col gap-5 max-w-3xl">
            {/* About you */}
            <div className="glass-card p-5 md:p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[14px] font-semibold tracking-tight text-foreground flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-foreground/[0.06] text-foreground/80 flex items-center justify-center">
                    <UserIcon className="w-3.5 h-3.5" />
                  </span>
                  About you
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground">Job title</span>
                  <input
                    value={editAbout.jobTitle}
                    onChange={(e) => setEditAbout({ ...editAbout, jobTitle: e.target.value })}
                    className="apple-input text-[13px]"
                    placeholder="Senior Engineer"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground">Pronouns</span>
                  <input
                    value={editAbout.pronouns}
                    onChange={(e) => setEditAbout({ ...editAbout, pronouns: e.target.value })}
                    className="apple-input text-[13px]"
                    placeholder="she/her"
                  />
                </label>
                <label className="flex flex-col gap-1.5 md:col-span-2">
                  <span className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground">Location</span>
                  <input
                    value={editAbout.location}
                    onChange={(e) => setEditAbout({ ...editAbout, location: e.target.value })}
                    className="apple-input text-[13px]"
                    placeholder="Bengaluru, IN"
                  />
                </label>
                <label className="flex flex-col gap-1.5 md:col-span-2">
                  <span className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground">Bio</span>
                  <textarea
                    value={editAbout.bio}
                    onChange={(e) => setEditAbout({ ...editAbout, bio: e.target.value })}
                    className="apple-input text-[13px] min-h-[88px] resize-y leading-relaxed"
                    placeholder="A short bio about you…"
                  />
                </label>
                <label className="flex flex-col gap-1.5 md:col-span-2">
                  <span className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground">Fun fact</span>
                  <textarea
                    value={editAbout.funFact}
                    onChange={(e) => setEditAbout({ ...editAbout, funFact: e.target.value })}
                    className="apple-input text-[13px] min-h-[60px] resize-y leading-relaxed"
                    placeholder="One quirky thing about you"
                  />
                </label>
              </div>
              <div className="flex justify-end">
                <button onClick={handleSaveAbout} className="apple-btn-primary text-[12.5px] py-2 px-4">
                  <Check className="w-4 h-4" /> Save
                </button>
              </div>
            </div>

            {/* Visibility & contact */}
            <div className="glass-card p-5 md:p-6 flex flex-col gap-2">
              <h2 className="text-[14px] font-semibold tracking-tight text-foreground flex items-center gap-2 mb-1">
                <span className="w-7 h-7 rounded-lg bg-foreground/[0.06] text-foreground/80 flex items-center justify-center">
                  <Globe className="w-3.5 h-3.5" />
                </span>
                Visibility & contact
              </h2>
              <div className="divide-y divide-border/60">
                <AppleSwitch
                  checked={visibility.directory}
                  onChange={(v) => setVisibility({ ...visibility, directory: v })}
                  label="Show me in People directory"
                  description="Appear in company-wide search and the People page."
                />
                <AppleSwitch
                  checked={visibility.dms}
                  onChange={(v) => setVisibility({ ...visibility, dms: v })}
                  label="Allow direct messages from anyone"
                  description="When off, only teammates in your department can message you."
                />
                <AppleSwitch
                  checked={visibility.showPoints}
                  onChange={(v) => setVisibility({ ...visibility, showPoints: v })}
                  label="Show my points & level on profile"
                  description="Hides the points and level tiles from your public profile."
                />
              </div>
              <div className="flex justify-end mt-2">
                <button onClick={handleSaveVisibility} className="apple-btn-primary text-[12.5px] py-2 px-4">
                  <Check className="w-4 h-4" /> Save
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="glass-card p-5 md:p-6 flex flex-col gap-2">
              <h2 className="text-[14px] font-semibold tracking-tight text-foreground flex items-center gap-2 mb-1">
                <span className="w-7 h-7 rounded-lg bg-foreground/[0.06] text-foreground/80 flex items-center justify-center">
                  <SettingsIcon className="w-3.5 h-3.5" />
                </span>
                Notifications
              </h2>
              <div className="divide-y divide-border/60">
                <AppleSwitch
                  checked={notifs.daily}
                  onChange={(v) => setNotifs({ ...notifs, daily: v })}
                  label="Daily digest"
                  description="A short summary of what happened today, every morning."
                />
                <AppleSwitch
                  checked={notifs.weekly}
                  onChange={(v) => setNotifs({ ...notifs, weekly: v })}
                  label="Weekly recap"
                  description="Highlights, kudos, and wins from the past week."
                />
                <AppleSwitch
                  checked={notifs.kudos}
                  onChange={(v) => setNotifs({ ...notifs, kudos: v })}
                  label="Kudos alerts"
                  description="Get notified whenever a teammate recognizes you."
                />
              </div>
              <div className="flex justify-end mt-2">
                <button onClick={handleSaveNotifs} className="apple-btn-primary text-[12.5px] py-2 px-4">
                  <Check className="w-4 h-4" /> Save
                </button>
              </div>
            </div>

            {/* Danger zone */}
            <div className="glass-card p-5 md:p-6 flex flex-col gap-3 border-apple-red/20">
              <h2 className="text-[14px] font-semibold tracking-tight text-foreground flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-apple-red/10 text-apple-red flex items-center justify-center">
                  <LogOut className="w-3.5 h-3.5" />
                </span>
                Danger zone
              </h2>
              <p className="text-[12.5px] text-muted-foreground leading-relaxed">
                Sign out of every active session across every device. You'll need to log in again next time.
              </p>
              <div>
                <button
                  onClick={handleSignOutEverywhere}
                  className="apple-btn-secondary text-[12.5px] py-2 px-4 text-apple-red hover:text-apple-red"
                >
                  <LogOut className="w-4 h-4" /> Sign out everywhere
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
