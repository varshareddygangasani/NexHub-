import type { Department, UserRole, KudosCategory } from '../interfaces';

// -------------------------------------------------------------
// DEMO CREDENTIAL CARDS SETUP
// -------------------------------------------------------------
export interface DemoCredential {
  name: string;
  email: string;
  role: UserRole;
  title: string;
  avatar: string;
  description: string;
}

export const DEMO_CREDENTIALS: DemoCredential[] = [
  {
    name: "Alex Rivera",
    email: "alex.admin@nexhub.corp",
    role: "admin",
    title: "VP of Enterprise Infrastructure",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    description: "Full access to publish content, view engagement analytics, manage documents, and moderate content."
  },
  {
    name: "Marcus Vance",
    email: "marcus.hr@nexhub.corp",
    role: "hr",
    title: "Chief People Officer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    description: "Access to official announcements, Moderation Queue, Ask-HR panel, and employee directory management."
  },
  {
    name: "Elena Rostova",
    email: "elena.employee@nexhub.corp",
    role: "employee",
    title: "Senior Product Designer",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    description: "Standard access: peer kudos, dashboard interaction, RSVP to events, view departments, and search files."
  }
];

// -------------------------------------------------------------
// DEPARTMENTS CONSTANTS
// -------------------------------------------------------------
export const SEED_DEPARTMENTS: Department[] = [
  {
    id: "dept-eng",
    name: "Engineering",
    description: "Architecting, developing, and deploying scalable software and robust infrastructure.",
    icon: "Code",
    leadId: "emp-alex", // Alex Rivera
    focus: "Scaling our core infrastructure and adopting Vite + React 18.",
    visibilityControl: "public",
    crossFunctionalProjects: ["Project Phoenix", "SRE Upgrade v2"]
  },
  {
    id: "dept-design",
    name: "Product Design",
    description: "Crafting beautiful, accessible, and highly intuitive user experiences.",
    icon: "Palette",
    leadId: "emp-elena", // Elena Rostova
    focus: "Modernizing corporate identity and shipping fluid Tailwind systems.",
    visibilityControl: "public",
    crossFunctionalProjects: ["Project Phoenix", "Design System Revamp"]
  },
  {
    id: "dept-hr",
    name: "People Operations (HR)",
    description: "Fostering standard-setting culture, championing diversity, and supporting professional growth.",
    icon: "Heart",
    leadId: "emp-marcus", // Marcus Vance
    focus: "Rolling out peer kudos walls and company-wide learning paths.",
    visibilityControl: "public",
    crossFunctionalProjects: ["Diversity Council", "Wellness Program"]
  },
  {
    id: "dept-sales",
    name: "Sales & Marketing",
    description: "Driving growth, establishing market fit, and managing customer communication.",
    icon: "TrendingUp",
    leadId: "emp-sarah", // Sarah Jenkins
    focus: "Expanding international presence and targeting enterprise clients.",
    visibilityControl: "public",
    crossFunctionalProjects: ["Enterprise Outreach 2026"]
  },
  {
    id: "dept-exec",
    name: "Executive Leadership",
    description: "Guiding company vision, steering long-term strategy, and driving strategic alignment.",
    icon: "ShieldAlert",
    leadId: "emp-ceo", // David Chen
    focus: "Break down corporate silos and scale NexHub to 500+ employees.",
    visibilityControl: "restricted",
    crossFunctionalProjects: ["Quarterly Board Prep", "Global Expansion"]
  },
  {
    id: "dept-cs",
    name: "Customer Success",
    description: "Delivering high-value post-onboarding support and boosting retention.",
    icon: "Users",
    leadId: "emp-clara", // Clara Oswald
    focus: "Launching 24/7 client feedback loops and lowering churn rate below 2%.",
    visibilityControl: "public",
    crossFunctionalProjects: ["Design System Revamp", "Enterprise Outreach 2026"]
  }
];

// -------------------------------------------------------------
// KUDOS CATEGORIES CONSTANTS
// -------------------------------------------------------------
export const KUDOS_CATEGORIES: { category: KudosCategory; label: string; icon: string; points: number }[] = [
  { category: "collaboration", label: "Collaboration", icon: "Handshake", points: 15 },
  { category: "innovation", label: "Innovation", icon: "Lightbulb", points: 25 },
  { category: "leadership", label: "Leadership", icon: "Crown", points: 20 },
  { category: "excellence", label: "Excellence", icon: "Award", points: 15 },
  { category: "customer-first", label: "Customer First", icon: "HeartHandshake", points: 15 },
  { category: "growth", label: "Growth Mindset", icon: "Sparkles", points: 10 }
];

// -------------------------------------------------------------
// SEED SECTIONS DEFINITION FOR GENERATION
// -------------------------------------------------------------
export const SEED_DATA_PLAN = {
  employeesCount: 50,
  departmentsCount: 6,
  postsCount: 30,
  eventsCount: 20,
  kudosCount: 105, // 100+ kudos
  timeRangeDays: 90, // 90 days of logs
  distribution: {
    posts: {
      leadership: 5,
      announcement: 8,
      story: 7,
      celebration: 10
    },
    events: {
      work: 6,
      social: 6,
      learning: 5,
      milestone: 3
    },
    kudos: {
      collaboration: 35,
      innovation: 15,
      leadership: 15,
      excellence: 20,
      "customer-first": 10,
      growth: 10
    }
  }
};
