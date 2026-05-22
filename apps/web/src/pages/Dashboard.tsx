import { useMemo, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';
import { useToastStore } from '../stores/toastStore';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Library,
  MessagesSquare,
  Workflow,
  Clock,
  ArrowUpRight,
  Pin,
  MapPin,
  Check,
  X,
  ShieldCheck,
  Trophy,
  CheckCircle,
  FileText,
  Cake,
  Gift,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  LineChart,
} from 'lucide-react';

const EVENT_COLORS: Record<string, string> = {
  townhall: 'bg-apple-blue/12 text-apple-blue',
  wellness: 'bg-apple-green/12 text-apple-green',
  learning: 'bg-apple-purple/12 text-apple-purple',
  celebration: 'bg-apple-orange/12 text-apple-orange',
  holiday: 'bg-apple-gray/12 text-apple-gray',
  hackathon: 'bg-apple-indigo/12 text-apple-indigo',
};

const LEADERSHIP_MEET = {
  month: 'May 2026',
  attendees: ['emp-david', 'emp-meera', 'emp-arjun', 'emp-marcus', 'emp-sarah', 'emp-charlie'],
  keyDecisions: [
    'Approve Singapore regional expansion — Q3 kickoff with 12 founding hires.',
    'Greenlight the cross-functional alignment council; meets every two weeks.',
    'Adopt a quarterly recognition reward pool of 0.5% of regional ARR.',
  ],
  actionItems: [
    { task: 'Publish Singapore go-to-market plan', ownerId: 'emp-marcus', dueDate: '2026-06-10' },
    { task: 'Finalise cross-functional council charter', ownerId: 'emp-arjun', dueDate: '2026-06-01' },
    { task: 'Roll out recognition reward pool to all teams', ownerId: 'emp-arjun', dueDate: '2026-06-30' },
  ],
  strategicPriorities: [
    'Break silos through cross-functional councils',
    'Strengthen culture via recognition and visibility',
    'Expand presence in APAC with disciplined hiring',
  ],
};

// Deterministic welcome line keyed off the employee's name — no randomness.
function welcomeLineFor(name: string): string {
  const lines = [
    'Thrilled to have you on the team — your perspective will shape what comes next.',
    'Welcome aboard. Grab a coffee, meet a teammate, and dive in at your own pace.',
    'So glad you joined us. Big things ahead, and you are part of them.',
    'Welcome to the crew. Curiosity is the only prerequisite — bring lots of it.',
    'Excited to build alongside you. Your first week is yours to explore.',
    'Welcome in. Ask anything, anytime — there are no silly questions here.',
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return lines[h % lines.length];
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const {
    employees,
    announcements,
    wins,
    leadership,
    events,
    moderation,
    toggleRSVP,
    acknowledgeAnnouncement,
    approveModerationItem,
    rejectModerationItem,
  } = useDataStore();
  const { showToast } = useToastStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'wins' | 'celebrations'>('wins');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any | null>(null);
  const [wishingId, setWishingId] = useState<string | null>(null);
  const [customWish, setCustomWish] = useState('');
  const [joinerIdx, setJoinerIdx] = useState(0);

  if (!user) return null;

  const isHR = user.role === 'hr';
  const isAdmin = user.role === 'admin';

  const ceoMessage = leadership[0];
  const ceoUser = employees.find((e) => e.id === ceoMessage?.authorId);

  const visibleAnnouncements = useMemo(() => {
    return announcements
      .filter((ann) => {
        if (ann.visibility === 'public') return true;
        if ((ann.visibility as string) === 'admin_hr' && (isHR || isAdmin)) return true;
        if (ann.visibility.startsWith('role:')) {
          const targetRole = ann.visibility.split(':')[1];
          return user.role === targetRole || isHR || isAdmin;
        }
        if (ann.visibility.startsWith('department:')) {
          const targetDept = ann.visibility.split(':')[1];
          return user.departmentId === targetDept || isHR || isAdmin;
        }
        return false;
      })
      .slice(0, 4);
  }, [announcements, user, isHR, isAdmin]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Recent joiners — sort by joinedAt descending, keep active only, take 6.
  const recentJoiners = useMemo(() => {
    return employees
      .filter((e) => e.isActive)
      .slice()
      .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
      .slice(0, 6);
  }, [employees]);

  const sendCelebration = (name: string) => {
    showToast(`Celebration sent to ${name}.`, 'success');
  };

  const sendCustomWish = (name: string) => {
    if (!customWish.trim()) {
      showToast('Type a short message first.', 'warning');
      return;
    }
    showToast(`Wish sent to ${name}.`, 'success');
    setCustomWish('');
    setWishingId(null);
  };

  const handleApprove = (modId: string, authorName: string) => {
    approveModerationItem(modId, user.id);
    showToast(`Approved post by ${authorName}.`, 'success');
  };

  const handleReject = (modId: string, authorName: string) => {
    rejectModerationItem(modId, user.id);
    showToast(`Rejected post by ${authorName}.`, 'warning');
  };

  const handleRSVP = (evtId: string, status: 'going' | 'maybe' | 'not-going') => {
    toggleRSVP(evtId, user.id, status);
    const label = status === 'going' ? 'Going' : status === 'maybe' ? 'Maybe' : 'Declined';
    showToast(`RSVP set to "${label}".`, 'info');
  };

  const meetAttendees = LEADERSHIP_MEET.attendees
    .map((id) => employees.find((e) => e.id === id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));
  const visibleAttendees = meetAttendees.slice(0, 5);
  const extraAttendees = Math.max(0, meetAttendees.length - visibleAttendees.length);

  const totalJoiners = recentJoiners.length;
  const safeIdx = totalJoiners > 0 ? ((joinerIdx % totalJoiners) + totalJoiners) % totalJoiners : 0;
  const goPrevJoiner = () => {
    if (totalJoiners === 0) return;
    setJoinerIdx((i) => (i - 1 + totalJoiners) % totalJoiners);
  };
  const goNextJoiner = () => {
    if (totalJoiners === 0) return;
    setJoinerIdx((i) => (i + 1) % totalJoiners);
  };

  return (
    <div className="flex flex-col gap-8 text-left">
      {/* Greeting */}
      <section className="flex flex-col gap-1.5 section-rise">
        <span className="text-[12px] uppercase tracking-widest font-semibold text-muted-foreground">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>
        <h1 className="text-[28px] md:text-[34px] font-semibold tracking-tight text-foreground">
          {greeting}, {user.name.split(' ')[0]}.
        </h1>
        <p className="text-[14px] text-muted-foreground max-w-2xl">
          Here's what's happening across the company today.
        </p>
      </section>

      {/* Admin system telemetry */}
      {isAdmin && (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'CPU load', val: '42%', icon: LineChart, dot: true },
            { label: 'Memory', val: '6.8 GB', icon: BarChart3 },
            { label: 'Active sessions', val: '18', icon: Users },
            { label: 'Latency', val: '180 ms', icon: Clock },
          ].map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={i} className="glass-card glass-shine p-4 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-muted-foreground">{m.label}</span>
                  <span className="text-[18px] font-semibold tracking-tight text-foreground">
                    {m.val}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-foreground/[0.06] text-foreground/80 flex items-center justify-center relative">
                  <Icon className="w-4 h-4" />
                  {m.dot && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-apple-green animate-pulse-subtle" />
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* HR moderation banner */}
      {isHR && moderation.length > 0 && (
        <section className="glass-card p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-foreground/[0.06] text-foreground/80 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[13.5px] font-semibold text-foreground">
                {moderation.length} post{moderation.length === 1 ? '' : 's'} awaiting review
              </div>
              <div className="text-[12px] text-muted-foreground">
                Open the admin queue to approve or reject.
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/admin')} className="apple-btn-secondary text-[12.5px]">
            Open queue
          </button>
        </section>
      )}

      {/* CEO Leadership Hero */}
      {ceoMessage && (
        <section className="glass-panel has-sheen relative overflow-hidden p-6 md:p-8 section-rise">
          <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-foreground/[0.05] blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-foreground/[0.04] blur-3xl pointer-events-none" />

          <div className="relative max-w-3xl flex flex-col gap-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-foreground/[0.06] text-foreground/80 text-[11px] font-semibold uppercase tracking-wide w-fit">
              <Pin className="w-3 h-3" />
              Leadership address
            </span>
            <h2 className="text-[22px] md:text-[26px] font-semibold tracking-tight text-foreground leading-snug">
              {ceoMessage.title}
            </h2>
            <p className="text-[14px] md:text-[15px] text-muted-foreground leading-relaxed">
              {ceoMessage.body}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <img
                src={ceoUser?.avatar}
                alt={ceoUser?.name}
                className="w-10 h-10 rounded-full bg-secondary border border-border"
              />
              <div className="leading-tight">
                <div className="text-[13.5px] font-semibold text-foreground">{ceoUser?.name}</div>
                <div className="text-[11.5px] text-muted-foreground">{ceoUser?.jobTitle}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Monthly Leadership Meet Outcomes */}
      <section className="glass-panel has-sheen p-6 md:p-7 flex flex-col gap-5 section-rise">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-foreground/[0.06] text-foreground/80 flex items-center justify-center shrink-0">
              <Workflow className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[17px] font-semibold tracking-tight text-foreground">
                  Monthly leadership meet
                </h3>
                <span className="text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded-md bg-apple-indigo/10 text-apple-indigo">
                  {LEADERSHIP_MEET.month}
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Outcomes, priorities, and follow-ups from the latest leadership huddle.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {visibleAttendees.map((a) => (
                <img
                  key={a.id}
                  src={a.avatar}
                  alt={a.name}
                  title={a.name}
                  className="w-8 h-8 rounded-full border-2 border-card bg-secondary shadow-apple-xs"
                />
              ))}
              {extraAttendees > 0 && (
                <div className="w-8 h-8 rounded-full border-2 border-card bg-secondary text-[10.5px] font-semibold text-foreground/80 flex items-center justify-center">
                  +{extraAttendees}
                </div>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground hidden md:inline">
              {meetAttendees.length} attendees
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Key decisions */}
          <div className="p-4 rounded-2xl bg-apple-blue/8 border border-apple-blue/20 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-apple-blue/15 text-apple-blue flex items-center justify-center">
                <CheckCircle className="w-3.5 h-3.5" />
              </span>
              <h4 className="text-[12px] uppercase tracking-widest font-semibold text-apple-blue">
                Key decisions
              </h4>
            </div>
            <ul className="flex flex-col gap-2">
              {LEADERSHIP_MEET.keyDecisions.map((d, i) => (
                <li
                  key={i}
                  className="text-[12.5px] text-foreground/85 leading-relaxed flex gap-2"
                >
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-apple-blue shrink-0" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Strategic priorities */}
          <div className="p-4 rounded-2xl bg-apple-purple/8 border border-apple-purple/20 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-apple-purple/15 text-apple-purple flex items-center justify-center">
                <Workflow className="w-3.5 h-3.5" />
              </span>
              <h4 className="text-[12px] uppercase tracking-widest font-semibold text-apple-purple">
                Strategic priorities
              </h4>
            </div>
            <ul className="flex flex-col gap-2">
              {LEADERSHIP_MEET.strategicPriorities.map((p, i) => (
                <li
                  key={i}
                  className="text-[12.5px] text-foreground/85 leading-relaxed flex gap-2"
                >
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-apple-purple shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action items */}
          <div className="p-4 rounded-2xl bg-apple-orange/8 border border-apple-orange/20 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-apple-orange/15 text-apple-orange flex items-center justify-center">
                <CalendarDays className="w-3.5 h-3.5" />
              </span>
              <h4 className="text-[12px] uppercase tracking-widest font-semibold text-apple-orange">
                Action items
              </h4>
            </div>
            <ul className="flex flex-col gap-2.5">
              {LEADERSHIP_MEET.actionItems.map((a, i) => {
                const owner = employees.find((e) => e.id === a.ownerId);
                return (
                  <li
                    key={i}
                    className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-card/80 border border-border/60"
                  >
                    <span className="text-[12.5px] font-medium text-foreground leading-snug">
                      {a.task}
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {owner ? (
                          <>
                            <img
                              src={owner.avatar}
                              alt={owner.name}
                              className="w-5 h-5 rounded-full bg-secondary border border-border/60"
                            />
                            <span className="text-[10.5px] text-muted-foreground truncate">
                              {owner.name.split(' ')[0]}
                            </span>
                          </>
                        ) : (
                          <span className="text-[10.5px] text-muted-foreground">Unassigned</span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 shrink-0">
                        <CalendarDays className="w-3 h-3" />
                        {new Date(a.dueDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* HR moderation inline cards */}
      {isHR && moderation.length > 0 && (
        <section className="glass-card p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-semibold tracking-tight text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-apple-orange" /> Pending approvals
            </h3>
            <button onClick={() => navigate('/admin')} className="text-[12px] font-medium text-apple-blue hover:opacity-80">
              View all →
            </button>
          </div>
          <div className="flex flex-col gap-2.5">
            {moderation.slice(0, 2).map((item) => {
              const author =
                employees.find((e) => e.id === item.authorId) || {
                  name: 'Teammate',
                  avatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=400&h=400&fit=crop&crop=faces&auto=format&q=80',
                };
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-foreground/[0.03] border border-border/60 flex items-start gap-3 justify-between"
                >
                  <div className="flex gap-3 min-w-0">
                    <img src={author.avatar} alt={author.name} className="w-9 h-9 rounded-full bg-secondary border border-border/60 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-foreground truncate">{author.name}</span>
                        <span className="text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded-md bg-apple-blue/10 text-apple-blue">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-[12.5px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">{item.body}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => handleApprove(item.id, author.name)}
                      className="p-2 rounded-xl bg-apple-green/10 text-apple-green hover:bg-apple-green/20 transition-colors"
                      aria-label="Approve"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleReject(item.id, author.name)}
                      className="p-2 rounded-xl bg-apple-red/10 text-apple-red hover:bg-apple-red/20 transition-colors"
                      aria-label="Reject"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Announcements */}
      <section className="flex flex-col gap-3 section-rise">
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] font-semibold tracking-tight text-foreground">Announcements</h3>
          <span className="text-[11px] font-medium text-muted-foreground">
            {visibleAnnouncements.length} active
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 stagger">
          {visibleAnnouncements.map((ann) => {
            const author = employees.find((e) => e.id === ann.authorId);
            const isRead = ann.acknowledgedBy.includes(user.id);
            return (
              <button
                key={ann.id}
                onClick={() => setSelectedAnnouncement(ann)}
                className="glass-card p-4 text-left flex flex-col gap-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded-md bg-apple-blue/10 text-apple-blue">
                    {ann.category}
                  </span>
                  {!isRead && <span className="w-2 h-2 rounded-full bg-apple-red" />}
                </div>
                <h4 className="text-[13.5px] font-semibold text-foreground line-clamp-2 group-hover:text-apple-blue transition-colors leading-snug">
                  {ann.title}
                </h4>
                <p className="text-[12px] text-muted-foreground line-clamp-2 leading-relaxed">
                  {ann.body.replace(/\*\*/g, '')}
                </p>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/60">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <img src={author?.avatar} alt={author?.name} className="w-4 h-4 rounded-full shrink-0" />
                    <span className="text-[10.5px] text-muted-foreground truncate">{author?.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground/80 font-mono shrink-0">
                    {new Date(ann.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Wins + Events Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start section-rise">
        {/* Left: Wins / Celebrations */}
        <div className="lg:col-span-8 glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-semibold tracking-tight text-foreground">Social pulse</h3>
            <div className="apple-segment">
              <button
                onClick={() => setActiveTab('wins')}
                className={`apple-segment-item ${activeTab === 'wins' ? 'apple-segment-item-active' : ''}`}
              >
                Project wins
              </button>
              <button
                onClick={() => setActiveTab('celebrations')}
                className={`apple-segment-item ${activeTab === 'celebrations' ? 'apple-segment-item-active' : ''}`}
              >
                Milestones
              </button>
            </div>
          </div>

          {activeTab === 'wins' ? (
            <div className="flex flex-col gap-3 stagger">
              {wins.slice(0, 4).map((win) => (
                <div
                  key={win.id}
                  className="p-4 rounded-2xl bg-foreground/[0.03] border border-border/60 flex items-start justify-between gap-3 hover:bg-foreground/[0.05] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded-md bg-apple-green/12 text-apple-green">
                        {win.value}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {new Date(win.wonAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h4 className="text-[13.5px] font-semibold text-foreground">{win.projectName}</h4>
                    <p className="text-[12px] text-muted-foreground leading-relaxed mt-1 line-clamp-2">{win.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-[10px] uppercase tracking-wide font-medium text-muted-foreground">Team</span>
                      <div className="flex -space-x-1.5">
                        {win.teamIds.slice(0, 5).map((tid) => {
                          const tm = employees.find((e) => e.id === tid);
                          return (
                            <img
                              key={tid}
                              src={tm?.avatar}
                              alt={tm?.name}
                              title={tm?.name}
                              className="w-6 h-6 rounded-full border-2 border-card bg-secondary"
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* New joinee welcome carousel */}
              {totalJoiners > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[12px] uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5" /> Welcome our new joiners
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10.5px] font-mono text-muted-foreground tabular-nums">
                        {safeIdx + 1} / {totalJoiners}
                      </span>
                      <button
                        onClick={goPrevJoiner}
                        className="w-7 h-7 rounded-full bg-foreground/[0.05] hover:bg-foreground/[0.1] text-foreground/80 flex items-center justify-center transition-colors"
                        aria-label="Previous joiner"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={goNextJoiner}
                        className="w-7 h-7 rounded-full bg-foreground/[0.05] hover:bg-foreground/[0.1] text-foreground/80 flex items-center justify-center transition-colors"
                        aria-label="Next joiner"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl">
                    <div
                      className="flex transition-transform duration-500 ease-apple"
                      style={{ transform: `translateX(-${safeIdx * 100}%)` }}
                    >
                      {recentJoiners.map((emp) => (
                        <div
                          key={`j-${emp.id}`}
                          className="w-full shrink-0 px-0.5"
                        >
                          <div className="p-5 rounded-2xl bg-foreground/[0.03] border border-border/60 flex flex-col sm:flex-row gap-4 items-start">
                            <img
                              src={emp.avatar}
                              alt={emp.name}
                              className="h-16 w-16 rounded-full bg-secondary border border-border shrink-0 shadow-apple-xs"
                            />
                            <div className="flex-1 min-w-0 flex flex-col gap-2">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h5 className="text-[15px] font-semibold tracking-tight text-foreground">
                                    {emp.name}
                                  </h5>
                                  <span className="text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded-md bg-apple-blue/12 text-apple-blue">
                                    {emp.departmentId.replace('dept-', '')}
                                  </span>
                                </div>
                                <div className="text-[12.5px] text-muted-foreground mt-0.5">
                                  {emp.jobTitle}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> {emp.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="w-3 h-3" />
                                  Joined{' '}
                                  {new Date(emp.joinedAt).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>

                              <p className="text-[12.5px] text-foreground/80 leading-relaxed">
                                {welcomeLineFor(emp.name)}
                              </p>

                              <div className="flex items-center gap-2 mt-1">
                                <button
                                  onClick={() => showToast(`Welcome message sent to ${emp.name}.`, 'success')}
                                  className="apple-btn-primary text-[12px] py-1.5 px-3"
                                >
                                  <Gift className="w-3.5 h-3.5" /> Welcome aboard
                                </button>
                                <button
                                  onClick={() => navigate('/people')}
                                  className="apple-btn-ghost text-[12px] py-1.5 px-3"
                                >
                                  View profile
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dot pagination */}
                  <div className="flex items-center justify-center gap-1.5">
                    {recentJoiners.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setJoinerIdx(i)}
                        aria-label={`Go to joiner ${i + 1}`}
                        className={[
                          'h-1.5 rounded-full transition-all duration-300 ease-apple',
                          i === safeIdx
                            ? 'w-5 bg-apple-blue'
                            : 'w-1.5 bg-foreground/20 hover:bg-foreground/30',
                        ].join(' ')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Birthdays */}
              <div>
                <h4 className="text-[12px] uppercase tracking-widest font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Cake className="w-3.5 h-3.5" /> Birthdays
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {employees.slice(0, 4).map((emp) => (
                    <div
                      key={`b-${emp.id}`}
                      className="p-3 rounded-2xl bg-foreground/[0.03] border border-border/60 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={emp.avatar} alt={emp.name} className="w-9 h-9 rounded-full bg-secondary border border-border/60" />
                          <div className="min-w-0">
                            <div className="text-[12.5px] font-semibold text-foreground truncate">{emp.name}</div>
                            <div className="text-[10.5px] text-muted-foreground truncate">{emp.jobTitle}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => sendCelebration(emp.name)}
                          className="p-1.5 rounded-lg bg-apple-blue/10 text-apple-blue hover:bg-apple-blue/20 transition-colors"
                          aria-label="Send celebration"
                        >
                          <Gift className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {wishingId === emp.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={customWish}
                            onChange={(e) => setCustomWish(e.target.value)}
                            placeholder="Add a wish…"
                            className="apple-input py-1.5 text-[11px]"
                          />
                          <button
                            onClick={() => sendCustomWish(emp.name)}
                            className="p-1.5 bg-primary text-primary-foreground rounded-lg active:scale-95"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setWishingId(emp.id);
                            setCustomWish(`Happy birthday, ${emp.name.split(' ')[0]}!`);
                          }}
                          className="text-[10.5px] font-medium text-apple-blue hover:opacity-80 text-left"
                        >
                          Write a note
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Events */}
        <div className="lg:col-span-4 glass-card p-6 flex flex-col gap-4">
          <div>
            <h3 className="text-[16px] font-semibold tracking-tight text-foreground">Upcoming events</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">RSVP and coordinate attendance.</p>
          </div>
          <div className="flex flex-col gap-2.5">
            {events.slice(0, 4).map((evt) => {
              const myRsvp = evt.rsvps.find((r) => r.userId === user.id)?.status || 'none';
              return (
                <div key={evt.id} className="p-3.5 rounded-2xl bg-foreground/[0.03] border border-border/60 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded-md ${EVENT_COLORS[evt.type] || 'bg-apple-gray/10 text-apple-gray'}`}>
                      {evt.type}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(evt.startAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-semibold text-foreground line-clamp-1">{evt.title}</h4>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{evt.isOnline ? 'Online' : evt.location}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {(['going', 'maybe', 'not-going'] as const).map((status) => {
                      const active = myRsvp === status;
                      return (
                        <button
                          key={status}
                          onClick={() => handleRSVP(evt.id, status)}
                          className={[
                            'flex-1 text-[10.5px] font-semibold py-1.5 rounded-lg transition-all',
                            active
                              ? 'bg-primary text-primary-foreground shadow-apple-xs'
                              : 'bg-foreground/[0.04] text-foreground/70 hover:bg-foreground/[0.08]',
                          ].join(' ')}
                        >
                          {status === 'going' ? 'Going' : status === 'maybe' ? 'Maybe' : 'Decline'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tertiary: Recognition + Pulse + Quick Tiles */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 section-rise stagger">
        <div className="glass-card p-6 flex flex-col gap-4">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-apple-blue w-fit px-1.5 py-0.5 rounded-md bg-apple-blue/10">
            Recognition
          </span>
          <div className="flex flex-col gap-1">
            <h4 className="text-[16px] font-semibold tracking-tight text-foreground">Elevate teammate impact</h4>
            <p className="text-[12.5px] text-muted-foreground leading-relaxed">
              Acknowledge milestones and values alignment. Kudos boost morale and the leaderboard.
            </p>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-foreground/[0.03] border border-border/60">
            <div className="w-8 h-8 rounded-xl bg-apple-blue/12 text-apple-blue flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-semibold text-foreground">Leaderboard</div>
              <div className="text-[11px] text-muted-foreground truncate">Priya & Tariq lead this week.</div>
            </div>
          </div>
          <button onClick={() => navigate('/recognition')} className="apple-btn-primary w-full text-[13px]">
            <Trophy className="w-4 h-4" /> Give kudos
          </button>
        </div>

        <div className="glass-card p-6 flex flex-col gap-4">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-apple-pink w-fit px-1.5 py-0.5 rounded-md bg-apple-pink/10">
            Pulse
          </span>
          <div className="flex flex-col gap-1">
            <h4 className="text-[16px] font-semibold tracking-tight text-foreground">Organic teammate feed</h4>
            <p className="text-[12.5px] text-muted-foreground leading-relaxed">
              Join hubs, coordinate across regions, and share updates under moderation.
            </p>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-foreground/[0.03] border border-border/60">
            <div className="w-8 h-8 rounded-xl bg-apple-pink/12 text-apple-pink flex items-center justify-center">
              <MessagesSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-semibold text-foreground">Office hubs</div>
              <div className="text-[11px] text-muted-foreground truncate">Bengaluru & London at full capacity.</div>
            </div>
          </div>
          <button onClick={() => navigate('/pulse')} className="apple-btn-secondary w-full text-[13px]">
            Browse feed <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="glass-card p-6 flex flex-col gap-4 md:col-span-2 lg:col-span-1">
          <h4 className="text-[16px] font-semibold tracking-tight text-foreground">Quick access</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { path: '/people', label: 'People', color: 'apple-blue', icon: Users },
              { path: '/documents', label: 'Knowledge', color: 'apple-orange', icon: Library },
              { path: '/forum', label: 'Forum', color: 'apple-green', icon: MessagesSquare },
              { path: '/departments', label: 'Departments', color: 'apple-purple', icon: Workflow },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.path}
                  onClick={() => navigate(t.path)}
                  className="p-3 rounded-2xl bg-foreground/[0.03] border border-border/60 hover:bg-foreground/[0.06] transition-colors flex flex-col items-start gap-2"
                >
                  <div className={`w-8 h-8 rounded-xl bg-${t.color}/12 text-${t.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[12px] font-semibold text-foreground">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Announcement detail sheet */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
          <div
            onClick={() => setSelectedAnnouncement(null)}
            className="absolute inset-0 bg-foreground/45 backdrop-blur-md"
          />
          <div className="relative z-10 w-full max-w-[480px] h-full apple-sheet p-6 md:p-8 flex flex-col overflow-y-auto animate-slide-in">
            <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-5">
              <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-md bg-apple-blue/10 text-apple-blue">
                {selectedAnnouncement.category}
              </span>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-[20px] font-semibold tracking-tight text-foreground mb-4 leading-snug">
              {selectedAnnouncement.title}
            </h3>
            <div className="flex items-center gap-3 border-b border-border/60 pb-4 mb-5">
              <img
                src={employees.find((e) => e.id === selectedAnnouncement.authorId)?.avatar}
                alt=""
                className="w-9 h-9 rounded-full bg-secondary border border-border/60"
              />
              <div>
                <div className="text-[13px] font-semibold text-foreground">
                  {employees.find((e) => e.id === selectedAnnouncement.authorId)?.name}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Published {new Date(selectedAnnouncement.publishedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>
            <div className="flex-1 text-[14px] text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {selectedAnnouncement.body}
            </div>
            <div className="border-t border-border/60 pt-5 mt-5">
              {selectedAnnouncement.acknowledgedBy.includes(user.id) ? (
                <div className="w-full px-4 py-3 rounded-xl bg-apple-green/10 text-apple-green text-[13px] font-semibold flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Acknowledged
                </div>
              ) : (
                <button
                  onClick={() => {
                    acknowledgeAnnouncement(selectedAnnouncement.id, user.id);
                    setSelectedAnnouncement({
                      ...selectedAnnouncement,
                      acknowledgedBy: [...selectedAnnouncement.acknowledgedBy, user.id],
                    });
                    showToast('Acknowledged.', 'success');
                  }}
                  className="apple-btn-primary w-full text-[13px] py-3"
                >
                  <FileText className="w-4 h-4" /> Acknowledge
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
