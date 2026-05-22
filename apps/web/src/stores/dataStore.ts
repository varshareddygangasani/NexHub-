import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Announcement,
  Kudos,
  Post,
  Event,
  ProjectWin,
  LeadershipMessage,
  KnowledgeDoc,
  ForumTopic,
  ForumAnswer,
  GalleryAlbum,
  AuditLogEntry,
  User,
  Comment,
  Reaction,
} from '@pulse/shared/types';

import employeesData from '@pulse/shared/seeds/employees.json';
import announcementsData from '@pulse/shared/seeds/announcements.json';
import kudosData from '@pulse/shared/seeds/kudos.json';
import winsData from '@pulse/shared/seeds/wins.json';
import leadershipData from '@pulse/shared/seeds/leadership.json';
import feedData from '@pulse/shared/seeds/feed.json';
import eventsData from '@pulse/shared/seeds/events.json';
import documentsData from '@pulse/shared/seeds/documents.json';
import forumData from '@pulse/shared/seeds/forum.json';
import leaderboardData from '@pulse/shared/seeds/leaderboard.json';
import moderationData from '@pulse/shared/seeds/moderation.json';
import galleryData from '@pulse/shared/seeds/gallery.json';
import { getInitialsAvatar } from '../lib/initialsAvatar';

// Bump this when seed shape changes — clears stale persisted state on reload.
const SEED_VERSION = 3;

// Replace photo URLs in seed data with on-the-fly generated initials avatars.
// Keeps every <img src={emp.avatar}> consumer working with zero code changes.
const employeesWithInitials = (employeesData as unknown as User[]).map((emp) => ({
  ...emp,
  avatar: getInitialsAvatar(emp.name),
}));

const leaderboardWithInitials = (leaderboardData as any[]).map((entry) => ({
  ...entry,
  id: entry.id ?? entry.employeeId,
  avatar: entry.name ? getInitialsAvatar(entry.name) : entry.avatar,
}));

interface DataState {
  _seedVersion: number;
  employees: User[];
  announcements: Announcement[];
  kudos: Kudos[];
  wins: ProjectWin[];
  leadership: LeadershipMessage[];
  feed: Post[];
  events: Event[];
  documents: KnowledgeDoc[];
  forum: ForumTopic[];
  leaderboard: any[];
  moderation: any[];
  gallery: GalleryAlbum[];
  auditLogs: AuditLogEntry[];

  toggleRSVP: (eventId: string, userId: string, status: 'going' | 'maybe' | 'not-going') => void;
  acknowledgeAnnouncement: (announcementId: string, userId: string) => void;

  addKudos: (
    fromId: string,
    toId: string,
    value: Kudos['value'],
    message: string,
    visibility: Kudos['visibility'],
  ) => void;
  reactToKudos: (kudosId: string, userId: string, emoji: Reaction['emoji']) => void;
  replyToKudos: (kudosId: string, userId: string, body: string) => void;

  reactToPost: (postId: string, userId: string, emoji: Reaction['emoji']) => void;
  addCommentToPost: (postId: string, authorId: string, body: string) => void;

  submitToModeration: (authorId: string, body: string, type: Post['type']) => void;
  approveModerationItem: (moderationId: string, actorId: string) => void;
  rejectModerationItem: (moderationId: string, actorId: string) => void;

  toggleUserActive: (employeeId: string, actorId: string) => void;
  updateUserRole: (employeeId: string, role: User['role'], actorId: string) => void;
  updateUserTags: (
    employeeId: string,
    patch: { skills?: string[]; interests?: string[]; languages?: string[] },
  ) => void;

  addForumTopic: (topic: ForumTopic) => void;
  upvoteForumTopic: (topicId: string) => void;
  incrementForumTopicViews: (topicId: string) => void;
  addForumAnswer: (topicId: string, answer: ForumAnswer) => void;
  upvoteForumAnswer: (topicId: string, answerId: string) => void;

  addAuditLog: (actorId: string, action: string, target: string, meta?: Record<string, any>) => void;

  resetData: () => void;
}

const initialState = () => ({
  _seedVersion: SEED_VERSION,
  employees: employeesWithInitials,
  announcements: announcementsData as unknown as Announcement[],
  kudos: kudosData as unknown as Kudos[],
  wins: winsData as unknown as ProjectWin[],
  leadership: leadershipData as unknown as LeadershipMessage[],
  feed: feedData as unknown as Post[],
  events: eventsData as unknown as Event[],
  documents: documentsData as unknown as KnowledgeDoc[],
  forum: forumData as unknown as ForumTopic[],
  leaderboard: leaderboardWithInitials,
  moderation: moderationData as any[],
  gallery: galleryData as unknown as GalleryAlbum[],
  auditLogs: [
    {
      id: 'aud-initial',
      actorId: 'emp-meera',
      action: 'SYSTEM_INITIALIZE',
      target: 'Pulse Intranet Platform',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      meta: { status: 'success' },
    },
  ] as AuditLogEntry[],
});

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      ...initialState(),

      toggleRSVP: (eventId, userId, status) => {
        set((state) => ({
          events: state.events.map((evt) => {
            if (evt.id !== eventId) return evt;
            const cleanRsvps = evt.rsvps.filter((r) => r.userId !== userId);
            return { ...evt, rsvps: [...cleanRsvps, { userId, status }] };
          }),
        }));
      },

      acknowledgeAnnouncement: (announcementId, userId) => {
        set((state) => ({
          announcements: state.announcements.map((ann) => {
            if (ann.id !== announcementId) return ann;
            if (ann.acknowledgedBy.includes(userId)) return ann;
            return {
              ...ann,
              acknowledgedBy: [...ann.acknowledgedBy, userId],
              views: ann.views + 1,
            };
          }),
        }));
      },

      addKudos: (fromId, toId, value, message, visibility) => {
        set((state) => {
          const newKudo: Kudos = {
            id: `kud-${Date.now()}`,
            fromId,
            toId,
            value,
            message,
            visibility,
            createdAt: new Date().toISOString(),
            reactions: [],
            replies: [],
          };

          const updatedEmployees = state.employees.map((emp) => {
            if (emp.id === toId)
              return { ...emp, points: emp.points + 20, level: Math.floor((emp.points + 20) / 100) + 1 };
            if (emp.id === fromId)
              return { ...emp, points: emp.points + 10, level: Math.floor((emp.points + 10) / 100) + 1 };
            return emp;
          });

          const updatedLeaderboard = [...state.leaderboard];
          const idx = updatedLeaderboard.findIndex((x) => x.id === toId);
          if (idx !== -1) {
            updatedLeaderboard[idx] = {
              ...updatedLeaderboard[idx],
              kudosReceived: updatedLeaderboard[idx].kudosReceived + 1,
              points: updatedLeaderboard[idx].points + 20,
            };
          }

          return {
            kudos: [newKudo, ...state.kudos],
            employees: updatedEmployees,
            leaderboard: updatedLeaderboard.sort((a, b) => b.points - a.points),
          };
        });
      },

      reactToKudos: (kudosId, userId, emoji) => {
        set((state) => ({
          kudos: state.kudos.map((kud) => {
            if (kud.id !== kudosId) return kud;
            const hasReacted = kud.reactions.some((r) => r.userId === userId && r.emoji === emoji);
            const filtered = kud.reactions.filter((r) => !(r.userId === userId && r.emoji === emoji));
            return { ...kud, reactions: hasReacted ? filtered : [...kud.reactions, { userId, emoji }] };
          }),
        }));
      },

      replyToKudos: (kudosId, userId, body) => {
        set((state) => ({
          kudos: state.kudos.map((kud) => {
            if (kud.id !== kudosId) return kud;
            const newComment: Comment = {
              id: `rep-${Date.now()}`,
              authorId: userId,
              body,
              createdAt: new Date().toISOString(),
              reactions: [],
            };
            return { ...kud, replies: [...kud.replies, newComment] };
          }),
        }));
      },

      reactToPost: (postId, userId, emoji) => {
        set((state) => ({
          feed: state.feed.map((post) => {
            if (post.id !== postId) return post;
            const hasReacted = post.reactions.some((r) => r.userId === userId && r.emoji === emoji);
            const filtered = post.reactions.filter((r) => !(r.userId === userId && r.emoji === emoji));
            return { ...post, reactions: hasReacted ? filtered : [...post.reactions, { userId, emoji }] };
          }),
        }));
      },

      addCommentToPost: (postId, authorId, body) => {
        set((state) => ({
          feed: state.feed.map((post) => {
            if (post.id !== postId) return post;
            const newComment: Comment = {
              id: `cmt-${Date.now()}`,
              authorId,
              body,
              createdAt: new Date().toISOString(),
              reactions: [],
            };
            return { ...post, comments: [...post.comments, newComment] };
          }),
        }));
      },

      submitToModeration: (authorId, body, type) => {
        set((state) => ({
          moderation: [
            {
              id: `mod-${Date.now()}`,
              type,
              authorId,
              body,
              createdAt: new Date().toISOString(),
              status: 'under-review',
              reportCount: 0,
            },
            ...state.moderation,
          ],
        }));
      },

      approveModerationItem: (moderationId, actorId) => {
        const state = get();
        const target = state.moderation.find((x) => x.id === moderationId);
        if (!target) return;

        set((s) => {
          const newPost: Post = {
            id: `pst-${Date.now()}`,
            type: target.type || 'standard',
            authorId: target.authorId,
            body: target.body,
            visibility: 'public',
            createdAt: new Date().toISOString(),
            reactions: [],
            comments: [],
            status: 'published',
            reportCount: 0,
          };

          const actorName = s.employees.find((e) => e.id === actorId)?.name || 'HR Operator';
          const newAudit: AuditLogEntry = {
            id: `aud-${Date.now()}`,
            actorId,
            action: 'APPROVE_MODERATION',
            target: target.id,
            timestamp: new Date().toISOString(),
            meta: { approvedBy: actorName, authorId: target.authorId },
          };

          return {
            moderation: s.moderation.filter((x) => x.id !== moderationId),
            feed: [newPost, ...s.feed],
            auditLogs: [newAudit, ...s.auditLogs],
          };
        });
      },

      rejectModerationItem: (moderationId, actorId) => {
        set((s) => {
          const newAudit: AuditLogEntry = {
            id: `aud-${Date.now()}`,
            actorId,
            action: 'REJECT_MODERATION',
            target: moderationId,
            timestamp: new Date().toISOString(),
            meta: { rejectedBy: actorId, reason: 'Gated policy violation' },
          };
          return {
            moderation: s.moderation.filter((x) => x.id !== moderationId),
            auditLogs: [newAudit, ...s.auditLogs],
          };
        });
      },

      toggleUserActive: (employeeId, actorId) => {
        set((s) => {
          const updated = s.employees.map((emp) =>
            emp.id === employeeId ? { ...emp, isActive: !emp.isActive } : emp,
          );
          const target = s.employees.find((e) => e.id === employeeId);
          const newAudit: AuditLogEntry = {
            id: `aud-${Date.now()}`,
            actorId,
            action: 'TOGGLE_USER_STATUS',
            target: employeeId,
            timestamp: new Date().toISOString(),
            meta: { targetName: target?.name, newStatus: !target?.isActive },
          };
          return { employees: updated, auditLogs: [newAudit, ...s.auditLogs] };
        });
      },

      updateUserRole: (employeeId, role, actorId) => {
        set((s) => {
          const updated = s.employees.map((emp) =>
            emp.id === employeeId ? { ...emp, role } : emp,
          );
          const target = s.employees.find((e) => e.id === employeeId);
          const newAudit: AuditLogEntry = {
            id: `aud-${Date.now()}`,
            actorId,
            action: 'UPDATE_USER_ROLE',
            target: employeeId,
            timestamp: new Date().toISOString(),
            meta: { targetName: target?.name, newRole: role },
          };
          return { employees: updated, auditLogs: [newAudit, ...s.auditLogs] };
        });
      },

      updateUserTags: (employeeId, patch) => {
        set((s) => {
          const updated = s.employees.map((emp) => {
            if (emp.id !== employeeId) return emp;
            return {
              ...emp,
              skills: patch.skills ?? emp.skills,
              interests: patch.interests ?? emp.interests,
              languages: patch.languages ?? emp.languages,
            };
          });
          const target = s.employees.find((e) => e.id === employeeId);
          const newAudit: AuditLogEntry = {
            id: `aud-${Date.now()}`,
            actorId: employeeId,
            action: 'UPDATE_TAGS',
            target: employeeId,
            timestamp: new Date().toISOString(),
            meta: { name: target?.name, fields: Object.keys(patch) },
          };
          return { employees: updated, auditLogs: [newAudit, ...s.auditLogs] };
        });
      },

      addForumTopic: (topic) => {
        set((s) => ({ forum: [topic, ...s.forum] }));
      },

      upvoteForumTopic: (topicId) => {
        set((s) => ({
          forum: s.forum.map((t) =>
            t.id === topicId ? { ...t, upvotes: t.upvotes + 1 } : t,
          ),
        }));
      },

      incrementForumTopicViews: (topicId) => {
        set((s) => ({
          forum: s.forum.map((t) =>
            t.id === topicId ? { ...t, viewCount: t.viewCount + 1 } : t,
          ),
        }));
      },

      addForumAnswer: (topicId, answer) => {
        set((s) => ({
          forum: s.forum.map((t) =>
            t.id === topicId ? { ...t, answers: [...t.answers, answer] } : t,
          ),
        }));
      },

      upvoteForumAnswer: (topicId, answerId) => {
        set((s) => ({
          forum: s.forum.map((t) =>
            t.id === topicId
              ? {
                  ...t,
                  answers: t.answers.map((a) =>
                    a.id === answerId ? { ...a, upvotes: a.upvotes + 1 } : a,
                  ),
                }
              : t,
          ),
        }));
      },

      addAuditLog: (actorId, action, target, meta) => {
        set((s) => ({
          auditLogs: [
            {
              id: `aud-${Date.now()}`,
              actorId,
              action,
              target,
              timestamp: new Date().toISOString(),
              meta,
            },
            ...s.auditLogs,
          ],
        }));
      },

      resetData: () => set(() => initialState()),
    }),
    {
      name: 'pulse_data_v3',
      storage: createJSONStorage(() => localStorage),
      // On rehydrate, if the seed version is stale, throw away persisted state
      // and start from fresh seeds. This avoids stale shapes after seed updates.
      migrate: (persisted: any) => {
        if (!persisted || persisted._seedVersion !== SEED_VERSION) {
          return initialState();
        }
        return persisted;
      },
      version: SEED_VERSION,
    },
  ),
);
