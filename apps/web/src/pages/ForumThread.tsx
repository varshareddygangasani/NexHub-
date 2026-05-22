import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronUp,
  Eye,
  Hash,
  MessageCircle,
  Send,
  ThumbsUp,
} from 'lucide-react';
import { useDataStore } from '../stores/dataStore';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';

type AppleTint =
  | 'blue'
  | 'indigo'
  | 'purple'
  | 'pink'
  | 'orange'
  | 'green'
  | 'yellow'
  | 'cyan'
  | 'gray'
  | 'teal';

const getDeptTint = (deptId: string): AppleTint => {
  switch (deptId) {
    case 'dept-eng':
      return 'blue';
    case 'dept-product':
      return 'purple';
    case 'dept-design':
      return 'pink';
    case 'dept-hr':
      return 'orange';
    case 'dept-sales':
      return 'green';
    case 'dept-marketing':
      return 'yellow';
    case 'dept-finance':
      return 'cyan';
    case 'dept-operations':
      return 'gray';
    case 'dept-cs':
      return 'teal';
    case 'dept-exec':
      return 'indigo';
    default:
      return 'gray';
  }
};

const getDeptName = (deptId: string): string => {
  switch (deptId) {
    case 'dept-eng':
      return 'Engineering';
    case 'dept-product':
      return 'Product';
    case 'dept-design':
      return 'Design';
    case 'dept-hr':
      return 'People';
    case 'dept-cs':
      return 'Customer Success';
    case 'dept-sales':
      return 'Sales';
    case 'dept-marketing':
      return 'Marketing';
    case 'dept-finance':
      return 'Finance';
    case 'dept-operations':
      return 'Operations';
    case 'dept-exec':
      return 'Executive';
    default:
      return 'Corporate';
  }
};

export default function ForumThread() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    forum,
    employees,
    incrementForumTopicViews,
    upvoteForumTopic,
    addForumAnswer,
    upvoteForumAnswer,
  } = useDataStore();
  const { user } = useAuthStore();
  const { showToast } = useToastStore();

  const thread = useMemo(() => forum.find((t) => t.id === id), [forum, id]);

  const employeeMap = useMemo(
    () =>
      employees.reduce<Record<string, (typeof employees)[0]>>((acc, emp) => {
        acc[emp.id] = emp;
        return acc;
      }, {}),
    [employees],
  );

  const [hasViewed, setHasViewed] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvotedAnswers, setUpvotedAnswers] = useState<Record<string, boolean>>({});

  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Bump view count once per visit
  useEffect(() => {
    if (!id || hasViewed) return;
    incrementForumTopicViews(id);
    setHasViewed(true);
  }, [id, hasViewed, incrementForumTopicViews]);

  if (!thread) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-4 py-24 animate-fade-in">
        <div className="text-[28px] font-semibold tracking-tight text-foreground">
          Topic not found
        </div>
        <p className="text-[14px] text-muted-foreground max-w-md">
          The topic you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link to="/forum" className="apple-btn-primary mt-2">
          <ArrowLeft className="w-4 h-4" />
          Back to forum
        </Link>
      </div>
    );
  }

  const author = employeeMap[thread.authorId];

  const handleUpvote = () => {
    if (hasUpvoted) {
      showToast('You already upvoted this topic.', 'warning');
      return;
    }
    upvoteForumTopic(thread.id);
    setHasUpvoted(true);
    showToast('Topic upvoted.', 'success');
  };

  const handleAnswerUpvote = (answerId: string) => {
    if (upvotedAnswers[answerId]) return;
    upvoteForumAnswer(thread.id, answerId);
    setUpvotedAnswers((prev) => ({ ...prev, [answerId]: true }));
    showToast('Answer upvoted.', 'success');
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !replyText.trim()) return;

    setIsSubmittingReply(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    addForumAnswer(thread.id, {
      id: `ans-${Date.now()}`,
      topicId: thread.id,
      authorId: user.id,
      body: replyText.trim(),
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date().toISOString(),
    });

    setReplyText('');
    setIsSubmittingReply(false);
    showToast('Reply posted.', 'success');
  };

  const sortedAnswers = useMemo(() => {
    if (!thread.bestAnswerId) return thread.answers;
    return [...thread.answers].sort((a, b) => {
      if (a.id === thread.bestAnswerId) return -1;
      if (b.id === thread.bestAnswerId) return 1;
      return 0;
    });
  }, [thread.answers, thread.bestAnswerId]);

  return (
    <div className="flex flex-col gap-6 text-left animate-fade-in max-w-4xl">
      {/* Back button + breadcrumb */}
      <button
        onClick={() => navigate('/forum')}
        className="self-start inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        Back to forum
      </button>

      {/* Header */}
      <header className="flex flex-col gap-3 section-rise">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11.5px] font-medium px-2.5 py-1 rounded-full bg-apple-blue/12 text-apple-blue">
            {thread.category}
          </span>
          {thread.bestAnswerId && (
            <span className="text-[11.5px] font-medium px-2.5 py-1 rounded-full bg-apple-green/12 text-apple-green flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Solved
            </span>
          )}
          <span className="text-[12px] text-muted-foreground">
            {new Date(thread.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>

        <h1 className="text-[26px] md:text-[32px] font-semibold tracking-tight text-foreground leading-[1.15]">
          {thread.title}
        </h1>

        <div className="flex items-center justify-between gap-4 flex-wrap pt-1">
          {author && (
            <div className="flex items-center gap-2.5">
              <img
                src={author.avatar}
                alt={author.name}
                className="w-9 h-9 rounded-full bg-secondary"
              />
              <div>
                <div className="text-[13.5px] font-medium text-foreground">{author.name}</div>
                <div className="text-[11.5px] text-muted-foreground">
                  {getDeptName(author.departmentId)}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {thread.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" />
              {thread.answers.length}
            </span>
            <button
              onClick={handleUpvote}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors active:scale-[0.97] ${
                hasUpvoted
                  ? 'bg-apple-blue/12 text-apple-blue'
                  : 'bg-secondary/70 text-foreground/80 hover:bg-secondary'
              }`}
            >
              <ChevronUp className="w-3.5 h-3.5" />
              {thread.upvotes}
            </button>
          </div>
        </div>
      </header>

      {/* Original post */}
      <article className="glass-panel p-6">
        <p className="text-[14.5px] text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {thread.body}
        </p>

        {thread.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-5 pt-5 border-t border-border/60">
            {thread.tags.map((tag) => (
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
      </article>

      {/* Answers heading */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-[18px] font-semibold tracking-tight text-foreground">
          {thread.answers.length} {thread.answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>
      </div>

      {/* Answers */}
      {thread.answers.length === 0 ? (
        <div className="py-12 text-center text-[14px] text-muted-foreground rounded-2xl bg-secondary/60 border border-border/50">
          No answers yet. Be the first to reply below.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedAnswers.map((ans) => {
            const ansAuthor = employeeMap[ans.authorId];
            const isBest = thread.bestAnswerId === ans.id;
            const upvoted = !!upvotedAnswers[ans.id];
            const tint = ansAuthor ? getDeptTint(ansAuthor.departmentId) : 'gray';

            return (
              <div
                key={ans.id}
                className={`rounded-2xl p-5 transition-colors ${
                  isBest
                    ? 'bg-apple-green/8 border border-apple-green/30'
                    : 'glass-card'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {ansAuthor && (
                      <img
                        src={ansAuthor.avatar}
                        alt={ansAuthor.name}
                        className="w-9 h-9 rounded-full bg-secondary shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-medium text-foreground truncate">
                        {ansAuthor?.name || 'Unknown'}
                      </div>
                      <div className="text-[11.5px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        {ansAuthor && (
                          <span
                            className={`px-1.5 py-0.5 rounded-full bg-apple-${tint}/12 text-apple-${tint} text-[10.5px] font-medium`}
                          >
                            {getDeptName(ansAuthor.departmentId)}
                          </span>
                        )}
                        <span>
                          {new Date(ans.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isBest && (
                    <span className="text-[11.5px] font-medium px-2.5 py-1 rounded-full bg-apple-green/12 text-apple-green flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      Best answer
                    </span>
                  )}
                </div>

                <p className="text-[14px] text-foreground/85 leading-relaxed whitespace-pre-wrap">
                  {ans.body}
                </p>

                <div className="mt-4 pt-3 border-t border-border/60 flex justify-end">
                  <button
                    onClick={() => handleAnswerUpvote(ans.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium transition-colors active:scale-[0.97] ${
                      upvoted
                        ? 'bg-apple-blue/12 text-apple-blue'
                        : 'bg-secondary/70 text-foreground/70 hover:bg-secondary'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {ans.upvotes} helpful
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reply composer */}
      <form
        onSubmit={handleReplySubmit}
        className="apple-card p-5 flex flex-col gap-3 mt-2"
      >
        <label className="text-[13px] font-medium text-foreground">Add your reply</label>
        <textarea
          rows={4}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Share what you know, what you tried, or follow up with a question..."
          required
          className="apple-input resize-none leading-relaxed"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmittingReply || !replyText.trim()}
            className="apple-btn-primary"
          >
            {isSubmittingReply ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Posting
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Post reply
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
