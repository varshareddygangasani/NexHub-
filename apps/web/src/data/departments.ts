import {
  Activity,
  Briefcase,
  CheckCircle2,
  CircleDashed,
  CircleDot,
  Coins,
  Cpu,
  HeartHandshake,
  type LucideIcon,
  Megaphone,
  Network,
  Palette,
  Target,
} from 'lucide-react';

export type Visibility = 'all' | 'dept' | 'admin_hr';
export type InitiativeStatus = 'ideation' | 'in-progress' | 'shipped';

export interface Initiative {
  id: string;
  title: string;
  description: string;
  status: InitiativeStatus;
  ownerId: string;
  teamIds: string[];
  startDate: string;
  visibility: Visibility;
}

export interface Department {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  headId: string;
  mission: string;
  headcount: number;
  openRoles: number;
  initiatives: Initiative[];
}

export interface DeptPalette {
  accent: string;
  accentSoft: string;
  ring: string;
  gradient: string;
  glow: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Cpu,
  Target,
  Palette,
  HeartHandshake,
  Briefcase,
  Megaphone,
  Coins,
  Activity,
  Network,
};

export const getDeptIcon = (name: string): LucideIcon => ICON_MAP[name] ?? Network;

const PALETTES: Record<string, DeptPalette> = {
  'dept-eng': {
    accent: '#6366F1',
    accentSoft: 'rgba(99, 102, 241, 0.12)',
    ring: 'rgba(99, 102, 241, 0.28)',
    gradient: 'linear-gradient(135deg, #818CF8 0%, #6366F1 55%, #4338CA 100%)',
    glow: 'rgba(99, 102, 241, 0.35)',
  },
  'dept-product': {
    accent: '#8B5CF6',
    accentSoft: 'rgba(139, 92, 246, 0.12)',
    ring: 'rgba(139, 92, 246, 0.28)',
    gradient: 'linear-gradient(135deg, #C4B5FD 0%, #8B5CF6 55%, #6D28D9 100%)',
    glow: 'rgba(139, 92, 246, 0.35)',
  },
  'dept-design': {
    accent: '#EC4899',
    accentSoft: 'rgba(236, 72, 153, 0.12)',
    ring: 'rgba(236, 72, 153, 0.28)',
    gradient: 'linear-gradient(135deg, #F9A8D4 0%, #EC4899 55%, #BE185D 100%)',
    glow: 'rgba(236, 72, 153, 0.35)',
  },
  'dept-hr': {
    accent: '#F59E0B',
    accentSoft: 'rgba(245, 158, 11, 0.14)',
    ring: 'rgba(245, 158, 11, 0.3)',
    gradient: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 55%, #B45309 100%)',
    glow: 'rgba(245, 158, 11, 0.35)',
  },
  'dept-sales': {
    accent: '#10B981',
    accentSoft: 'rgba(16, 185, 129, 0.13)',
    ring: 'rgba(16, 185, 129, 0.28)',
    gradient: 'linear-gradient(135deg, #6EE7B7 0%, #10B981 55%, #047857 100%)',
    glow: 'rgba(16, 185, 129, 0.35)',
  },
  'dept-marketing': {
    accent: '#F43F5E',
    accentSoft: 'rgba(244, 63, 94, 0.13)',
    ring: 'rgba(244, 63, 94, 0.28)',
    gradient: 'linear-gradient(135deg, #FDA4AF 0%, #F43F5E 55%, #BE123C 100%)',
    glow: 'rgba(244, 63, 94, 0.35)',
  },
  'dept-finance': {
    accent: '#14B8A6',
    accentSoft: 'rgba(20, 184, 166, 0.13)',
    ring: 'rgba(20, 184, 166, 0.28)',
    gradient: 'linear-gradient(135deg, #5EEAD4 0%, #14B8A6 55%, #0F766E 100%)',
    glow: 'rgba(20, 184, 166, 0.35)',
  },
  'dept-operations': {
    accent: '#64748B',
    accentSoft: 'rgba(100, 116, 139, 0.14)',
    ring: 'rgba(100, 116, 139, 0.28)',
    gradient: 'linear-gradient(135deg, #94A3B8 0%, #64748B 55%, #334155 100%)',
    glow: 'rgba(100, 116, 139, 0.3)',
  },
  'dept-cs': {
    accent: '#06B6D4',
    accentSoft: 'rgba(6, 182, 212, 0.13)',
    ring: 'rgba(6, 182, 212, 0.28)',
    gradient: 'linear-gradient(135deg, #67E8F9 0%, #06B6D4 55%, #0E7490 100%)',
    glow: 'rgba(6, 182, 212, 0.35)',
  },
  'dept-exec': {
    accent: '#A855F7',
    accentSoft: 'rgba(168, 85, 247, 0.13)',
    ring: 'rgba(168, 85, 247, 0.28)',
    gradient: 'linear-gradient(135deg, #D8B4FE 0%, #A855F7 55%, #7E22CE 100%)',
    glow: 'rgba(168, 85, 247, 0.35)',
  },
};

const DEFAULT_PALETTE: DeptPalette = PALETTES['dept-eng'];

export const getDeptPalette = (deptId: string): DeptPalette => PALETTES[deptId] ?? DEFAULT_PALETTE;

export const STATUS_META: Record<
  InitiativeStatus,
  { label: string; icon: LucideIcon; tint: string; accent: string }
> = {
  ideation: {
    label: 'Ideation',
    icon: CircleDashed,
    tint: 'bg-muted text-muted-foreground',
    accent: '#94A3B8',
  },
  'in-progress': {
    label: 'In progress',
    icon: CircleDot,
    tint: 'bg-amber-500/12 text-amber-600 dark:text-amber-400',
    accent: '#F59E0B',
  },
  shipped: {
    label: 'Shipped',
    icon: CheckCircle2,
    tint: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
    accent: '#10B981',
  },
};

export const DEPARTMENTS: Department[] = [
  {
    id: 'dept-eng',
    name: 'Engineering & Infrastructure',
    slug: 'engineering',
    iconName: 'Cpu',
    headId: 'emp-meera',
    mission:
      'Architecting high-performance cloud networks, optimizing developer monorepos, and steering robust system operations.',
    headcount: 3,
    openRoles: 1,
    initiatives: [
      {
        id: 'init-eng-1',
        title: 'SRE Monorepo Transition',
        description:
          'Restructuring shared workspaces under a centralized Vite dev server to consolidate static seed pipelines.',
        status: 'in-progress',
        ownerId: 'emp-priya',
        teamIds: ['emp-priya', 'emp-tariq'],
        startDate: '2026-04-10',
        visibility: 'all',
      },
      {
        id: 'init-eng-2',
        title: 'Kubernetes Cluster Sizing',
        description:
          'Restructuring cloud cluster sizing limits to decrease production server billing overhead by 22% ARR.',
        status: 'ideation',
        ownerId: 'emp-tariq',
        teamIds: ['emp-tariq', 'emp-meera'],
        startDate: '2026-06-01',
        visibility: 'dept',
      },
      {
        id: 'init-eng-3',
        title: 'Vite v5 Migration Engine',
        description:
          'Refactoring bundler compiler chains to decrease HMR hot updates to a simulated 180ms delay.',
        status: 'shipped',
        ownerId: 'emp-priya',
        teamIds: ['emp-priya'],
        startDate: '2026-02-15',
        visibility: 'all',
      },
      {
        id: 'init-eng-4',
        title: 'Secure VPN Auditing Keys',
        description:
          'Updating corporate security VPN protocols with audited encryption keys to prevent SRE vulnerabilities.',
        status: 'in-progress',
        ownerId: 'emp-meera',
        teamIds: ['emp-meera', 'emp-tariq'],
        startDate: '2026-05-01',
        visibility: 'admin_hr',
      },
    ],
  },
  {
    id: 'dept-product',
    name: 'Product Strategy',
    slug: 'product',
    iconName: 'Target',
    headId: 'emp-marcus',
    mission:
      'Steering the global roadmap, aligning continuous customer discovery, and translating requirements into beautiful designs.',
    headcount: 1,
    openRoles: 1,
    initiatives: [
      {
        id: 'init-prod-1',
        title: 'Mobile Companion Specifications',
        description:
          'Authoring additive mirror technical criteria sheets and Flutter mock definitions for Block C releases.',
        status: 'in-progress',
        ownerId: 'emp-marcus',
        teamIds: ['emp-marcus'],
        startDate: '2026-05-18',
        visibility: 'all',
      },
      {
        id: 'init-prod-2',
        title: 'Enterprise Analytics Module',
        description:
          'Designing visual metrics layout telemetry systems matching HR user active/inactive toggling states.',
        status: 'ideation',
        ownerId: 'emp-marcus',
        teamIds: ['emp-marcus'],
        startDate: '2026-07-01',
        visibility: 'dept',
      },
      {
        id: 'init-prod-3',
        title: 'Hybrid Workplaces Alignment',
        description:
          'Drafting cross-functional workspace expectations manual to align multi-tenant employee clearances.',
        status: 'shipped',
        ownerId: 'emp-marcus',
        teamIds: ['emp-marcus'],
        startDate: '2026-03-01',
        visibility: 'all',
      },
    ],
  },
  {
    id: 'dept-design',
    name: 'Digital Experience & Design',
    slug: 'design',
    iconName: 'Palette',
    headId: 'emp-elena',
    mission:
      'Formulating elegant design systems, responsive canvas interactions, cohesive spacing scales, and custom tokens.',
    headcount: 1,
    openRoles: 0,
    initiatives: [
      {
        id: 'init-ds-1',
        title: 'Dark Mode Color Palette',
        description:
          'Refactoring default tailwind colors to custom tailored variables maintaining premium readability.',
        status: 'in-progress',
        ownerId: 'emp-elena',
        teamIds: ['emp-elena'],
        startDate: '2026-05-12',
        visibility: 'all',
      },
      {
        id: 'init-ds-2',
        title: 'Org Chart Tree Specs',
        description:
          'Drafting tree layout models using SVG coordinate connectors and side-over identity detail panels.',
        status: 'ideation',
        ownerId: 'emp-elena',
        teamIds: ['emp-elena'],
        startDate: '2026-06-15',
        visibility: 'dept',
      },
      {
        id: 'init-ds-3',
        title: 'Recognition Moments',
        description:
          'Refining subtle motion cues for kudos submissions and milestone celebrations.',
        status: 'shipped',
        ownerId: 'emp-elena',
        teamIds: ['emp-elena'],
        startDate: '2026-04-01',
        visibility: 'all',
      },
    ],
  },
  {
    id: 'dept-hr',
    name: 'Culture & People Operations',
    slug: 'hr',
    iconName: 'HeartHandshake',
    headId: 'emp-arjun',
    mission:
      'Nurturing employee wellness, championing recognition feedback loops, and resolving departmental siloing blocks.',
    headcount: 1,
    openRoles: 2,
    initiatives: [
      {
        id: 'init-hr-1',
        title: 'Leadership Weekly Pulse',
        description:
          'Integrating horizontal CEO address strips inside standard employee dashboards to unify message feeds.',
        status: 'in-progress',
        ownerId: 'emp-arjun',
        teamIds: ['emp-arjun'],
        startDate: '2026-05-10',
        visibility: 'all',
      },
      {
        id: 'init-hr-2',
        title: 'Gamified Talent Leaderboard',
        description:
          'Constructing high-points gamification tiers where teammates get 20pts for kudos receivers / 10pts for senders.',
        status: 'shipped',
        ownerId: 'emp-arjun',
        teamIds: ['emp-arjun'],
        startDate: '2026-03-20',
        visibility: 'all',
      },
      {
        id: 'init-hr-3',
        title: 'Executive Compensation Audits',
        description:
          'Auditing salary bands and competitive recruitment scales scoped strictly for executive HR directors.',
        status: 'ideation',
        ownerId: 'emp-arjun',
        teamIds: ['emp-arjun'],
        startDate: '2026-08-01',
        visibility: 'admin_hr',
      },
    ],
  },
  {
    id: 'dept-sales',
    name: 'Global Enterprise Sales',
    slug: 'sales',
    iconName: 'Briefcase',
    headId: 'emp-sarah',
    mission:
      'Securing global enterprise accounts, growing business ARR benchmarks, and coaching top sales teams.',
    headcount: 1,
    openRoles: 1,
    initiatives: [
      {
        id: 'init-sl-1',
        title: 'APAC Regional Growth Campaign',
        description:
          'Penetrating enterprise client networks across Tokyo and Singapore hubs targeting ARR metrics.',
        status: 'in-progress',
        ownerId: 'emp-sarah',
        teamIds: ['emp-sarah'],
        startDate: '2026-05-01',
        visibility: 'all',
      },
      {
        id: 'init-sl-2',
        title: 'Strategic Account Targets',
        description:
          'Confidential client pipeline prospecting data scoped for core leadership and sales directors.',
        status: 'ideation',
        ownerId: 'emp-sarah',
        teamIds: ['emp-sarah'],
        startDate: '2026-06-20',
        visibility: 'dept',
      },
      {
        id: 'init-sl-3',
        title: 'Fortune 500 ARR Benchmark',
        description:
          'Closing key ARR milestones celebrating major contract integrations across financial institutions.',
        status: 'shipped',
        ownerId: 'emp-sarah',
        teamIds: ['emp-sarah'],
        startDate: '2026-04-10',
        visibility: 'all',
      },
    ],
  },
  {
    id: 'dept-marketing',
    name: 'Global Marketing & PR',
    slug: 'marketing',
    iconName: 'Megaphone',
    headId: 'emp-samir',
    mission:
      'Telling company brand stories, organizing regional customer events, and running conversion SEO campaigns.',
    headcount: 1,
    openRoles: 1,
    initiatives: [
      {
        id: 'init-mkt-1',
        title: 'Pulse Platform Branding Launch',
        description:
          'Coordinating international public relation statements celebrating high alignment scores.',
        status: 'in-progress',
        ownerId: 'emp-samir',
        teamIds: ['emp-samir'],
        startDate: '2026-04-30',
        visibility: 'all',
      },
      {
        id: 'init-mkt-2',
        title: 'SEO Content Pillar Optimization',
        description:
          'Drafting strategic industry search index keys to expand online visibility by 40% Q4.',
        status: 'ideation',
        ownerId: 'emp-samir',
        teamIds: ['emp-samir'],
        startDate: '2026-07-15',
        visibility: 'all',
      },
      {
        id: 'init-mkt-3',
        title: 'Q3 Advisory Board Event',
        description:
          'Scheduling strategic executive feedback roundtables with core enterprise clients.',
        status: 'shipped',
        ownerId: 'emp-samir',
        teamIds: ['emp-samir'],
        startDate: '2026-03-12',
        visibility: 'all',
      },
    ],
  },
  {
    id: 'dept-finance',
    name: 'Global Finance & Risk',
    slug: 'finance',
    iconName: 'Coins',
    headId: 'emp-charlie',
    mission:
      'Supervising budget allocations, running audit compliance reviews, and safeguarding long-term asset models.',
    headcount: 1,
    openRoles: 0,
    initiatives: [
      {
        id: 'init-fin-1',
        title: 'Monorepo Licensing Audits',
        description:
          'Auditing third-party licenses across subpackages to ensure open source compliance standards.',
        status: 'in-progress',
        ownerId: 'emp-charlie',
        teamIds: ['emp-charlie'],
        startDate: '2026-05-01',
        visibility: 'all',
      },
      {
        id: 'init-fin-2',
        title: 'Executive Compensation Projections',
        description:
          'Aggregating restricted executive pay modeling reports scoped for operations leads only.',
        status: 'ideation',
        ownerId: 'emp-charlie',
        teamIds: ['emp-charlie'],
        startDate: '2026-09-01',
        visibility: 'admin_hr',
      },
      {
        id: 'init-fin-3',
        title: 'Q3 Expense Dashboard Tools',
        description:
          'Integrating secure API endpoints to feed budget tables without breaching visibility clearance.',
        status: 'shipped',
        ownerId: 'emp-charlie',
        teamIds: ['emp-charlie'],
        startDate: '2026-02-01',
        visibility: 'dept',
      },
    ],
  },
  {
    id: 'dept-operations',
    name: 'Operations & Enterprise SRE',
    slug: 'operations',
    iconName: 'Activity',
    headId: 'emp-meera',
    mission:
      'Managing server grids, overseeing standard firewall protocols, and ensuring 100% online platform connectivity.',
    headcount: 1,
    openRoles: 1,
    initiatives: [
      {
        id: 'init-ops-1',
        title: 'Intranet Telemetry',
        description:
          'Integrating real-time CPU node health alerts on admin panels for instant diagnostic visibility.',
        status: 'in-progress',
        ownerId: 'emp-meera',
        teamIds: ['emp-meera'],
        startDate: '2026-05-15',
        visibility: 'all',
      },
      {
        id: 'init-ops-2',
        title: 'AWS Grid Relocation Targets',
        description:
          'Relocating redundant cloud nodes to sustainable power regions maintaining a simulated 800ms fetch target.',
        status: 'ideation',
        ownerId: 'emp-meera',
        teamIds: ['emp-meera'],
        startDate: '2026-08-01',
        visibility: 'dept',
      },
      {
        id: 'init-ops-3',
        title: 'Platform ISO Security Seal',
        description:
          'Securing complete internal data transmission seals verifying standard corporate data clearance.',
        status: 'shipped',
        ownerId: 'emp-meera',
        teamIds: ['emp-meera'],
        startDate: '2026-01-20',
        visibility: 'admin_hr',
      },
    ],
  },
];

export const findDepartment = (key: string): Department | undefined =>
  DEPARTMENTS.find((d) => d.id === key || d.slug === key);
