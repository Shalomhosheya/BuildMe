import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Youtube, Play, ExternalLink, Loader2, ChevronDown } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface YTVideo {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  publishedAt: string;
}

type Skill = 'reading' | 'writing' | 'listening' | 'speaking';

// ─── Constants ────────────────────────────────────────────────────────────────

const SKILLS: { key: Skill; label: string; color: string; bg: string; query: string }[] = [
  { key: 'reading',   label: 'Reading',   color: '#7C3AED', bg: '#EDE9FE', query: 'IELTS reading tips strategies' },
  { key: 'writing',   label: 'Writing',   color: '#0369A1', bg: '#E0F2FE', query: 'IELTS writing task 1 task 2 tips' },
  { key: 'listening', label: 'Listening', color: '#065F46', bg: '#D1FAE5', query: 'IELTS listening practice tips' },
  { key: 'speaking',  label: 'Speaking',  color: '#9A3412', bg: '#FFEDD5', query: 'IELTS speaking band 9 tips' },
];

// Get API key from environment variables (Vite)
const YOUTUBE_API_KEY = "AIzaSyAKPuvRvz-1Pq8qJIlOecUIZFXYGu1Sv1k";

// ─── YouTube API helper ────────────────────────────────────────────────────────

async function searchYouTube(query: string, pageToken?: string): Promise<{ videos: YTVideo[]; nextPageToken?: string }> {
  if (!YOUTUBE_API_KEY) {
    return { videos: [] };
  }

  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults: '12',
    relevanceLanguage: 'en',
    key: YOUTUBE_API_KEY,
    ...(pageToken && { pageToken }),
  });

  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);

  if (!res.ok) {
    throw new Error(`YouTube API error: ${res.status}`);
  }

  const data = await res.json();

  const videos: YTVideo[] = (data.items ?? []).map((item: any) => ({
    id:          item.id.videoId,
    title:       item.snippet.title,
    channel:     item.snippet.channelTitle,
    thumbnail:   item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
    publishedAt: item.snippet.publishedAt,
  }));

  return { 
    videos, 
    nextPageToken: data.nextPageToken 
  };
}

// Format relative date
function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);

  if (days < 1) return 'Today';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function VideoCard({ video, onPlay }: { video: YTVideo; onPlay: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onPlay(video.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        cursor: 'pointer',
        transition: 'transform 0.18s, box-shadow 0.18s',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.10)' : '0 1px 4px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000', overflow: 'hidden' }}>
        <img
          src={video.thumbnail}
          alt={video.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.2s',
            opacity: hovered ? 0.85 : 1,
          }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.2s',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'rgba(168,85,247,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(168,85,247,0.4)',
          }}>
            <Play size={20} fill="white" color="white" style={{ marginLeft: 3 }} />
          </div>
        </div>
      </div>

      <div style={{ padding: '10px 12px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{
          fontSize: 13, fontWeight: 500, color: 'var(--text-primary)',
          lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {video.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500 }}>
            {video.channel}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
            {relativeDate(video.publishedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

function VideoModal({ videoId, onClose }: { videoId: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 860,
          borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          background: '#000',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 12, right: 12, zIndex: 10,
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff', backdropFilter: 'blur(4px)',
          }}
        >
          <X size={16} />
        </button>

        <div style={{ aspectRatio: '16/9' }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title="IELTS video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>

        <div style={{ padding: '10px 14px', background: '#111', display: 'flex', justifyContent: 'flex-end' }}>
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#aaa', textDecoration: 'none' }}
          >
            <ExternalLink size={12} /> Open on YouTube
          </a>
        </div>
      </div>
    </div>
  );
}

function NoApiBanner({ query }: { query: string }) {
  const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 14, padding: '60px 24px', textAlign: 'center',
    }}>
      <Youtube size={48} color="#FF0000" strokeWidth={1.5} />
      <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>
        YouTube API Key Not Configured
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 420, lineHeight: 1.6 }}>
        Add <code style={{ background: 'var(--gray-100)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>
          VITE_YOUTUBE_API_KEY
        </code> to your <code>.env</code> file to enable in-app video search.
      </div>
      <a
        href={ytUrl}
        target="_blank"
        rel="noreferrer"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '9px 18px', borderRadius: 8,
          background: '#FF0000', color: '#fff',
          fontSize: 13, fontWeight: 500, textDecoration: 'none',
        }}
      >
        <Youtube size={15} /> Search on YouTube
      </a>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function IELTSVideos() {
  const [activeSkill, setActiveSkill] = useState<Skill>('reading');
  const [customQuery, setCustomQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [videos, setVideos] = useState<YTVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [playingId, setPlayingId] = useState<string | null>(null);

  const noApiKey = !YOUTUBE_API_KEY;
  const debounceRef = useRef<NodeJS.Timeout>();

  const activeSkillMeta = SKILLS.find(s => s.key === activeSkill)!;

  const effectiveQuery = useCallback(() => {
    if (customQuery.trim()) return `IELTS ${customQuery.trim()}`;
    return activeSkillMeta.query;
  }, [activeSkill, customQuery]);

  const fetchVideos = useCallback(async (reset = true) => {
    if (noApiKey) return;

    setLoading(true);
    setError('');

    try {
      const token = reset ? undefined : nextPageToken;
      const result = await searchYouTube(effectiveQuery(), token);

      setVideos(prev => reset ? result.videos : [...prev, ...result.videos]);
      setNextPageToken(result.nextPageToken);
    } catch (err) {
      console.error(err);
      setError('Failed to load videos. Please check your API key and internet connection.');
    } finally {
      setLoading(false);
    }
  }, [effectiveQuery, nextPageToken, noApiKey]);

  // Fetch when skill changes (only if no custom query)
  useEffect(() => {
    if (!customQuery.trim()) {
      fetchVideos(true);
    }
  }, [activeSkill, fetchVideos, customQuery]);

  // Debounced custom search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (customQuery.trim()) {
        fetchVideos(true);
      }
    }, 600);

    return () => clearTimeout(debounceRef.current);
  }, [customQuery, fetchVideos]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomQuery(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput('');
    setCustomQuery('');
  };

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Youtube size={22} color="#FF0000" strokeWidth={1.5} />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            IELTS Videos
          </h1>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          Curated YouTube lessons for all IELTS skills
        </p>
      </div>

      {/* Skill Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {SKILLS.map(skill => {
          const isActive = activeSkill === skill.key && !customQuery.trim();
          return (
            <button
              key={skill.key}
              onClick={() => {
                setActiveSkill(skill.key);
                clearSearch();
              }}
              style={{
                padding: '7px 18px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                border: '1.5px solid',
                borderColor: isActive ? skill.color : 'var(--border)',
                background: isActive ? skill.bg : 'var(--surface)',
                color: isActive ? skill.color : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}
            >
              {skill.label}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: 28, position: 'relative', maxWidth: 520 }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          border: '1.5px solid var(--border)',
          borderRadius: 10,
          background: 'var(--surface)',
          overflow: 'hidden',
        }}>
          <Search size={15} style={{ marginLeft: 14, color: 'var(--text-tertiary)', flexShrink: 0 }} />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder={`Search IELTS ${activeSkillMeta.label.toLowerCase()} videos...`}
            style={{
              flex: 1,
              padding: '10px 12px',
              fontSize: 13,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
            }}
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              style={{
                padding: '0 12px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-tertiary)',
              }}
            >
              <X size={14} />
            </button>
          )}
          <button
            type="submit"
            style={{
              padding: '0 20px',
              height: 40,
              background: 'var(--purple)',
              border: 'none',
              cursor: 'pointer',
              color: '#fff',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Search
          </button>
        </div>
      </form>

      {noApiKey && <NoApiBanner query={effectiveQuery()} />}

      {error && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 8,
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          color: '#991B1B',
          fontSize: 13,
          marginBottom: 20,
        }}>
          {error}
        </div>
      )}

      {/* Video Grid */}
      {!noApiKey && (
        <>
          {loading && videos.length === 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface)' }}>
                  <div style={{ aspectRatio: '16/9', background: 'var(--gray-100)', animation: 'pulse 1.4s infinite' }} />
                  <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ height: 14, background: 'var(--gray-100)', borderRadius: 6, animation: 'pulse 1.4s infinite' }} />
                    <div style={{ height: 14, background: 'var(--gray-100)', borderRadius: 6, width: '75%', animation: 'pulse 1.4s infinite' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {videos.length > 0 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18 }}>
                {videos.map(video => (
                  <VideoCard key={video.id} video={video} onPlay={setPlayingId} />
                ))}
              </div>

              {nextPageToken && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
                  <button
                    onClick={() => fetchVideos(false)}
                    disabled={loading}
                    style={{
                      padding: '10px 28px',
                      borderRadius: 20,
                      border: '1.5px solid var(--border)',
                      background: 'var(--surface)',
                      color: 'var(--text-secondary)',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    {loading ? (
                      <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Loading...</>
                    ) : (
                      <><ChevronDown size={14} /> Load more</>
                    )}
                  </button>
                </div>
              )}
            </>
          )}

          {!loading && videos.length === 0 && !error && (
            <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-tertiary)' }}>
              <Youtube size={42} strokeWidth={1.2} style={{ marginBottom: 16, opacity: 0.4 }} />
              <div>No videos found. Try a different search term.</div>
            </div>
          )}
        </>
      )}

      {playingId && <VideoModal videoId={playingId} onClose={() => setPlayingId(null)} />}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}