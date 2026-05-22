import React, { useState, useEffect, useMemo } from 'react';
import { useDataStore } from '../stores/dataStore';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import {
  Award,
  Stars,
  Users2,
  Target,
  TrendingUp,
  Shield,
  MessagesSquare,
  Send,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Trophy,
  Medal,
  Star,
  Plus,
  X,
  ThumbsUp,
  Heart,
  PartyPopper,
  Lightbulb,
  Flame,
  type LucideIcon,
} from 'lucide-react';
import { Skeleton, SkeletonCard } from '../components/Skeleton';

type CoreValueId =
  | 'innovation'
  | 'team-player'
  | 'customer-focus'
  | 'excellence'
  | 'growth'
  | 'ownership';

interface CoreValue {
  id: CoreValueId | string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  ring: string;
  desc: string;
}

// 6 core values, themed with Apple system tints
const CORE_VALUES: CoreValue[] = [
  { id: 'innovation', label: 'Innovation', icon: Stars, color: 'text-apple-purple', bg: 'bg-apple-purple/12', ring: 'ring-apple-purple/40', desc: 'Thinking outside the box, building future-ready tech.' },
  { id: 'team-player', label: 'Team Player', icon: Users2, color: 'text-apple-blue', bg: 'bg-apple-blue/12', ring: 'ring-apple-blue/40', desc: 'Breaking down silos, cross-functional collaboration.' },
  { id: 'customer-focus', label: 'Customer Focus', icon: Target, color: 'text-apple-green', bg: 'bg-apple-green/12', ring: 'ring-apple-green/40', desc: 'Empathizing with users, standard-setting support.' },
  { id: 'excellence', label: 'Excellence', icon: Award, color: 'text-apple-orange', bg: 'bg-apple-orange/12', ring: 'ring-apple-orange/40', desc: 'Meticulous details, premium craftsmanship.' },
  { id: 'growth', label: 'Growth Mindset', icon: TrendingUp, color: 'text-apple-pink', bg: 'bg-apple-pink/12', ring: 'ring-apple-pink/40', desc: 'Continuous learning, learning paths and feedback.' },
  { id: 'ownership', label: 'Ownership', icon: Shield, color: 'text-apple-indigo', bg: 'bg-apple-indigo/12', ring: 'ring-apple-indigo/40', desc: 'Taking full accountability, driving things to done.' },
];

const getValueStyle = (val: string): CoreValue => {
  const match = CORE_VALUES.find(c => c.id === val || (c.id === 'team-player' && val === 'collaboration'));
  if (match) return match;
  if (val === 'leadership') {
    return {
      id: 'leadership',
      label: 'Leadership',
      icon: Medal,
      color: 'text-apple-indigo',
      bg: 'bg-apple-indigo/12',
      ring: 'ring-apple-indigo/40',
      desc: '',
    };
  }
  return {
    id: 'general',
    label: val.charAt(0).toUpperCase() + val.slice(1),
    icon: Award,
    color: 'text-muted-foreground',
    bg: 'bg-secondary',
    ring: 'ring-border',
    desc: '',
  };
};

const getDeptName = (deptId: string): string => {
  switch (deptId) {
    case 'dept-eng': return 'Engineering';
    case 'dept-product': return 'Product';
    case 'dept-design': return 'Design';
    case 'dept-hr': return 'HR';
    case 'dept-cs': return 'Customer Success';
    case 'dept-sales': return 'Sales';
    case 'dept-marketing': return 'Marketing';
    case 'dept-finance': return 'Finance';
    case 'dept-operations': return 'Operations';
    case 'dept-exec': return 'Executive';
    default: return 'Corporate';
  }
};

type ReactionKey = '👏' | '❤️' | '🎉' | '💡' | '🔥' | '👀';
const REACTIONS: Array<{ emoji: ReactionKey; name: string; label: string; icon: LucideIcon; tone: string }> = [
  { emoji: '👏', name: 'applause',  label: 'Applaud',    icon: ThumbsUp,    tone: 'text-apple-blue' },
  { emoji: '❤️', name: 'love',      label: 'Love',       icon: Heart,       tone: 'text-apple-pink' },
  { emoji: '🎉', name: 'celebrate', label: 'Celebrate',  icon: PartyPopper, tone: 'text-apple-purple' },
  { emoji: '💡', name: 'insight',   label: 'Insight',    icon: Lightbulb,   tone: 'text-apple-yellow' },
  { emoji: '🔥', name: 'fire',      label: 'Fire',       icon: Flame,       tone: 'text-apple-orange' },
  { emoji: '👀', name: 'eyes',      label: 'Eyes',       icon: Eye,         tone: 'text-apple-cyan' },
];

export default function Recognition() {
  const { kudos, employees, leaderboard, addKudos, reactToKudos, replyToKudos } = useDataStore();
  const { user } = useAuthStore();
  const { showToast } = useToastStore();

  const [loading, setLoading] = useState(true);
  const [isGiveKudosOpen, setIsGiveKudosOpen] = useState(false);
  const [activeKudosFilter, setActiveKudosFilter] = useState<'all' | 'my-dept' | 'received' | 'sent'>('all');

  const [kudosRecipient, setKudosRecipient] = useState('');
  const [selectedCoreValue, setSelectedCoreValue] = useState<CoreValueId>('innovation');
  const [kudosMessage, setKudosMessage] = useState('');
  const [kudosVisibility, setKudosVisibility] = useState<'public' | 'team' | 'private'>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const potentialRecipients = useMemo(() => {
    if (!user) return [];
    return employees.filter(emp => emp.id !== user.id && emp.isActive);
  }, [employees, user]);

  useEffect(() => {
    if (potentialRecipients.length > 0 && !kudosRecipient) {
      setKudosRecipient(potentialRecipients[0].id);
    }
  }, [potentialRecipients, kudosRecipient]);

  const employeeMap = useMemo(() => {
    return employees.reduce<Record<string, typeof employees[0]>>((acc, emp) => {
      acc[emp.id] = emp;
      return acc;
    }, {});
  }, [employees]);

  const filteredKudos = useMemo(() => {
    if (!user) return [];

    return kudos.filter(kud => {
      const sender = employeeMap[kud.fromId];
      const receiver = employeeMap[kud.toId];
      if (!sender || !receiver) return false;

      let canSee = false;
      if (kud.visibility === 'public') {
        canSee = true;
      } else if (kud.visibility === 'team') {
        canSee = (
          user.departmentId === sender.departmentId ||
          user.departmentId === receiver.departmentId ||
          user.role === 'hr' ||
          user.role === 'admin'
        );
      } else if (kud.visibility === 'private') {
        canSee = (
          user.id === kud.fromId ||
          user.id === kud.toId ||
          user.role === 'hr' ||
          user.role === 'admin'
        );
      }

      if (!canSee) return false;

      if (activeKudosFilter === 'my-dept') {
        return sender.departmentId === user.departmentId || receiver.departmentId === user.departmentId;
      }
      if (activeKudosFilter === 'received') {
        return kud.toId === user.id;
      }
      if (activeKudosFilter === 'sent') {
        return kud.fromId === user.id;
      }

      return true;
    });
  }, [kudos, activeKudosFilter, user, employeeMap]);

  const handleGiveKudosSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!kudosRecipient || !kudosMessage.trim()) {
      showToast('Please select a coworker and write a message.', 'warning');
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    addKudos(
      user.id,
      kudosRecipient,
      selectedCoreValue as any,
      kudosMessage,
      kudosVisibility
    );

    setIsSubmitting(false);
    setIsGiveKudosOpen(false);

    const receiverName = employeeMap[kudosRecipient]?.name || 'Your peer';
    showToast(`Kudos sent to ${receiverName}. +10 pts to you, +20 to them.`, 'success');
    setKudosMessage('');
  };

  const handleReactionClick = (kudosId: string, emoji: '👏' | '❤️' | '🎉' | '💡' | '🔥' | '👀') => {
    if (!user) return;
    reactToKudos(kudosId, user.id, emoji);
  };

  const handleReplySubmit = (e: React.FormEvent, kudosId: string) => {
    e.preventDefault();
    if (!user) return;
    const body = replyInput[kudosId];
    if (!body || !body.trim()) return;

    replyToKudos(kudosId, user.id, body.trim());
    setReplyInput(prev => ({ ...prev, [kudosId]: '' }));
    showToast('Reply added.', 'success');
  };

  const toggleComments = (kudosId: string) => {
    setExpandedComments(prev => ({ ...prev, [kudosId]: !prev[kudosId] }));
  };

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Hero */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 section-rise">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-apple-orange/12 text-apple-orange">
              <Trophy className="w-4.5 h-4.5" strokeWidth={2.25} />
            </span>
            <h1 className="text-[22px] md:text-[26px] font-semibold tracking-tight text-foreground">
              Recognition
            </h1>
          </div>
          <p className="text-[13.5px] text-muted-foreground max-w-2xl leading-relaxed">
            Celebrate colleagues, share appreciations, and elevate culture through our six core values.
          </p>
        </div>

        <button
          onClick={() => setIsGiveKudosOpen(true)}
          className="apple-btn-primary"
        >
          <Plus className="w-4 h-4" /> Give Kudos
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 items-start text-left">
        {/* Main column */}
        <div className="flex-1 w-full flex flex-col gap-5 min-w-0">
          {/* Filter tabs */}
          <div className="apple-segment apple-segment-stretch">
            {[
              { id: 'all', label: 'All' },
              { id: 'my-dept', label: 'My Department' },
              { id: 'received', label: 'Received' },
              { id: 'sent', label: 'Sent' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveKudosFilter(tab.id as 'all' | 'my-dept' | 'received' | 'sent')}
                className={`apple-segment-item apple-segment-item-stretch ${
                  activeKudosFilter === tab.id ? 'apple-segment-item-active' : ''
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Kudos list */}
          {loading ? (
            <div className="flex flex-col gap-5 w-full">
              {[1, 2, 3].map(i => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredKudos.length === 0 ? (
            <div className="glass-panel p-12 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 bg-secondary text-muted-foreground rounded-full flex items-center justify-center mb-5">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-[16px] font-semibold tracking-tight text-foreground mb-2">No recognition yet</h3>
              <p className="text-[13.5px] text-muted-foreground leading-relaxed mb-5 max-w-sm">
                {activeKudosFilter === 'received'
                  ? "You haven't received any kudos yet. Keep demonstrating our culture."
                  : activeKudosFilter === 'sent'
                    ? "You haven't sent any peer kudos yet. Highlight someone's day."
                    : 'No kudos entries match this filter.'}
              </p>
              {activeKudosFilter !== 'all' ? (
                <button
                  onClick={() => setActiveKudosFilter('all')}
                  className="apple-btn-secondary"
                >
                  Reset filter
                </button>
              ) : (
                <button
                  onClick={() => setIsGiveKudosOpen(true)}
                  className="apple-btn-primary"
                >
                  Send the first kudos
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-5 stagger">
              {filteredKudos.map(kud => {
                const sender = employeeMap[kud.fromId];
                const receiver = employeeMap[kud.toId];
                if (!sender || !receiver) return null;

                const style = getValueStyle(kud.value);
                const ValueIcon = style.icon;
                const hasComments = kud.replies.length > 0;
                const isExpanded = !!expandedComments[kud.id];

                return (
                  <article key={kud.id} className="glass-card p-5 flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex items-center -space-x-2">
                          <img
                            src={sender.avatar}
                            alt={sender.name}
                            title={`Sender: ${sender.name}`}
                            className="w-9 h-9 rounded-full ring-2 ring-card bg-secondary object-cover z-10"
                          />
                          <img
                            src={receiver.avatar}
                            alt={receiver.name}
                            title={`Recipient: ${receiver.name}`}
                            className="w-9 h-9 rounded-full ring-2 ring-card bg-secondary object-cover"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="text-[13.5px] text-foreground/85 tracking-tight">
                            <span className="font-semibold text-foreground">{sender.name}</span>
                            <span className="text-muted-foreground"> recognized </span>
                            <span className="font-semibold text-foreground">{receiver.name}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <span>{new Date(kud.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1 capitalize">
                              {kud.visibility === 'private' ? (
                                <EyeOff className="w-3 h-3 text-apple-red" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                              {kud.visibility}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={`px-3 py-1.5 rounded-full ${style.bg} ${style.color} flex items-center gap-1.5 text-[11.5px] font-semibold tracking-tight`}>
                        <ValueIcon className="w-3.5 h-3.5" />
                        {style.label}
                      </div>
                    </div>

                    {/* Message */}
                    <p className="text-[14.5px] text-foreground/90 leading-relaxed">
                      "{kud.message}"
                    </p>

                    {/* Reactions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60">
                      <div className="flex flex-wrap gap-1.5">
                        {REACTIONS.map(rx => {
                          const count = kud.reactions.filter(r => r.emoji === rx.emoji).length;
                          const userHasReacted = kud.reactions.some(r => r.userId === user.id && r.emoji === rx.emoji);
                          const Icon = rx.icon;

                          return (
                            <button
                              key={rx.emoji}
                              onClick={() => handleReactionClick(kud.id, rx.emoji)}
                              title={rx.label}
                              aria-label={rx.label}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] border transition-all active:scale-[0.97] ${
                                userHasReacted
                                  ? 'bg-apple-blue/12 text-apple-blue border-apple-blue/35 font-semibold'
                                  : `bg-secondary/70 ${rx.tone} border-transparent hover:border-apple-blue/25 hover:bg-secondary`
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" strokeWidth={2.25} />
                              {count > 0 && <span className="text-[11px] text-foreground/80 font-medium">{count}</span>}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => toggleComments(kud.id)}
                        className="flex items-center gap-1.5 text-[12px] font-medium text-apple-blue hover:opacity-80 transition-opacity"
                      >
                        <MessagesSquare className="w-3.5 h-3.5" />
                        <span>{kud.replies.length} {kud.replies.length === 1 ? 'reply' : 'replies'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Threaded replies */}
                    {isExpanded && (
                      <div className="bg-secondary/40 rounded-2xl p-4 flex flex-col gap-3 animate-slide-up">
                        {hasComments && (
                          <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
                            {kud.replies.map(rep => {
                              const author = employeeMap[rep.authorId];
                              if (!author) return null;

                              return (
                                <div key={rep.id} className="flex gap-2.5 items-start">
                                  <img
                                    src={author.avatar}
                                    alt={author.name}
                                    className="w-7 h-7 rounded-full bg-secondary object-cover mt-0.5 shrink-0"
                                  />
                                  <div className="flex-1 apple-card p-3">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="font-semibold text-[12.5px] text-foreground tracking-tight">{author.name}</span>
                                      <span className="text-[10.5px] text-muted-foreground">
                                        {new Date(rep.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    <p className="text-[13px] text-foreground/85 leading-relaxed">
                                      {rep.body}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <form
                          onSubmit={(e) => handleReplySubmit(e, kud.id)}
                          className="flex gap-2"
                        >
                          <input
                            type="text"
                            placeholder="Write a reply…"
                            value={replyInput[kud.id] || ''}
                            onChange={(e) => setReplyInput(prev => ({ ...prev, [kud.id]: e.target.value }))}
                            className="apple-input text-[13px] py-2"
                          />
                          <button
                            type="submit"
                            className="apple-btn-primary w-9 h-9 p-0 shrink-0"
                            aria-label="Send reply"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Leaderboard sidebar */}
        <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-5 lg:sticky lg:top-8">
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-apple-orange" />
                <h3 className="text-[15px] font-semibold tracking-tight text-foreground">Leaderboard</h3>
              </div>
              <span className="text-[10.5px] font-semibold uppercase tracking-widest text-apple-blue">
                Live
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="w-6 h-6" />
                      <Skeleton className="w-8 h-8" rounded="full" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="w-10 h-3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {leaderboard.slice(0, 7).map((entry, index) => {
                  const userEntity = employeeMap[entry.id];
                  if (!userEntity) return null;

                  let rankVisual: React.ReactNode = (
                    <span className="w-6 h-6 rounded-full bg-secondary text-muted-foreground flex items-center justify-center shrink-0">
                      <Star className="w-3 h-3" />
                    </span>
                  );
                  if (index === 0) rankVisual = <span className="w-6 h-6 rounded-full bg-apple-orange/15 text-apple-orange flex items-center justify-center shrink-0"><Medal className="w-3.5 h-3.5" /></span>;
                  if (index === 1) rankVisual = <span className="w-6 h-6 rounded-full bg-apple-gray/15 text-apple-gray flex items-center justify-center shrink-0"><Medal className="w-3.5 h-3.5" /></span>;
                  if (index === 2) rankVisual = <span className="w-6 h-6 rounded-full bg-apple-yellow/15 text-apple-yellow flex items-center justify-center shrink-0"><Medal className="w-3.5 h-3.5" /></span>;

                  const isMe = user.id === entry.id;

                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                        isMe
                          ? 'bg-apple-blue/8'
                          : 'hover:bg-secondary/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        {rankVisual}
                        <img
                          src={userEntity.avatar}
                          alt={userEntity.name}
                          className="w-8 h-8 rounded-full bg-secondary object-cover shrink-0"
                        />
                        <div className="overflow-hidden">
                          <div className="text-[12.5px] font-semibold text-foreground truncate flex items-center gap-1.5 tracking-tight">
                            {userEntity.name}
                            {isMe && (
                              <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-semibold">You</span>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate capitalize">
                            {userEntity.jobTitle}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[13px] font-semibold text-foreground tracking-tight">
                          {entry.points} pts
                        </div>
                        <div className="text-[10.5px] text-apple-blue font-medium">
                          Lvl {userEntity.level}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Give Kudos modal */}
      {isGiveKudosOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div
            onClick={() => setIsGiveKudosOpen(false)}
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm transition-opacity"
          />

          <div className="relative w-full max-w-lg material-thick rounded-3xl shadow-apple-xl flex flex-col max-h-[92vh] animate-scale-in overflow-hidden">
            {/* Header */}
            <div className="apple-sheet-header px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-semibold tracking-tight text-foreground flex items-center gap-2">
                  <Award className="w-4 h-4 text-apple-blue" /> Give Kudos
                </h3>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  Recognize a colleague and award them culture points.
                </p>
              </div>
              <button
                onClick={() => setIsGiveKudosOpen(false)}
                className="w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground active:scale-[0.97] transition-all"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form body */}
            <form
              onSubmit={handleGiveKudosSubmit}
              className="flex-1 overflow-y-auto p-6 flex flex-col gap-5"
            >
              {/* Recipient */}
              <div className="flex flex-col gap-2">
                <label className="text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Teammate
                </label>
                <div className="relative">
                  <select
                    value={kudosRecipient}
                    onChange={(e) => setKudosRecipient(e.target.value)}
                    className="apple-input appearance-none pr-10 text-[13.5px] font-medium"
                  >
                    {potentialRecipients.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} — {getDeptName(emp.departmentId)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Core values */}
              <div className="flex flex-col gap-2.5">
                <label className="text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Core Value
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  {CORE_VALUES.map(val => {
                    const ValueIcon = val.icon;
                    const isSelected = selectedCoreValue === val.id;

                    return (
                      <button
                        key={val.id}
                        type="button"
                        onClick={() => setSelectedCoreValue(val.id as CoreValueId)}
                        className={`p-3 rounded-2xl flex flex-col gap-2 transition-all outline-none text-left active:scale-[0.97] border ${
                          isSelected
                            ? `${val.bg} border-transparent ring-2 ${val.ring}`
                            : 'bg-card border-border hover:bg-secondary/60'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${val.bg} ${val.color}`}>
                          <ValueIcon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className="text-[12.5px] font-semibold text-foreground tracking-tight">{val.label}</h4>
                          <p className="text-[10.5px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                            {val.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-2">
                <label className="text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe their exceptional work. Be specific about what they did and how it inspired the team."
                  value={kudosMessage}
                  onChange={(e) => setKudosMessage(e.target.value)}
                  required
                  className="apple-input resize-none leading-relaxed text-[13.5px]"
                />
              </div>

              {/* Visibility */}
              <div className="flex flex-col gap-2">
                <label className="text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Visibility
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'public', label: 'Public', desc: 'Everyone' },
                    { id: 'team', label: 'Team', desc: 'Department' },
                    { id: 'private', label: 'Private', desc: 'Recipient & HR' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setKudosVisibility(opt.id as 'public' | 'team' | 'private')}
                      className={`p-2.5 rounded-xl flex flex-col items-center gap-0.5 transition-all outline-none active:scale-[0.97] border ${
                        kudosVisibility === opt.id
                          ? 'bg-primary text-primary-foreground border-transparent shadow-apple-sm'
                          : 'bg-card border-border text-foreground hover:bg-secondary/60'
                      }`}
                    >
                      <span className="text-[12px] font-semibold tracking-tight">{opt.label}</span>
                      <span className={`text-[10px] leading-none ${kudosVisibility === opt.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="p-5 border-t border-border bg-card/60 flex gap-3">
              <button
                type="button"
                onClick={() => setIsGiveKudosOpen(false)}
                className="apple-btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleGiveKudosSubmit}
                disabled={isSubmitting}
                className="apple-btn-primary flex-1"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>Send Kudos</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
