import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Mail, ArrowRight, Loader2, ChevronRight, Sparkles, Trophy, MessagesSquare, Users2 } from 'lucide-react';
import { getInitialsAvatar } from '../lib/initialsAvatar';

const DEMO_USERS = [
  {
    name: 'Priya Menon',
    email: 'priya.menon@pulse.co',
    role: 'Member',
    title: 'Senior Software Engineer',
    avatar: getInitialsAvatar('Priya Menon'),
    accent: 'apple-blue',
  },
  {
    name: 'Arjun Rao',
    email: 'arjun.rao@pulse.co',
    role: 'HR Manager',
    title: 'Chief People Officer',
    avatar: getInitialsAvatar('Arjun Rao'),
    accent: 'apple-orange',
  },
  {
    name: 'Meera Iyer',
    email: 'meera.iyer@pulse.co',
    role: 'Administrator',
    title: 'VP of Enterprise Infra',
    avatar: getInitialsAvatar('Meera Iyer'),
    accent: 'apple-purple',
  },
];

// A handful of high-quality, free-to-use Unsplash images depicting collaborative
// modern workplaces. One is chosen deterministically per page-load.
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80',
];

export default function Login() {
  const [email, setEmail] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();

  // Deterministic-per-mount image pick (so it doesn't flicker on re-render but does vary across sessions).
  const [heroImage] = useState(() => HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)]);

  const handleDemo = (demoEmail: string) => {
    clearError();
    setEmail(demoEmail);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await login(email);
  };

  return (
    <div className="relative min-h-screen w-full bg-background grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
      {/* ============================================================
          LEFT — Hero image + brand story (hidden on small screens)
          ============================================================ */}
      <aside className="hidden lg:flex lg:col-span-6 xl:col-span-7 relative overflow-hidden">
        {/* Image */}
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />

        {/* Color wash + vignette to keep typography legible */}
        <div className="absolute inset-0 bg-gradient-to-br from-apple-blue/60 via-apple-indigo/45 to-apple-purple/55 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

        {/* Soft accent blobs */}
        <div className="absolute -top-24 -left-16 w-96 h-96 rounded-full bg-apple-pink/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full bg-apple-cyan/25 blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16 text-white">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-xl ring-1 ring-white/25 flex items-center justify-center shadow-apple-md">
              <span className="text-white font-bold text-lg tracking-tight">P</span>
            </div>
            <div className="leading-tight">
              <div className="text-[16px] font-semibold tracking-tight">PULSE</div>
              <div className="text-[11px] text-white/80">Corporate Intranet</div>
            </div>
          </div>

          {/* Pitch */}
          <div className="max-w-xl flex flex-col gap-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-xl ring-1 ring-white/25 text-[11px] font-semibold uppercase tracking-widest w-fit">
              <Sparkles className="w-3 h-3" />
              The beating heart of our company
            </span>
            <h1 className="text-[40px] xl:text-[52px] leading-[1.05] font-semibold tracking-tight">
              Stay aligned.
              <br />
              <span className="text-white/85">Celebrate the wins.</span>
            </h1>
            <p className="text-[15px] text-white/80 leading-relaxed max-w-md">
              A single place for leadership messages, recognition, knowledge and culture —
              built for everyone across the company, from engineers to HR.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                { icon: Trophy, label: 'Peer recognition' },
                { icon: MessagesSquare, label: 'Open forum' },
                { icon: Users2, label: 'People directory' },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <span
                    key={f.label}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/12 backdrop-blur-xl ring-1 ring-white/20 text-[12px] font-medium"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {f.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="text-[11.5px] text-white/65 leading-relaxed max-w-md">
            "We built PULSE so every teammate — wherever they are — feels part
            of the work we do together."
            <div className="mt-2 text-white/80 font-semibold">David Chen, CEO</div>
          </div>
        </div>
      </aside>

      {/* ============================================================
          RIGHT — Sign-in form
          ============================================================ */}
      <main className="lg:col-span-6 xl:col-span-5 flex items-center justify-center px-4 py-10 sm:py-14 lg:py-10">
        {/* Mobile-only ambient backdrop */}
        <div className="lg:hidden pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-apple-blue/20 blur-[160px]" />
          <div className="absolute -bottom-40 -right-40 w-[520px] h-[520px] rounded-full bg-apple-pink/15 blur-[180px]" />
        </div>

        <div className="w-full max-w-md animate-fade-in">
          {/* Compact brand for small screens */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-apple-blue to-apple-indigo flex items-center justify-center shadow-apple-md mb-4">
              <span className="text-white font-bold text-xl tracking-tight">P</span>
            </div>
            <h1 className="text-[26px] font-semibold tracking-tight text-foreground">Welcome to PULSE</h1>
          </div>

          {/* Title (desktop) */}
          <div className="hidden lg:flex flex-col gap-1.5 mb-8">
            <span className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground">
              Sign in
            </span>
            <h2 className="text-[30px] font-semibold tracking-tight text-foreground leading-tight">
              Welcome back
            </h2>
            <p className="text-[14px] text-muted-foreground">
              Use your corporate email to access your workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-muted-foreground px-1">Corporate email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    clearError();
                    setEmail(e.target.value);
                  }}
                  placeholder="name@pulse.co"
                  className="apple-input pl-10 text-[14px] py-3"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div className="text-[12.5px] text-apple-red bg-apple-red/10 border border-apple-red/20 rounded-xl px-3.5 py-2.5 leading-relaxed">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email}
              className="apple-btn-primary w-full py-3 text-[14px] mt-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10.5px] uppercase tracking-widest text-muted-foreground font-medium">
              Or try a demo profile
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Demo accounts */}
          <ul className="flex flex-col gap-2">
            {DEMO_USERS.map((u) => {
              const isSelected = email === u.email;
              return (
                <li key={u.email}>
                  <button
                    type="button"
                    onClick={() => handleDemo(u.email)}
                    className={[
                      'w-full flex items-center gap-3 p-2.5 rounded-2xl border transition-all',
                      isSelected
                        ? 'bg-apple-blue/8 border-apple-blue/40 shadow-apple-sm'
                        : 'bg-foreground/[0.03] border-border/60 hover:bg-foreground/[0.06]',
                    ].join(' ')}
                  >
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-10 h-10 rounded-full bg-secondary border border-border/60"
                    />
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-[13.5px] font-semibold text-foreground truncate">{u.name}</div>
                      <div className="text-[11.5px] text-muted-foreground truncate">{u.title}</div>
                    </div>
                    <span
                      className={[
                        'text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md shrink-0',
                        `bg-${u.accent}/10 text-${u.accent}`,
                      ].join(' ')}
                    >
                      {u.role}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="text-center text-[11.5px] text-muted-foreground mt-6 leading-relaxed">
            By signing in you agree to PULSE's workplace conduct guidelines.
          </p>
        </div>
      </main>
    </div>
  );
}
