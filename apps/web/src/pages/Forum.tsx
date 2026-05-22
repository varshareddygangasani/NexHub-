import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../stores/dataStore';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import {
  MessagesSquare,
  MessageCircle,
  Search,
  ChevronUp,
  Eye,
  CheckCircle2,
  Pencil,
  X,
  HelpCircle,
  Hash,
} from 'lucide-react';
import { SkeletonCard } from '../components/Skeleton';

export default function Forum() {
  const { forum, employees, addForumTopic, upvoteForumTopic } = useDataStore();
  const { user } = useAuthStore();
  const { showToast } = useToastStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [upvotedThreads, setUpvotedThreads] = useState<Record<string, boolean>>({});

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New-thread form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('General Q&A');
  const [newBody, setNewBody] = useState('');
  const [newTags, setNewTags] = useState('');
  const [isSubmittingThread, setIsSubmittingThread] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const employeeMap = useMemo(() => {
    return employees.reduce<Record<string, (typeof employees)[0]>>((acc, emp) => {
      acc[emp.id] = emp;
      return acc;
    }, {});
  }, [employees]);

  const categoriesList = useMemo(() => {
    const cats = new Set<string>();
    cats.add('All');
    forum.forEach((t) => cats.add(t.category));
    return Array.from(cats);
  }, [forum]);

  const filteredThreads = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return forum.filter((t) => {
      const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
      const matchesSearch =
        t.title.toLowerCase().includes(q) ||
        t.body.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [forum, selectedCategory, searchQuery]);

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newTitle.trim() || !newBody.trim()) {
      showToast('Please provide a title and body for your topic.', 'warning');
      return;
    }

    setIsSubmittingThread(true);
    await new Promise((resolve) => setTimeout(resolve, 700));

    const tagsArr = newTags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    addForumTopic({
      id: `thm-${Date.now()}`,
      title: newTitle.trim(),
      body: newBody.trim(),
      authorId: user.id,
      category: newCategory,
      tags: tagsArr.length > 0 ? tagsArr : ['Q&A'],
      createdAt: new Date().toISOString(),
      upvotes: 1,
      downvotes: 0,
      viewCount: 1,
      answers: [],
    });
    setIsSubmittingThread(false);
    setIsCreateOpen(false);

    setNewTitle('');
    setNewBody('');
    setNewTags('');

    showToast('Topic posted to the forum.', 'success');
  };

  const handleThreadUpvote = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (upvotedThreads[threadId]) {
      showToast('You already upvoted this topic.', 'warning');
      return;
    }
    upvoteForumTopic(threadId);
    setUpvotedThreads((prev) => ({ ...prev, [threadId]: true }));
    showToast('Topic upvoted.', 'success');
  };

  const handleOpenThread = (threadId: string) => {
    navigate(`/forum/${threadId}`);
  };

  return (
    <div className="flex flex-col gap-6 text-left animate-fade-in">
      {/* Title */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 section-rise">
        <div>
          <h1 className="text-[28px] md:text-[34px] font-semibold tracking-tight text-foreground">
            Forum
          </h1>
          <p className="text-[14px] text-muted-foreground mt-1 max-w-xl">
            Ask questions, share what you know, and find answers from across the company.
          </p>
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="apple-btn-primary self-start md:self-auto">
          <Pencil className="w-4 h-4" />
          New topic
        </button>
      </header>

      {/* Sticky toolbar */}
      <div className="lg:sticky lg:top-2 z-20 glass-panel p-4 flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search topics, tags, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="apple-input pl-11 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-0.5 -mx-1 px-1">
          {categoriesList.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium whitespace-nowrap transition-colors active:scale-[0.97] ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/70 text-foreground/80 hover:bg-secondary'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Topic list */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredThreads.length === 0 ? (
        <div className="glass-panel p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-secondary text-muted-foreground flex items-center justify-center">
            <HelpCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold tracking-tight text-foreground">
              No topics match
            </h3>
            <p className="text-[13.5px] text-muted-foreground max-w-sm mt-1 mx-auto">
              Try a different category or search term.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 stagger">
          {filteredThreads.map((t) => {
            const author = employeeMap[t.authorId];
            const resolved = !!t.bestAnswerId;
            const upvoted = !!upvotedThreads[t.id];

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleOpenThread(t.id)}
                className="glass-card p-5 text-left active:scale-[0.995] flex flex-col gap-3.5"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11.5px] font-medium px-2.5 py-1 rounded-full bg-apple-blue/12 text-apple-blue">
                    {t.category}
                  </span>
                  {resolved && (
                    <span className="text-[11.5px] font-medium px-2.5 py-1 rounded-full bg-apple-green/12 text-apple-green flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Solved
                    </span>
                  )}
                  <span className="text-[12px] text-muted-foreground ml-auto">
                    {new Date(t.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div>
                  <h3 className="text-[16px] font-semibold tracking-tight text-foreground">
                    {t.title}
                  </h3>
                  <p className="text-[13.5px] text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                    {t.body}
                  </p>
                </div>

                {t.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {t.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-full bg-foreground/[0.05] text-foreground/70 text-[11.5px] flex items-center gap-1"
                      >
                        <Hash className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-3.5 border-t border-border/60 flex items-center justify-between gap-4 flex-wrap">
                  {author && (
                    <div className="flex items-center gap-2">
                      <img
                        src={author.avatar}
                        alt={author.name}
                        className="w-7 h-7 rounded-full bg-secondary"
                      />
                      <span className="text-[13px] font-medium text-foreground/80">{author.name}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {t.viewCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {t.answers.length}
                    </span>
                    <span
                      onClick={(e) => handleThreadUpvote(t.id, e)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleThreadUpvote(t.id, e as unknown as React.MouseEvent);
                        }
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-colors active:scale-[0.97] cursor-pointer ${
                        upvoted
                          ? 'bg-apple-blue/12 text-apple-blue'
                          : 'bg-secondary/70 text-foreground/70 hover:bg-secondary'
                      }`}
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                      {t.upvotes}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Compose new topic */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
          <div
            onClick={() => setIsCreateOpen(false)}
            className="absolute inset-0 bg-foreground/45 backdrop-blur-md"
          />

          <aside className="apple-sheet relative z-10 w-full max-w-lg h-full overflow-hidden flex flex-col animate-slide-in">
            <div className="apple-sheet-header px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-[18px] font-semibold tracking-tight text-foreground flex items-center gap-2">
                  <MessagesSquare className="w-4.5 h-4.5 text-apple-blue" />
                  New topic
                </h2>
                <p className="text-[12.5px] text-muted-foreground mt-0.5">
                  Ask a question or start a discussion.
                </p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-foreground/[0.06] flex items-center justify-center text-muted-foreground transition-colors"
                aria-label="Close"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateThread}
              className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-foreground">Title</label>
                <input
                  type="text"
                  placeholder="What is your question?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="apple-input"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-foreground">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="apple-input appearance-none cursor-pointer"
                >
                  <option value="General Q&A">General Q&amp;A</option>
                  <option value="IT Support">IT Support</option>
                  <option value="HR Support">HR Support</option>
                  <option value="Tech Discussions">Tech Discussions</option>
                  <option value="Ideas">Ideas</option>
                  <option value="Hobbies">Hobbies</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-foreground">Details</label>
                <textarea
                  rows={6}
                  placeholder="Share context, what you've tried, and any relevant links."
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  required
                  className="apple-input resize-none leading-relaxed"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-foreground">
                  Tags <span className="text-muted-foreground font-normal">(comma separated)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. onboarding, sso, react"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="apple-input"
                />
              </div>
            </form>

            <div className="px-6 py-4 border-t border-border bg-card/60 backdrop-blur-md flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="apple-btn-ghost flex-1 border border-border/60"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateThread}
                disabled={isSubmittingThread}
                className="apple-btn-primary flex-1"
              >
                {isSubmittingThread ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Publishing
                  </>
                ) : (
                  <>Publish topic</>
                )}
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
