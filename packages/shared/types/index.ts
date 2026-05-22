export type Role = 'employee' | 'hr' | 'admin';

export type Visibility = 'public' | `department:${string}` | `vertical:${string}` | `role:${Role}`;

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;                 // URL (deterministic: https://i.pravatar.cc/300?u=ID)
  role: Role;
  jobTitle: string;
  departmentId: string;
  verticalId?: string;
  managerId?: string;
  location: string;
  joinedAt: string;               // ISO date
  bio: string;
  skills: string[];
  interests: string[];
  languages: string[];
  funFact: string;
  points: number;
  level: number;
  badges: string[];               // badge IDs
  pronouns?: string;
  socials?: { linkedin?: string; twitter?: string; github?: string };
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  slug: string;
  colorToken: string;             // matches --dept-* CSS var
  icon: string;                   // lucide icon name
  headId: string;
  mission: string;
  headcount: number;
  openRoles: number;
  initiatives: Initiative[];
}

export interface Initiative {
  id: string;
  title: string;
  description: string;
  status: 'ideation' | 'in-progress' | 'shipped';
  ownerId: string;
  teamIds: string[];
  startDate: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;                   // markdown
  category: 'policy' | 'event' | 'achievement' | 'general';
  authorId: string;
  visibility: Visibility;
  pinned: boolean;
  scheduledFor?: string;
  publishedAt: string;
  attachments?: { name: string; url: string; type: string }[];
  acknowledgedBy: string[];       // user IDs
  views: number;
  comments: Comment[];
}

export type KudosValue = 'innovation' | 'team-player' | 'customer-focus' | 'excellence' | 'growth' | 'ownership';

export interface Kudos {
  id: string;
  fromId: string;
  toId: string;
  value: KudosValue;
  message: string;
  visibility: 'public' | 'team' | 'private';
  createdAt: string;
  reactions: Reaction[];
  replies: Comment[];
}

export interface Post {
  id: string;
  type: 'standard' | 'experience' | 'celebration' | 'achievement';
  authorId: string;
  body: string;
  images?: string[];
  taggedUserIds?: string[];
  taggedDepartmentIds?: string[];
  visibility: Visibility;
  createdAt: string;
  reactions: Reaction[];
  comments: Comment[];
  status: 'published' | 'under-review' | 'rejected';
  reportCount: number;
}

export interface Reaction {
  emoji: '👏' | '❤️' | '🎉' | '💡' | '🔥' | '👀';
  userId: string;
}

export interface Comment {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
  parentId?: string;              // for threading
  reactions: Reaction[];
}

export type EventType = 'townhall' | 'celebration' | 'learning' | 'wellness' | 'hackathon' | 'holiday';

export interface Event {
  id: string;
  title: string;
  description: string;
  type: EventType;
  startAt: string;
  endAt: string;
  location: string;
  isOnline: boolean;
  coverImage: string;
  organizerId: string;
  speakerIds?: string[];
  rsvps: { userId: string; status: 'going' | 'maybe' | 'not-going' }[];
  agenda?: { time: string; title: string }[];
  comments: Comment[];
}

export interface ProjectWin {
  id: string;
  projectName: string;
  client: string;
  value: string;                  // formatted, e.g. "$2.3M ARR"
  teamIds: string[];
  wonAt: string;
  description: string;
  reactions: Reaction[];
}

export interface LeadershipMessage {
  id: string;
  authorId: string;               // CEO/CXO user
  title: string;
  body: string;
  videoUrl?: string;
  thumbnail?: string;
  publishedAt: string;
  pinned: boolean;
}

export interface LeadershipMeet {
  id: string;
  month: string;                  // "2026-04"
  attendees: string[];
  keyDecisions: string[];
  actionItems: { task: string; ownerId: string; dueDate: string }[];
  strategicPriorities: string[];
}

export interface KnowledgeDoc {
  id: string;
  title: string;
  category: string;
  type: 'pdf' | 'doc' | 'video' | 'link';
  description: string;
  url: string;                    // placeholder
  ownerId: string;
  updatedAt: string;
  version: string;
  downloadCount: number;
  helpfulYes: number;
  helpfulNo: number;
  visibility: Visibility;
}

export interface ForumTopic {
  id: string;
  title: string;
  body: string;
  authorId: string;
  category: string;
  tags: string[];
  createdAt: string;
  upvotes: number;
  downvotes: number;
  viewCount: number;
  answers: ForumAnswer[];
  bestAnswerId?: string;
}

export interface ForumAnswer {
  id: string;
  topicId: string;
  authorId: string;
  body: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  event: string;
  date: string;
  cover: string;
  images: { url: string; caption?: string; taggedUserIds?: string[] }[];
  videos?: { url: string; thumbnail: string; title: string }[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'mention' | 'kudos' | 'announcement' | 'event' | 'comment' | 'reaction';
  actorId?: string;
  link: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  target: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}
