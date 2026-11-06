import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import api from '../api/axios';

const Profile = () => {
  const navigate = useNavigate();
  const { accessToken, user, logout, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState({ user: user || null, videos: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedReel, setSelectedReel] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadForm, setUploadForm] = useState({ description: '', video: null });
  const loadMoreRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentUser = profile?.user || user || null;
  const reelCount = profile?.pagination?.totalVideos ?? profile?.videos?.length ?? 0;
  const username = currentUser?.username || 'user';
  const email = currentUser?.email || 'No email';

  const fetchProfilePage = useCallback(
    async (pageNumber = 1, append = false) => {
      if (!isAuthenticated) return;

      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const response = await api.get('/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            page: pageNumber,
            limit: 9,
          },
        });

        const payload = response?.data?.data ?? response?.data ?? {};
        const nextVideos = payload.videos ?? payload.reels ?? [];

        setProfile((prevProfile) => {
          const baseUser = payload.user || prevProfile.user || user || null;
          return {
            user: baseUser,
            videos: append ? [...(prevProfile.videos || []), ...nextVideos] : nextVideos,
            pagination: payload.pagination || prevProfile.pagination || {},
          };
        });
      } catch (error) {
        console.error('Profile fetch failed:', error);
        if (!append) {
          setProfile({ user: user || null, videos: [], pagination: {} });
        }
      } finally {
        if (append) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [accessToken, isAuthenticated, user]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    fetchProfilePage(1, false);
  }, [fetchProfilePage, isAuthenticated, navigate]);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        if (loading || loadingMore || !profile?.pagination?.hasNextPage) return;

        fetchProfilePage((profile?.pagination?.page || 1) + 1, true);
      },
      { rootMargin: '200px' }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [fetchProfilePage, loading, loadingMore, profile?.pagination?.hasNextPage, profile?.pagination?.page]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const resetUploadForm = () => {
    setUploadForm({ description: '', video: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadSubmit = async (event) => {
    event.preventDefault();

    if (!uploadForm.video) {
      setUploadError('Please choose a video to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('video', uploadForm.video);

    if (uploadForm.description.trim()) {
      formData.append('description', uploadForm.description.trim());
    }

    try {
      setUploading(true);
      setUploadError('');

      await api.post('/reels/upload', formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadOpen(false);
      resetUploadForm();
      await fetchProfilePage(1, false);
    } catch (error) {
      setUploadError(error?.response?.data?.message || 'Failed to upload reel. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-4 pb-12">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-black/80 px-2 py-4 backdrop-blur-md">
          <button
            type="button"
            onClick={() => navigate('/reels')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 text-zinc-200 transition hover:bg-zinc-900"
            aria-label="Back"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18L9 12l6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <p className="text-sm font-medium tracking-wide text-zinc-200">{username}</p>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300"
          >
            Logout
          </button>
        </header>

        <main className="pt-6 sm:pt-8">
          <section className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
            <div className="flex items-center justify-center sm:ml-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 p-[2px] shadow-[0_0_30px_rgba(236,72,153,0.45)] sm:h-28 sm:w-28">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-900 text-3xl font-bold text-white sm:text-4xl">
                  {username.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-light text-zinc-100">{username}</h1>
                {/* <button
                  type="button"
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-800"
                >
                  Edit profile
                </button> */}
                {/* <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-100 transition hover:bg-zinc-800"
                  aria-label="Settings"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3v3M12 18v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M3 12h3M18 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" strokeLinecap="round" />
                  </svg>
                </button> */}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-6 text-sm text-zinc-200">
                <span>
                  <strong className="mr-1 text-base font-semibold text-white">{reelCount}</strong>
                  posts
                </span>
                {/* <span>
                  <strong className="mr-1 text-base font-semibold text-white">0</strong>
                  followers
                </span>
                <span>
                  <strong className="mr-1 text-base font-semibold text-white">0</strong>
                  following
                </span> */}
              </div>

              <div className="mt-5 text-sm text-zinc-300">
                <p className="font-semibold text-white">{username}</p>
                {/* <p className="mt-1 text-zinc-400">Capturing moments and sharing short stories through reels.</p>
                <p className="mt-2 text-zinc-400">{email}</p> */}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setUploadOpen(true)}
                  className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-pink-500/20 transition hover:brightness-110"
                >
                  + Upload reel
                </button>
              </div>
            </div>
          </section>

          <div className="mt-8 border-t border-zinc-800 pt-4">
            <div className="mb-5 flex justify-center gap-10 text-xs font-medium uppercase tracking-[0.2em] text-zinc-400 sm:text-sm">
              <button type="button" className="flex items-center gap-2 border-t border-white pt-3 text-white">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13zm2 1.5v10h12V7H6zm2 2h8v2H8V9zm0 4h6v2H8v-2z" />
                </svg>
                Reels
              </button>
            </div>

            {loading ? (
              <div className="grid gap-2 sm:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="aspect-square animate-pulse rounded-xl bg-zinc-800" />
                ))}
              </div>
            ) : profile?.videos?.length ? (
              <>
                <div className="grid gap-1 sm:gap-2 md:grid-cols-3">
                  {profile.videos.map((reel) => (
                    <button
                      key={reel._id || reel.id}
                      type="button"
                      onClick={() => setSelectedReel(reel)}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 text-left"
                    >
                      {reel.videoUrl ? (
                        <video
                          src={reel.videoUrl}
                          poster={reel.thumbnailUrl || ''}
                          muted
                          loop
                          playsInline
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-fuchsia-900 via-zinc-900 to-cyan-900 text-3xl font-bold text-white/80">
                          {username.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                      {/* <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs font-medium text-white">
                        <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5A4.5 4.5 0 0 1 6.5 4c1.74 0 3.41.81 4.5 2.09A6.05 6.05 0 0 1 15.5 4 4.5 4.5 0 0 1 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        {Number(reel.likes ?? reel.likeCount ?? 0)}
                      </div> */}
                    </button>
                  ))}
                </div>

                {loadingMore && (
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="aspect-square animate-pulse rounded-xl bg-zinc-800" />
                    ))}
                  </div>
                )}

                {!loadingMore && profile?.pagination?.hasNextPage && (
                  <div ref={loadMoreRef} className="mt-4 h-6 w-full" />
                )}
              </>
            ) : (
              <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 text-center text-zinc-400">
                <div>
                  <p className="text-lg font-medium text-zinc-200">No reels yet</p>
                  <p className="mt-1 text-sm">Upload your first reel to show it here.</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Upload reel</h2>
              
              <button
                type="button"
                onClick={() => {
                  setUploadOpen(false);
                  setUploadError('');
                  resetUploadForm();
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-lg text-zinc-200"
                aria-label="Close upload"
              >
                ×
              </button>
            </div>
              {uploadError && (
                <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {uploadError}
                </p>
              )}
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm text-zinc-300">Video file</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setUploadForm((prev) => ({ ...prev, video: file }));
                    if (file) setUploadError('');
                  }}
                  className="block w-full cursor-pointer rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 file:mr-3 file:rounded-md file:border-0 file:bg-violet-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-zinc-300">Description</span>
                <textarea
                  rows={4}
                  value={uploadForm.description}
                  onChange={(event) => setUploadForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Write something about your reel..."
                  className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
                />
              </label>

              

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUploadOpen(false);
                    setUploadError('');
                    resetUploadForm();
                  }}
                  className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-200"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={uploading}
                  className="rounded-full bg-gradient-to-r from-pink-500 to-violet-600 px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedReel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-3 py-6 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-black shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedReel(null)}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-lg text-white"
              aria-label="Close reel"
            >
              ×
            </button>

            <video
              src={selectedReel.videoUrl}
              poster={selectedReel.thumbnailUrl || ''}
              controls
              autoPlay
              playsInline
              className="h-[72vh] w-full object-cover"
            />

            <div className="space-y-2 border-t border-zinc-800 bg-zinc-950 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">@{username}</p>
              </div>
              <p className="text-sm text-zinc-300">
                {selectedReel.description || selectedReel.title || 'No description'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
