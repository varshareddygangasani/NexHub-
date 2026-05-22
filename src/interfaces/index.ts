export type UserRole = 'employee' | 'hr' | 'admin';

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  departmentId: string;
  avatar: string;
  joinDate: string;
  birthDate: string;
  bio: string;
  skills: string[];
  badges: Badge[];
  points: number;
  location: string;
  phoneNumber: string;
  managerId: string | null; // For org chart
  status: 'active' | 'out-of-office' | 'remote';
  socialLinks?: {
    slack?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'achievement' | 'milestone' | 'core-value';
  awardedAt: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  icon: string;
  leadId: string; // Employee ID of the manager
  focus: string; // Current focus or motto
  visibilityControl: 'public' | 'internal' | 'restricted';
  crossFunctionalProjects: string[]; // names of active cross-dept projects
}

export type PostType = 'leadership' | 'announcement' | 'story' | 'celebration';

export interface Reaction {
  emoji: string;
  employeeIds: string[]; // list of employees who reacted with this emoji
}

export interface Reply {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  timestamp: string;
}

export interface Post {
  id: string;
  authorId: string;
  title?: string;
  content: string;
  type: PostType;
  timestamp: string;
  pinned: boolean;
  reactions: Reaction[];
  replies: Reply[];
  departmentId?: string; // Multi-tenancy visibility controls
  coverImage?: string;
}

export type KudosCategory = 'collaboration' | 'innovation' | 'leadership' | 'excellence' | 'customer-first' | 'growth';

export interface Kudos {
  id: string;
  senderId: string;
  receiverId: string;
  category: KudosCategory;
  message: string;
  timestamp: string;
  reactions: Reaction[];
  points: number;
}

export type EventCategory = 'work' | 'social' | 'learning' | 'leadership' | 'milestone';

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  startDate: string;
  endDate: string;
  location: string;
  organizerId: string;
  rsvps: string[]; // list of Employee IDs who accepted
  coverImage?: string;
}

export type DocCategory = 'handbook' | 'policy' | 'template' | 'guide';

export interface Document {
  id: string;
  title: string;
  description: string;
  url: string; // Mock file URL
  category: DocCategory;
  departmentId?: string; // empty means company-wide
  uploadedById: string;
  uploadedAt: string;
  downloadsCount: number;
  fileSize: string; // e.g. "2.4 MB"
}

export interface ForumReply {
  id: string;
  questionId: string;
  authorId: string;
  content: string;
  timestamp: string;
  isOfficialAnswer: boolean; // Flag if HR or admin marks as official
}

export interface ForumQuestion {
  id: string;
  title: string;
  content: string;
  authorId: string;
  category: 'hr' | 'it' | 'general' | 'department';
  departmentId?: string; // For dept-specific questions
  timestamp: string;
  replies: ForumReply[];
  status: 'open' | 'answered' | 'moderated';
  upvotes: string[]; // employee IDs
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl: string;
  timestamp: string;
  eventId?: string; // Associated event if any
  uploadedById: string;
}

export interface EngagementMetric {
  date: string;
  activeUsers: number;
  kudosSent: number;
  postsCreated: number;
  forumReplies: number;
}

export interface AuditLog {
  id: string;
  actorId: string; // Employee ID
  action: string; // Action description
  timestamp: string;
  targetType: 'post' | 'kudos' | 'document' | 'event' | 'forum' | 'system';
  targetId: string;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  title: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'kudos' | 'announcement' | 'reply' | 'event' | 'mention';
  link?: string; // Redirect path
}
