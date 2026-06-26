"use client";

import { useEffect, useMemo, useState } from "react";
import ConnectedShell from "../../components/ConnectedShell";
import { useTheme } from "../../components/ThemeProvider";
import { getApiBaseUrl } from "../../lib/api";

const BLOG_IDENTITY_KEY = "fintrix-blog-identity";

export default function BlogPage() {
  const API_BASE = getApiBaseUrl();
  const { darkMode } = useTheme();
  const [postAuthor, setPostAuthor] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");

  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentBody, setCommentBody] = useState("");

  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [blogIdentity, setBlogIdentity] = useState("");

  const selectedPost = useMemo(
    () => posts.find((post) => post.id === selectedPostId) || null,
    [posts, selectedPostId]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setBlogIdentity(window.localStorage.getItem(BLOG_IDENTITY_KEY) || "");
  }, []);

  function persistIdentity(value) {
    const nextValue = value.trim();
    setBlogIdentity(nextValue);

    if (typeof window !== "undefined") {
      if (nextValue) {
        window.localStorage.setItem(BLOG_IDENTITY_KEY, nextValue);
      } else {
        window.localStorage.removeItem(BLOG_IDENTITY_KEY);
      }
    }
  }

  async function loadPosts() {
    setLoadingPosts(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/blog/posts`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to load posts");
      }
      const data = await response.json();
      const nextPosts = Array.isArray(data) ? data : [];
      setPosts(nextPosts);
      setSelectedPostId((current) => {
        if (current != null && nextPosts.some((post) => post.id === current)) {
          return current;
        }
        return null;
      });
    } catch {
      setError("Unable to load blog posts right now.");
      setPosts([]);
      setSelectedPostId(null);
    } finally {
      setLoadingPosts(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, [API_BASE]);

  useEffect(() => {
    if (selectedPostId == null) {
      return;
    }

    const exists = posts.some((post) => post.id === selectedPostId);
    if (!exists) {
      setSelectedPostId(null);
    }
  }, [posts, selectedPostId]);

  async function handleCreatePost(event) {
    event.preventDefault();
    if (!postAuthor.trim() || !postTitle.trim() || !postBody.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/blog/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: postAuthor.trim(),
          title: postTitle.trim(),
          body: postBody.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to create post");
      }

      const createdPost = await response.json();
      await loadPosts();
      setSelectedPostId(createdPost.id);
      setPostTitle("");
      setPostBody("");
    } catch {
      setError("Unable to publish this post right now.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddComment(event) {
    event.preventDefault();
    if (!selectedPost || !commentAuthor.trim() || !commentBody.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/blog/posts/${selectedPost.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: commentAuthor.trim(),
          body: commentBody.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to add comment");
      }

      await loadPosts();
      setSelectedPostId(selectedPost.id);
      setCommentAuthor("");
      setCommentBody("");
    } catch {
      setError("Unable to add this comment right now.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeletePost(postId) {
    const confirmed = window.confirm("Delete this post and all comments on it?");
    if (!confirmed) {
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/blog/posts/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Unable to delete post");
      }

      await loadPosts();
      setSelectedPostId(null);
      setCommentAuthor("");
      setCommentBody("");
    } catch {
      setError("Unable to delete this post right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ConnectedShell
      title="Blog"
      description="A community discussion space where people can post fintech topics and comment on each thread."
    >
      {error ? (
        <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-medium ${
          darkMode
            ? "border-rose-300/25 bg-rose-300/10 text-rose-100"
            : "border-rose-400/40 bg-rose-50 text-rose-700"
        }`}>
          {error}
        </div>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.95fr)]">
        <section className={`rounded-2xl border p-6 ${
          darkMode
            ? "border-white/14 bg-fintrix-dark/55 text-white/88"
            : "border-fintrix-dark/10 bg-fintrix-panel text-fintrix-ink"
        }`}>
          <div className={`border-b pb-5 ${darkMode ? "border-white/10" : "border-fintrix-dark/10"}`}>
            <div className="text-base font-semibold uppercase tracking-[0.22em] text-fintrix-accent">Community Threads</div>
            <h2 className={`mt-3 text-2xl font-semibold tracking-[-0.03em] ${darkMode ? "text-white" : "text-fintrix-ink"}`}>
              Fintech posts
            </h2>
            <p className={`mt-3 max-w-2xl text-base font-medium leading-7 ${darkMode ? "text-white/88" : "text-fintrix-ink/80"}`}>
              Click any post to open that thread and comment on it.
            </p>
          </div>

          <div className="mt-6 space-y-4 xl:max-h-[70vh] xl:overflow-y-auto xl:pr-2">
            {loadingPosts ? (
              <div className={`rounded-2xl border border-dashed p-5 text-base font-medium leading-7 ${
                darkMode
                  ? "border-white/12 bg-white/5 text-white/85"
                  : "border-fintrix-dark/10 bg-fintrix-panel text-fintrix-ink/80"
              }`}>
                Loading posts...
              </div>
            ) : posts.length ? (
              posts.map((post) => {
                const isActive = post.id === selectedPostId;
                const canDeletePost = blogIdentity.trim() && blogIdentity.trim().toLowerCase() === post.author.trim().toLowerCase();
                return (
                  <div
                    key={post.id}
                    className={`w-full rounded-2xl border p-5 text-left transition-all duration-300 ${
                      isActive
                        ? darkMode
                          ? "border-fintrix-accent bg-white/12 shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
                          : "border-fintrix-accent bg-fintrix-panel shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
                        : darkMode
                          ? "border-white/10 bg-white/5 hover:bg-white/10"
                          : "border-fintrix-dark/10 bg-white hover:bg-cyan-50/80"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedPostId(post.id)}
                        className={`text-base font-semibold ${darkMode ? "text-white" : "text-fintrix-ink"}`}
                      >
                        {post.author}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPostId(post.id)}
                        className={`rounded-full border px-3 py-1 text-base transition-colors ${
                          darkMode
                            ? "border-white/10 bg-white/10 text-white/85"
                            : "border-fintrix-dark/10 bg-white text-fintrix-ink/80"
                        }`}
                      >
                        {post.comments.length} comment{post.comments.length === 1 ? "" : "s"}
                      </button>
                      {canDeletePost ? (
                        <button
                          type="button"
                          onClick={() => handleDeletePost(post.id)}
                          className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-all duration-300 ${
                            darkMode
                              ? "border-rose-300/25 bg-rose-300/10 text-rose-100 hover:bg-rose-300/15"
                              : "border-rose-500/35 bg-white text-rose-700 shadow-sm hover:bg-rose-50"
                          }`}
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                    <button type="button" onClick={() => setSelectedPostId(post.id)} className="w-full text-left">
                      <h3 className={`mt-3 text-xl font-semibold ${darkMode ? "text-white" : "text-fintrix-ink"}`}>{post.title}</h3>
                      <p className={`mt-3 text-base font-medium leading-7 ${darkMode ? "text-white/88" : "text-fintrix-ink/80"}`}>
                        {post.body}
                      </p>
                    </button>

                    {isActive ? (
                      <div className={`mt-4 border-t pt-4 ${darkMode ? "border-white/10" : "border-fintrix-dark/10"}`}>
                        <div className="space-y-3">
                          {post.comments.length ? (
                            post.comments.map((comment) => (
                              <div
                                key={comment.id}
                                className={`rounded-2xl border p-4 ${
                                  darkMode ? "border-white/10 bg-fintrix-dark/80" : "border-fintrix-dark/10 bg-fintrix-panel"
                                }`}
                              >
                                <div className={`text-base font-semibold ${darkMode ? "text-white" : "text-fintrix-ink"}`}>{comment.author}</div>
                                <p className={`mt-2 text-base font-medium leading-6 ${darkMode ? "text-white/88" : "text-fintrix-ink/80"}`}>{comment.body}</p>
                              </div>
                            ))
                          ) : (
                            <div className={`rounded-2xl border border-dashed p-4 text-base font-medium leading-6 ${
                              darkMode
                                ? "border-white/12 bg-white/5 text-white/85"
                                : "border-fintrix-dark/10 bg-fintrix-panel text-fintrix-ink/80"
                            }`}>
                              No comments on this post yet.
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <div className={`rounded-2xl border border-dashed p-5 text-base font-medium leading-7 ${
                darkMode
                  ? "border-white/12 bg-white/5 text-white/85"
                  : "border-fintrix-dark/10 bg-fintrix-panel text-fintrix-ink/80"
              }`}>
                No posts yet. Create the first fintech discussion from the composer on the right.
              </div>
            )}
          </div>
        </section>

        <aside className={`rounded-2xl border p-5 sm:p-6 ${
          darkMode
            ? "border-white/14 bg-fintrix-dark/70 text-white/88"
            : "border-fintrix-dark/10 bg-fintrix-panel text-fintrix-ink"
        }`}>
          {selectedPost ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Comment on post</h2>
                  <p className={`mt-3 text-base font-medium leading-6 ${darkMode ? "text-white/88" : "text-fintrix-ink/80"}`}>
                    You are replying to <span className={`font-semibold ${darkMode ? "text-white" : "text-fintrix-ink"}`}>{selectedPost.title}</span>.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {blogIdentity.trim() && blogIdentity.trim().toLowerCase() === selectedPost.author.trim().toLowerCase() ? (
                    <button
                      type="button"
                      onClick={() => handleDeletePost(selectedPost.id)}
                      className={`rounded-2xl border px-4 py-2 text-base font-semibold transition-all duration-300 ${
                        darkMode
                          ? "border-rose-300/25 bg-rose-300/10 text-rose-100 hover:bg-rose-300/15"
                          : "border-rose-400/40 bg-rose-50 text-rose-700 hover:bg-rose-100"
                      }`}
                    >
                      Delete post
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPostId(null);
                      setCommentAuthor("");
                      setCommentBody("");
                    }}
                    className={`rounded-2xl border px-4 py-2 text-base font-semibold transition-all duration-300 ${
                      darkMode
                        ? "border-white/12 bg-white/8 text-white/90 hover:bg-white/12"
                        : "border-fintrix-dark/10 bg-fintrix-panel text-fintrix-ink hover:bg-fintrix-panel/80"
                    }`}
                  >
                    New post
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddComment} className="mt-5 space-y-4">
                <input
                  value={commentAuthor}
                  onChange={(event) => {
                    setCommentAuthor(event.target.value);
                    persistIdentity(event.target.value);
                  }}
                  placeholder="Your name"
                  className={`w-full rounded-2xl border p-4 text-base outline-none focus:border-fintrix-accent focus:ring-2 focus:ring-fintrix-accent/30 ${
                    darkMode
                      ? "border-white/12 bg-fintrix-dark text-white placeholder:text-white/70"
                      : "border-fintrix-dark/10 bg-white text-fintrix-ink placeholder:text-fintrix-ink/70"
                  }`}
                />
                <textarea
                  value={commentBody}
                  onChange={(event) => setCommentBody(event.target.value)}
                  placeholder="Write a comment on this post"
                  className={`min-h-[150px] w-full rounded-2xl border p-4 text-base outline-none focus:border-fintrix-accent focus:ring-2 focus:ring-fintrix-accent/30 sm:min-h-[180px] ${
                    darkMode
                      ? "border-white/12 bg-fintrix-dark text-white placeholder:text-white/70"
                      : "border-fintrix-dark/10 bg-white text-fintrix-ink placeholder:text-fintrix-ink/70"
                  }`}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-fintrix-accent px-5 py-3 text-base font-semibold text-fintrix-dark sm:w-auto"
                >
                  {submitting ? "Saving..." : "Add comment"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold">Create a post</h2>
              <p className={`mt-3 text-base font-medium leading-6 ${darkMode ? "text-white/88" : "text-fintrix-ink/80"}`}>
                Start a fintech discussion here. Once posted, it appears on the left as a clickable thread.
              </p>

              <form onSubmit={handleCreatePost} className="mt-5 space-y-4">
                <input
                  value={postAuthor}
                  onChange={(event) => {
                    setPostAuthor(event.target.value);
                    persistIdentity(event.target.value);
                  }}
                  placeholder="Your name"
                  className={`w-full rounded-2xl border p-4 text-base outline-none focus:border-fintrix-accent focus:ring-2 focus:ring-fintrix-accent/30 ${
                    darkMode
                      ? "border-white/12 bg-fintrix-dark text-white placeholder:text-white/70"
                      : "border-fintrix-dark/10 bg-white text-fintrix-ink placeholder:text-fintrix-ink/70"
                  }`}
                />
                <input
                  value={postTitle}
                  onChange={(event) => setPostTitle(event.target.value)}
                  placeholder="Post title"
                  className={`w-full rounded-2xl border p-4 text-base outline-none focus:border-fintrix-accent focus:ring-2 focus:ring-fintrix-accent/30 ${
                    darkMode
                      ? "border-white/12 bg-fintrix-dark text-white placeholder:text-white/70"
                      : "border-fintrix-dark/10 bg-white text-fintrix-ink placeholder:text-fintrix-ink/70"
                  }`}
                />
                <textarea
                  value={postBody}
                  onChange={(event) => setPostBody(event.target.value)}
                  placeholder="Write your fintech post"
                  className={`min-h-[180px] w-full rounded-2xl border p-4 text-base outline-none focus:border-fintrix-accent focus:ring-2 focus:ring-fintrix-accent/30 ${
                    darkMode
                      ? "border-white/12 bg-fintrix-dark text-white placeholder:text-white/70"
                      : "border-fintrix-dark/10 bg-white text-fintrix-ink placeholder:text-fintrix-ink/70"
                  }`}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-fintrix-accent px-5 py-3 text-base font-semibold text-fintrix-dark sm:w-auto"
                >
                  {submitting ? "Publishing..." : "Publish post"}
                </button>
              </form>
            </>
          )}
        </aside>
      </div>
    </ConnectedShell>
  );
}
