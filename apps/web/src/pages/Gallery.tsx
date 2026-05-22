import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useDataStore } from '../stores/dataStore';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import {
  Images,
  Camera,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Share2,
  Tag,
} from 'lucide-react';
import { Skeleton } from '../components/Skeleton';

export default function Gallery() {
  const { gallery, employees } = useDataStore();
  const { user } = useAuthStore();
  const { showToast } = useToastStore();

  const [loading, setLoading] = useState(true);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [downloadingUrl, setDownloadingUrl] = useState<string | null>(null);

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

  const activeAlbum = useMemo(() => {
    return gallery.find(a => a.id === selectedAlbumId);
  }, [gallery, selectedAlbumId]);

  const activePhoto = useMemo(() => {
    if (!activeAlbum || activeAlbum.images.length === 0) return null;
    return activeAlbum.images[activePhotoIdx];
  }, [activeAlbum, activePhotoIdx]);

  // Lock background scroll while the lightbox is open
  useEffect(() => {
    if (!activeAlbum || !activePhoto) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [activeAlbum, activePhoto]);

  const handleClose = useCallback(() => {
    setSelectedAlbumId(null);
  }, []);

  const handleDownload = async (url: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDownloadingUrl(url);
    await new Promise(resolve => setTimeout(resolve, 800));
    setDownloadingUrl(null);
    showToast('Photo saved to your library.', 'success');
  };

  const handleShare = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    showToast('Share link copied to clipboard.', 'success');
  };

  const handlePrev = useCallback(
    (e?: React.MouseEvent | KeyboardEvent) => {
      if (e && 'stopPropagation' in e) e.stopPropagation();
      if (!activeAlbum) return;
      setActivePhotoIdx(prev => (prev === 0 ? activeAlbum.images.length - 1 : prev - 1));
    },
    [activeAlbum]
  );

  const handleNext = useCallback(
    (e?: React.MouseEvent | KeyboardEvent) => {
      if (e && 'stopPropagation' in e) e.stopPropagation();
      if (!activeAlbum) return;
      setActivePhotoIdx(prev => (prev === activeAlbum.images.length - 1 ? 0 : prev + 1));
    },
    [activeAlbum]
  );

  // Body scroll lock + keyboard controls
  useEffect(() => {
    if (!activeAlbum) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [activeAlbum, handleClose, handlePrev, handleNext]);

  if (!user) return null;

  return (
    <div className="flex flex-col gap-8 text-left animate-fade-in">
      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-2xl bg-apple-pink/12 text-apple-pink flex items-center justify-center shrink-0">
          <Images className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h1 className="text-[26px] sm:text-[28px] font-semibold tracking-tight text-foreground">
            Culture Gallery
          </h1>
          <p className="text-[14px] text-muted-foreground mt-1 max-w-2xl">
            Moments from team events, celebrations, and milestones across the company.
          </p>
        </div>
      </header>

      {/* Albums */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="apple-card overflow-hidden">
              <Skeleton className="h-52 w-full" rounded="sm" />
              <div className="p-5 flex flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
          {gallery.map(album => (
            <button
              key={album.id}
              onClick={() => {
                setSelectedAlbumId(album.id);
                setActivePhotoIdx(0);
              }}
              className="apple-card overflow-hidden text-left group hover:-translate-y-1 hover:shadow-apple-lg transition-all duration-300 ease-apple active:scale-[0.99]"
            >
              <div className="relative h-52 overflow-hidden bg-muted">
                <img
                  src={album.cover}
                  alt={album.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40" />

                <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] font-medium tracking-tight ring-1 ring-white/20">
                  <Camera className="w-3 h-3" />
                  {album.images.length} photos
                </span>
                {album.event && (
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] font-medium tracking-tight ring-1 ring-white/20">
                    {album.event}
                  </span>
                )}
              </div>

              <div className="p-5">
                <h4 className="text-[16px] font-semibold tracking-tight text-foreground group-hover:text-apple-blue transition-colors">
                  {album.title}
                </h4>
                <p className="text-[12.5px] text-muted-foreground mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(album.date).toLocaleDateString(undefined, {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox — portalled to body so it escapes the AppShell stacking context */}
      {activeAlbum && activePhoto && createPortal(
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md text-left select-none animate-fade-in"
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${activeAlbum.title} photo viewer`}
        >
          {/* Sticky frosted header */}
          <div
            className="absolute top-0 inset-x-0 z-20 material-thick border-b border-white/10 px-5 sm:px-6 py-3.5 flex items-center justify-between gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0 flex-1">
              {activeAlbum.event && (
                <p className="text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
                  {activeAlbum.event}
                </p>
              )}
              <h3 className="text-[15px] font-semibold tracking-tight text-foreground truncate max-w-[55vw]">
                {activeAlbum.title}
              </h3>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[12.5px] font-medium text-muted-foreground tabular-nums px-2 hidden sm:inline">
                {activePhotoIdx + 1} / {activeAlbum.images.length}
              </span>

              <button
                onClick={(e) => handleDownload(activePhoto.url, e)}
                disabled={downloadingUrl === activePhoto.url}
                className="w-9 h-9 rounded-full material-regular ring-1 ring-white/15 text-foreground flex items-center justify-center transition-all hover:bg-foreground/[0.08] active:scale-[0.97]"
                title="Download photo"
                aria-label="Download photo"
              >
                {downloadingUrl === activePhoto.url ? (
                  <span className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={handleShare}
                className="w-9 h-9 rounded-full material-regular ring-1 ring-white/15 text-foreground flex items-center justify-center transition-all hover:bg-foreground/[0.08] active:scale-[0.97]"
                title="Share photo"
                aria-label="Share photo"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleClose}
                className="w-10 h-10 rounded-full material-thick ring-1 ring-white/20 text-foreground flex items-center justify-center transition-all hover:bg-apple-red/20 hover:text-apple-red active:scale-[0.97] shadow-apple"
                title="Close (Esc)"
                aria-label="Close lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Prev / Next floating mid-vertical */}
          <button
            onClick={handlePrev}
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full material-thick ring-1 ring-white/15 text-foreground flex items-center justify-center z-20 active:scale-[0.95] transition-all hover:bg-foreground/[0.08] shadow-apple"
            title="Previous (Left arrow)"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full material-thick ring-1 ring-white/15 text-foreground flex items-center justify-center z-20 active:scale-[0.95] transition-all hover:bg-foreground/[0.08] shadow-apple"
            title="Next (Right arrow)"
            aria-label="Next photo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Image stage */}
          <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-24 pt-24 pb-40">
            <img
              key={activePhoto.url}
              src={activePhoto.url}
              alt={activePhoto.caption || 'Gallery photo'}
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-apple-lg animate-scale-in"
            />
          </div>

          {/* Frosted footer bar */}
          <div
            className="absolute bottom-0 inset-x-0 z-20 material-regular border-t border-white/10 px-5 sm:px-6 py-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-6">
              <div className="min-w-0 max-w-2xl">
                <p className="text-[14px] text-foreground leading-relaxed">
                  {activePhoto.caption || 'A moment captured with the team.'}
                </p>
                <p className="text-[12px] text-muted-foreground mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  Captured on{' '}
                  {new Date(activeAlbum.date).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  <span className="sm:hidden ml-2 tabular-nums">
                    {activePhotoIdx + 1} / {activeAlbum.images.length}
                  </span>
                </p>
              </div>

              {activePhoto.taggedUserIds && activePhoto.taggedUserIds.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Tagged
                  </span>

                  <div className="flex gap-1.5 flex-wrap">
                    {activePhoto.taggedUserIds.map(id => {
                      const emp = employeeMap[id];
                      if (!emp) return null;
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-foreground/[0.08] text-foreground text-[11px] ring-1 ring-border/60"
                          title={emp.jobTitle}
                        >
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span className="font-medium">{emp.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
