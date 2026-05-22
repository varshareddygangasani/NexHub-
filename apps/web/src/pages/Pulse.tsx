import React, { useState, useEffect, useMemo } from 'react';
import { useDataStore } from '../stores/dataStore';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import {
  Radar,
  Send,
  MessagesSquare,
  Pencil,
  TrendingUp,
  Users2,
  Compass,
  MapPin,
  Globe,
  Lock,
  Award,
  LineChart as LineChartIcon,
  CircleDot,
  Building2,
  ThumbsUp,
  Heart,
  PartyPopper,
  Lightbulb,
  Flame,
  Eye,
  type LucideIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Skeleton, SkeletonCard } from '../components/Skeleton';

const OFFICE_HUBS = [
  { name: 'Bengaluru', manager: 'Meera Iyer', headcount: 85, focus: 'Engineering & SRE Infrastructure', status: 'Optimal' },
  { name: 'London', manager: 'Charlie Mercer', headcount: 42, focus: 'Global Finance & CS Coordination', status: 'Optimal' },
  { name: 'Mumbai', manager: 'Arjun Rao', headcount: 68, focus: 'Human Resources & Marketing Ops', status: 'Optimal' },
  { name: 'New York', manager: 'David Chen', headcount: 25, focus: 'Executive Strategy & Corporate ARR', status: 'Optimal' },
  { name: 'San Francisco', manager: 'Marcus Vance', headcount: 31, focus: 'Product Discovery & Management HQ', status: 'Optimal' },
];

const POST_TYPES: Array<{ id: 'standard' | 'experience' | 'celebration' | 'achievement'; label: string; tint: string }> = [
  { id: 'standard', label: 'General', tint: 'bg-secondary text-foreground' },
  { id: 'experience', label: 'Experience', tint: 'bg-apple-blue/12 text-apple-blue' },
  { id: 'celebration', label: 'Celebration', tint: 'bg-apple-orange/12 text-apple-orange' },
  { id: 'achievement', label: 'Achievement', tint: 'bg-apple-green/12 text-apple-green' },
];

type ReactionKey = '👏' | '❤️' | '🎉' | '💡' | '🔥' | '👀';
const REACTIONS: Array<{ emoji: ReactionKey; name: string; label: string; icon: LucideIcon; tone: string }> = [
  { emoji: '👏', name: 'applause',  label: 'Applaud',    icon: ThumbsUp,    tone: 'text-apple-blue' },
  { emoji: '❤️', name: 'love',      label: 'Love',       icon: Heart,       tone: 'text-apple-pink' },
  { emoji: '🎉', name: 'celebrate', label: 'Celebrate',  icon: PartyPopper, tone: 'text-apple-purple' },
  { emoji: '💡', name: 'insight',   label: 'Insight',    icon: Lightbulb,   tone: 'text-apple-yellow' },
  { emoji: '🔥', name: 'fire',      label: 'Fire',       icon: Flame,       tone: 'text-apple-orange' },
  { emoji: '👀', name: 'eyes',      label: 'Eyes',       icon: Eye,         tone: 'text-apple-cyan' },
];

export default function Pulse() {
  const {
    feed,
    wins,
    employees,
    reactToPost,
    addCommentToPost,
    submitToModeration,
  } = useDataStore();
  const { user } = useAuthStore();
  const { showToast } = useToastStore();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'social-feed' | 'alignment-stats'>('social-feed');

  const [postText, setPostText] = useState('');
  const [postType, setPostType] = useState<'standard' | 'experience' | 'celebration' | 'achievement'>('standard');
  const [postVisibility, setPostVisibility] = useState<'public' | 'dept'>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const employeeMap = useMemo(() => {
    return employees.reduce<Record<string, typeof employees[0]>>((acc, emp) => {
      acc[emp.id] = emp;
      return acc;
    }, {});
  }, [employees]);

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

  const filteredFeed = useMemo(() => {
    if (!user) return [];
    return feed.filter(post => {
      if (post.status !== 'published') return false;
      if (post.visibility === 'public') return true;
      if (post.visibility.startsWith('department:')) {
        const deptId = post.visibility.split(':')[1];
        return user.departmentId === deptId || user.role === 'hr' || user.role === 'admin';
      }
      return true;
    });
  }, [feed, user]);

  const kudosChartData = useMemo(() => {
    const counts: Record<string, number> = {
      Engineering: 2,
      Product: 1,
      Design: 1,
      CS: 1,
      Sales: 1,
      Finance: 1,
      HR: 1,
    };
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, []);

  const engagementGrowthData = [
    { name: 'Q3-25', EMEA: 82, APAC: 75, AMER: 90 },
    { name: 'Q4-25', EMEA: 88, APAC: 81, AMER: 93 },
    { name: 'Q1-26', EMEA: 93, APAC: 88, AMER: 96 },
    { name: 'Q2-26', EMEA: 97, APAC: 94, AMER: 99 },
  ];

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!postText.trim()) {
      showToast('Please type something in the update box.', 'warning');
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    submitToModeration(user.id, postText.trim(), postType);

    setIsSubmitting(false);
    setPostText('');
    showToast('Post submitted for HR moderation review.', 'info');
  };

  const handleReactionClick = (postId: string, emoji: '👏' | '❤️' | '🎉' | '💡' | '🔥' | '👀') => {
    if (!user) return;
    reactToPost(postId, user.id, emoji);
  };

  const handleCommentSubmit = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!user) return;
    const body = commentText[postId];
    if (!body || !body.trim()) return;

    addCommentToPost(postId, user.id, body.trim());
    setCommentText(prev => ({ ...prev, [postId]: '' }));
    showToast('Comment posted.', 'success');
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  if (!user) return null;

  const postTypeTint = (type: string) => {
    const found = POST_TYPES.find(t => t.id === type);
    return found ? found.tint : 'bg-secondary text-foreground';
  };

  return (
    <div className="flex flex-col gap-8 text-left animate-fade-in">
      {/* Hero */}
      <header className="flex flex-col gap-2 section-rise">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-apple-blue/12 text-apple-blue">
            <Radar className="w-4.5 h-4.5" strokeWidth={2.25} />
          </span>
          <h1 className="text-[22px] md:text-[26px] font-semibold tracking-tight text-foreground">
            Pulse
          </h1>
        </div>
        <p className="text-[13.5px] text-muted-foreground max-w-2xl leading-relaxed">
          Connect through the social feed or align on OKRs, regional performance, and global office hubs.
        </p>

        {/* Tabs */}
        <div className="apple-segment mt-4 self-start">
          <button
            onClick={() => setActiveTab('social-feed')}
            className={`apple-segment-item ${activeTab === 'social-feed' ? 'apple-segment-item-active' : ''}`}
          >
            <Users2 className="w-3.5 h-3.5" /> Social Pulse Feed
          </button>
          <button
            onClick={() => setActiveTab('alignment-stats')}
            className={`apple-segment-item ${activeTab === 'alignment-stats' ? 'apple-segment-item-active' : ''}`}
          >
            <LineChartIcon className="w-3.5 h-3.5" /> Org Alignment & Stats
          </button>
        </div>
      </header>

      {activeTab === 'social-feed' ? (
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Main feed */}
          <div className="flex-1 w-full flex flex-col gap-5 min-w-0">
            {/* Composer */}
            <section className="glass-panel p-5">
              <h2 className="text-[16px] font-semibold tracking-tight text-foreground flex items-center gap-2 mb-4">
                <Pencil className="w-4 h-4 text-apple-blue" />
                Share an Update
              </h2>

              <form onSubmit={handlePostSubmit} className="flex flex-col gap-4">
                <textarea
                  rows={3}
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="What's happening in your work today?"
                  className="apple-input resize-none leading-relaxed text-[14px]"
                />

                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {POST_TYPES.map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setPostType(type.id)}
                        className={`px-3 py-1.5 rounded-full text-[11.5px] font-medium transition-all active:scale-[0.97] ${
                          postType === type.id
                            ? type.tint
                            : 'bg-secondary/70 text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 justify-between">
                    <select
                      value={postVisibility}
                      onChange={(e) => setPostVisibility(e.target.value as 'public' | 'dept')}
                      className="px-3 py-2 rounded-xl bg-secondary/70 text-[12px] font-medium text-foreground border-none outline-none cursor-pointer"
                    >
                      <option value="public">Public Intranet</option>
                      <option value="dept">My Department</option>
                    </select>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="apple-btn-primary px-4 py-2 text-[13px]"
                    >
                      {isSubmitting ? (
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>Post</>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </section>

            {/* Feed stream */}
            {loading ? (
              <div className="flex flex-col gap-5 w-full">
                {[1, 2, 3].map(i => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredFeed.length === 0 ? (
              <div className="glass-panel p-12 text-center text-muted-foreground text-[13.5px]">
                No posts published in this feed yet.
              </div>
            ) : (
              <div className="flex flex-col gap-5 stagger">
                {filteredFeed.map(post => {
                  const author = employeeMap[post.authorId];
                  if (!author) return null;

                  const isExpanded = !!expandedComments[post.id];
                  const hasComments = post.comments.length > 0;

                  return (
                    <article key={post.id} className="glass-card p-5 flex flex-col gap-4">
                      {/* Author */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={author.avatar}
                            alt={author.name}
                            className="w-10 h-10 rounded-full bg-secondary object-cover"
                          />
                          <div>
                            <h3 className="text-[14px] font-semibold text-foreground flex items-center gap-2 tracking-tight">
                              {author.name}
                              <span className="text-[10.5px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                                {getDeptName(author.departmentId)}
                              </span>
                            </h3>
                            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                              <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              <span>·</span>
                              <span className="flex items-center gap-1 capitalize">
                                {post.visibility.startsWith('department:') ? (
                                  <>
                                    <Lock className="w-3 h-3 text-apple-orange" /> Dept only
                                  </>
                                ) : (
                                  <>
                                    <Globe className="w-3 h-3" /> Public
                                  </>
                                )}
                              </span>
                            </p>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-semibold tracking-tight ${postTypeTint(post.type)} capitalize`}>
                          {post.type}
                        </span>
                      </div>

                      {/* Body */}
                      <p className="text-[14px] text-foreground/90 leading-relaxed">
                        {post.body}
                      </p>

                      {/* Image */}
                      {post.images && post.images.length > 0 && (
                        <div className="rounded-2xl overflow-hidden border border-border bg-secondary max-h-80">
                          {imageErrors[post.id] ? (
                            <div className="w-full h-48 bg-secondary flex flex-col items-center justify-center gap-3 p-6 text-center">
                              <div className="w-10 h-10 rounded-full bg-apple-blue/12 text-apple-blue flex items-center justify-center">
                                <Building2 className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-[13px] font-semibold text-foreground tracking-tight">NexHub Media Node</h4>
                                <p className="text-[11.5px] text-muted-foreground mt-1 max-w-xs mx-auto">
                                  Culture media channel is active but offline.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <img
                              src={post.images[0]}
                              alt="Attached media"
                              onError={() => setImageErrors(prev => ({ ...prev, [post.id]: true }))}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                            />
                          )}
                        </div>
                      )}

                      {/* Reactions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60">
                        <div className="flex flex-wrap gap-1.5">
                          {REACTIONS.map(rx => {
                            const count = post.reactions.filter(r => r.emoji === rx.emoji).length;
                            const hasReacted = post.reactions.some(r => r.userId === user.id && r.emoji === rx.emoji);
                            const Icon = rx.icon;

                            return (
                              <button
                                key={rx.emoji}
                                onClick={() => handleReactionClick(post.id, rx.emoji)}
                                title={rx.label}
                                aria-label={rx.label}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] border transition-all active:scale-[0.97] ${
                                  hasReacted
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
                          onClick={() => toggleComments(post.id)}
                          className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-apple-blue transition-colors"
                        >
                          <MessagesSquare className="w-3.5 h-3.5" />
                          <span>{post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}</span>
                        </button>
                      </div>

                      {/* Comments */}
                      {isExpanded && (
                        <div className="bg-secondary/40 rounded-2xl p-4 flex flex-col gap-3 animate-slide-up">
                          {hasComments && (
                            <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
                              {post.comments.map(cmt => {
                                const cAuthor = employeeMap[cmt.authorId];
                                if (!cAuthor) return null;

                                return (
                                  <div key={cmt.id} className="flex gap-2.5 items-start">
                                    <img
                                      src={cAuthor.avatar}
                                      alt={cAuthor.name}
                                      className="w-7 h-7 rounded-full bg-secondary object-cover mt-0.5 shrink-0"
                                    />
                                    <div className="flex-1 apple-card p-3">
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-[12.5px] text-foreground tracking-tight">{cAuthor.name}</span>
                                        <span className="text-[10.5px] text-muted-foreground">
                                          {new Date(cmt.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                      <p className="text-[13px] text-foreground/85 leading-relaxed">
                                        {cmt.body}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <form
                            onSubmit={(e) => handleCommentSubmit(e, post.id)}
                            className="flex gap-2"
                          >
                            <input
                              type="text"
                              value={commentText[post.id] || ''}
                              onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                              placeholder="Write a comment…"
                              className="apple-input text-[13px] py-2"
                            />
                            <button
                              type="submit"
                              className="apple-btn-primary w-9 h-9 p-0 shrink-0"
                              aria-label="Post comment"
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

          {/* Sidebar */}
          <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-5 lg:sticky lg:top-8">
            <div className="glass-panel p-5 bg-apple-orange/8">
              <h3 className="text-[15px] font-semibold tracking-tight text-foreground flex items-center gap-2 mb-3 pb-3 border-b border-border/60">
                <Compass className="w-4 h-4 text-apple-orange" /> CXO Corporate Vision
              </h3>

              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-[10.5px] font-semibold text-apple-orange uppercase tracking-widest">
                    Corporate Mission
                  </p>
                  <p className="text-[13px] text-foreground/80 leading-relaxed mt-1.5 italic">
                    "To break down corporate silos, surface long-term vision, and elevate everyday connections through transparency and peer alignment."
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground">
                    CEO Strategic Priorities
                  </p>

                  {[
                    'Singapore Regional Expansion Launch',
                    'HSL Theme Integration across Workspaces',
                    'Multi-Tenancy Clearance Engine Scaling',
                  ].map((prio, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-[13px] font-medium text-foreground/85">
                      <span className="w-1.5 h-1.5 rounded-full bg-apple-blue shrink-0" />
                      <span>{prio}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <section className="glass-card p-5">
              <h3 className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-apple-purple" /> Kudos by Department
              </h3>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={kudosChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderRadius: '12px',
                        border: '1px solid hsl(var(--border))',
                        color: 'hsl(var(--foreground))',
                        fontSize: '12px',
                        boxShadow: '0 8px 24px -12px rgba(0,0,0,0.18)',
                      }}
                      cursor={{ fill: 'hsl(var(--apple-blue) / 0.06)' }}
                    />
                    <defs>
                      <linearGradient id="colorKudos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--apple-purple))" stopOpacity={0.85} />
                        <stop offset="95%" stopColor="hsl(var(--apple-purple))" stopOpacity={0.25} />
                      </linearGradient>
                    </defs>
                    <Bar dataKey="count" fill="url(#colorKudos)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="glass-card p-5">
              <h3 className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-apple-green" /> Regional Engagement (%)
              </h3>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={engagementGrowthData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderRadius: '12px',
                        border: '1px solid hsl(var(--border))',
                        color: 'hsl(var(--foreground))',
                        fontSize: '12px',
                        boxShadow: '0 8px 24px -12px rgba(0,0,0,0.18)',
                      }}
                    />
                    <defs>
                      <linearGradient id="colorEMEA" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--apple-blue))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--apple-blue))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorAMER" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--apple-green))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--apple-green))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="EMEA" stroke="hsl(var(--apple-blue))" strokeWidth={2} fill="url(#colorEMEA)" />
                    <Area type="monotone" dataKey="AMER" stroke="hsl(var(--apple-green))" strokeWidth={2} fill="url(#colorAMER)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          {/* Wins timeline */}
          <section className="glass-panel p-5">
            <h3 className="text-[16px] font-semibold tracking-tight text-foreground flex items-center gap-2 mb-5 pb-3 border-b border-border/60">
              <CircleDot className="w-4 h-4 text-apple-green" /> Project Wins Timeline
            </h3>

            {loading ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-20 w-full" rounded="2xl" />
                ))}
              </div>
            ) : (
              <div className="relative pl-6 flex flex-col gap-5 text-left py-2 ml-3" style={{ borderLeft: '1px solid hsl(var(--border))' }}>
                {wins.map((win) => (
                  <div key={win.id} className="relative">
                    <span className="absolute -left-[31px] top-2 w-3 h-3 rounded-full bg-apple-green ring-4 ring-card" />

                    <div className="bg-secondary/40 rounded-2xl p-4 transition-all hover:bg-secondary/60">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-2">
                        <div>
                          <span className="text-[10.5px] font-semibold text-apple-green uppercase tracking-widest bg-apple-green/12 px-2 py-0.5 rounded-full">
                            {win.value}
                          </span>
                          <h4 className="text-[14px] font-semibold text-foreground mt-2 tracking-tight">
                            {win.projectName} <span className="text-muted-foreground font-normal">at</span> {win.client}
                          </h4>
                        </div>

                        <span className="text-[11px] text-muted-foreground font-medium">
                          {new Date(win.wonAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      <p className="text-[13px] text-foreground/80 leading-relaxed mb-3">
                        {win.description}
                      </p>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10.5px] uppercase tracking-widest font-semibold text-muted-foreground">Team</span>
                        <div className="flex -space-x-1.5">
                          {win.teamIds.map(id => {
                            const emp = employeeMap[id];
                            if (!emp) return null;
                            return (
                              <img
                                key={id}
                                src={emp.avatar}
                                alt={emp.name}
                                title={emp.name}
                                className="w-6 h-6 rounded-full bg-secondary object-cover ring-2 ring-card shrink-0"
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Office hubs */}
          <section className="glass-panel p-5">
            <h3 className="text-[16px] font-semibold tracking-tight text-foreground flex items-center gap-2 mb-5 pb-3 border-b border-border/60">
              <MapPin className="w-4 h-4 text-apple-blue" /> Global Office Hubs
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {OFFICE_HUBS.map((hub) => (
                <div key={hub.name} className="glass-card p-4 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex justify-between items-center gap-2">
                      <h4 className="text-[14px] font-semibold text-foreground tracking-tight">{hub.name}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-apple-green/12 text-apple-green font-semibold text-[10.5px] uppercase tracking-widest">
                        {hub.status}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-col gap-1.5 text-[12.5px]">
                      <div className="flex justify-between items-center text-muted-foreground">
                        <span>Manager</span>
                        <span className="font-medium text-foreground">{hub.manager}</span>
                      </div>
                      <div className="flex justify-between items-center text-muted-foreground">
                        <span>Headcount</span>
                        <span className="font-medium text-foreground">{hub.headcount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/60 text-[11.5px] text-muted-foreground leading-snug">
                    {hub.focus}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
