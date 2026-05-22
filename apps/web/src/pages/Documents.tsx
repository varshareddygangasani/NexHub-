import React, { useState, useEffect, useMemo } from 'react';
import { useDataStore } from '../stores/dataStore';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import {
  Library,
  Search,
  FileText,
  FileType2,
  Link2,
  Film,
  Download,
  ThumbsUp,
  ThumbsDown,
  Lock,
} from 'lucide-react';
import { SkeletonCard } from '../components/Skeleton';

type FileTone = {
  Icon: typeof FileText;
  tileBg: string;
  tileText: string;
};

const getFileTone = (type: string): FileTone => {
  switch (type) {
    case 'doc':
      return { Icon: FileType2, tileBg: 'bg-apple-green/12', tileText: 'text-apple-green' };
    case 'link':
      return { Icon: Link2, tileBg: 'bg-apple-orange/12', tileText: 'text-apple-orange' };
    case 'video':
      return { Icon: Film, tileBg: 'bg-apple-red/12', tileText: 'text-apple-red' };
    default:
      return { Icon: FileText, tileBg: 'bg-apple-blue/12', tileText: 'text-apple-blue' };
  }
};

export default function Documents() {
  const { documents, employees } = useDataStore();
  const { user } = useAuthStore();
  const { showToast } = useToastStore();

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [localDocs, setLocalDocs] = useState<typeof documents>([]);
  const [votedDocs, setVotedDocs] = useState<Record<string, 'yes' | 'no'>>({});
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (documents.length > 0) {
      setLocalDocs(documents);
    }
  }, [documents]);

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

  const isDocVisible = (docVisibility: string) => {
    if (!user) return false;
    if (docVisibility === 'public') return true;

    if (docVisibility.startsWith('department:')) {
      const deptId = docVisibility.split(':')[1];
      return user.departmentId === deptId || user.role === 'hr' || user.role === 'admin';
    }

    if (docVisibility.startsWith('role:')) {
      const allowedRole = docVisibility.split(':')[1];
      return user.role === allowedRole || user.role === 'hr' || user.role === 'admin';
    }

    return true;
  };

  const categoriesList = useMemo(() => {
    const cats = new Set<string>();
    cats.add('All');
    localDocs.forEach(doc => {
      if (isDocVisible(doc.visibility)) {
        cats.add(doc.category);
      }
    });
    return Array.from(cats);
  }, [localDocs, user]);

  const filteredDocs = useMemo(() => {
    return localDocs.filter(doc => {
      const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        doc.title.toLowerCase().includes(q) ||
        doc.description.toLowerCase().includes(q) ||
        doc.category.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [localDocs, selectedCategory, searchQuery, user]);

  const handleDownload = async (docId: string, title: string) => {
    setDownloadingId(docId);
    await new Promise(resolve => setTimeout(resolve, 1000));

    setLocalDocs(prev => prev.map(doc => {
      if (doc.id === docId) {
        return { ...doc, downloadCount: doc.downloadCount + 1 };
      }
      return doc;
    }));

    setDownloadingId(null);
    showToast(`Downloaded: ${title}`, 'success');
  };

  const handleFeedback = (docId: string, type: 'yes' | 'no') => {
    if (votedDocs[docId]) {
      showToast('You have already provided feedback on this resource.', 'warning');
      return;
    }

    setLocalDocs(prev => prev.map(doc => {
      if (doc.id === docId) {
        return {
          ...doc,
          helpfulYes: type === 'yes' ? doc.helpfulYes + 1 : doc.helpfulYes,
          helpfulNo: type === 'no' ? doc.helpfulNo + 1 : doc.helpfulNo,
        };
      }
      return doc;
    }));

    setVotedDocs(prev => ({ ...prev, [docId]: type }));
    showToast('Thanks for your feedback.', 'success');
  };

  if (!user) return null;

  return (
    <div className="flex flex-col gap-8 text-left animate-fade-in">
      {/* Header */}
      <header className="flex flex-col gap-6 section-rise">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-apple-blue/12 text-apple-blue flex items-center justify-center shrink-0">
            <Library className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h1 className="text-[26px] sm:text-[28px] font-semibold tracking-tight text-foreground">
              Knowledge Hub
            </h1>
            <p className="text-[14px] text-muted-foreground mt-1 max-w-2xl">
              Standard operating procedures, benefits, developer manuals, and security guidelines.
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end shrink-0">
            <span className="text-[10.5px] uppercase tracking-wider text-muted-foreground">Repository</span>
            <span className="text-[14px] font-semibold text-foreground mt-0.5">
              {documents.length} files
            </span>
          </div>
        </div>

        {/* Search + Category chips */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search documents, handbooks, policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="apple-input pl-10"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar lg:max-w-[60%]">
            {categoriesList.map(cat => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium tracking-tight transition-all shrink-0 active:scale-[0.97] ${
                    active
                      ? 'bg-apple-blue/10 text-apple-blue'
                      : 'bg-foreground/[0.05] text-muted-foreground hover:bg-foreground/[0.08]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <p className="text-[14px] text-muted-foreground">
            No documents match your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
          {filteredDocs.map(doc => {
            const hasClearance = isDocVisible(doc.visibility);
            const owner = employeeMap[doc.ownerId];
            const { Icon: FileIcon, tileBg, tileText } = getFileTone(doc.type);
            const restrictedTag = doc.visibility.includes(':') ? doc.visibility.split(':')[1] : doc.visibility;

            return (
              <div
                key={doc.id}
                className={`glass-card p-6 flex flex-col gap-5 relative group ${
                  !hasClearance ? 'pointer-events-none select-none' : ''
                }`}
              >
                {/* Locked overlay */}
                {!hasClearance && (
                  <div className="absolute inset-0 z-10 rounded-2xl material-thin flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-10 h-10 rounded-full bg-apple-gray/15 text-foreground flex items-center justify-center mb-3">
                      <Lock className="w-4 h-4" />
                    </div>
                    <h4 className="text-[14px] font-semibold tracking-tight text-foreground">
                      Access restricted
                    </h4>
                    <p className="text-[12.5px] text-muted-foreground mt-1 max-w-[220px] leading-relaxed">
                      Requires the{' '}
                      <span className="font-medium text-foreground capitalize">{restrictedTag}</span>{' '}
                      role or department.
                    </p>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${tileBg} ${tileText}`}>
                    <FileIcon className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-foreground/[0.05] text-muted-foreground">
                      {doc.version}
                    </span>
                    <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-apple-blue/10 text-apple-blue">
                      {doc.category}
                    </span>
                  </div>
                </div>

                {/* Title + description */}
                <div className="flex-1">
                  <h4 className="text-[16px] font-semibold tracking-tight text-foreground group-hover:text-apple-blue transition-colors">
                    {doc.title}
                  </h4>
                  <p className="text-[13.5px] text-muted-foreground mt-1.5 leading-relaxed line-clamp-3">
                    {doc.description}
                  </p>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-border/60 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-[12px] text-muted-foreground">
                    <div className="flex items-center gap-2">
                      {owner ? (
                        <img
                          src={owner.avatar}
                          alt={owner.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-muted" />
                      )}
                      <span className="font-medium text-foreground/80">
                        {owner ? owner.name : 'Corporate Systems'}
                      </span>
                    </div>
                    <span>
                      {new Date(doc.updatedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleFeedback(doc.id, 'yes')}
                        className={`px-2.5 py-1.5 rounded-full flex items-center gap-1.5 text-[12px] font-medium transition-all active:scale-[0.97] ${
                          votedDocs[doc.id] === 'yes'
                            ? 'bg-apple-green/12 text-apple-green'
                            : 'text-muted-foreground hover:bg-foreground/[0.05]'
                        }`}
                        title="Helpful"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{doc.helpfulYes}</span>
                      </button>
                      <button
                        onClick={() => handleFeedback(doc.id, 'no')}
                        className={`px-2.5 py-1.5 rounded-full flex items-center gap-1.5 text-[12px] font-medium transition-all active:scale-[0.97] ${
                          votedDocs[doc.id] === 'no'
                            ? 'bg-apple-red/12 text-apple-red'
                            : 'text-muted-foreground hover:bg-foreground/[0.05]'
                        }`}
                        title="Not helpful"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>{doc.helpfulNo}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleDownload(doc.id, doc.title)}
                      disabled={downloadingId === doc.id}
                      className="apple-btn-primary px-4 py-1.5 text-[12.5px]"
                    >
                      {downloadingId === doc.id ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Getting</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>{doc.downloadCount}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
