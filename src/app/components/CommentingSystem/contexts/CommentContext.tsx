import * as React from 'react';
import { Comment, ComponentMetadata, Thread } from '../types';
import { useGitLabAuth } from './GitLabAuthContext';
import * as adapter from '../services/gitlabAdapter';

interface CommentContextType {
  threads: Thread[];
  commentsEnabled: boolean;
  setCommentsEnabled: (enabled: boolean) => void;
  showPinsEnabled: boolean;
  setShowPinsEnabled: (enabled: boolean) => void;
  addThread: (
    cssSelector: string,
    elementDescription: string,
    componentMetadata: ComponentMetadata | null,
    xPercent: number,
    yPercent: number,
    route: string,
    version?: string,
  ) => string;
  addReply: (threadId: string, text: string) => void;
  syncFromGitLab: (route?: string, version?: string) => Promise<void>;
  closeThread: (threadId: string) => void;
  reopenThread: (threadId: string) => void;
  removePin: (threadId: string) => void;
  deleteComment: (threadId: string, commentId: string) => void;
  updateComment: (threadId: string, commentId: string, newText: string) => void;
  addReplyToComment: (threadId: string, parentCommentId: string, text: string) => void;
  getThreadsForRoute: (route: string, version?: string) => Thread[];
  selectedThreadId: string | null;
  setSelectedThreadId: (threadId: string | null) => void;
  showClosedThreads: boolean;
  setShowClosedThreads: (enabled: boolean) => void;
  isSyncing: boolean;
  hasPendingSync: boolean;
  retrySync: () => Promise<void>;
}

const CommentContext = React.createContext<CommentContextType | undefined>(undefined);

const STORAGE_KEY = 'rhoai_comment_threads';
const COMMENTS_ENABLED_KEY = 'rhoai_comments_enabled';
const SHOW_PINS_KEY = 'rhoai_show_pins_enabled';
const SHOW_CLOSED_THREADS_KEY = 'rhoai_show_closed_threads';
const LEGACY_SHOW_RESOLVED_PINS_KEY = 'rhoai_show_resolved_pins';

const DEV_DUMMY_THREAD_ID_PREFIX = 'dev-dummy-';

/** Dummy threads for localhost so you can try Discussions and Summarize without Alt+click (e.g. on a phone/remote). */
function getDevDummyThreads(): Thread[] {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
  return [
    {
      id: 'dev-dummy-1',
      route: '/',
      elementDescription: 'Home page hero',
      xPercent: 20,
      yPercent: 25,
      comments: [
        { id: 'dev-dummy-1-c1', author: 'Designer', text: 'Should we add a secondary CTA here? Stakeholders asked for more prominence.', createdAt: twoDaysAgo },
        { id: 'dev-dummy-1-c2', author: 'Dev User', text: 'Agree. I can wire it up once we have copy.', createdAt: yesterday },
      ],
      syncStatus: 'local',
      status: 'open',
    },
    {
      id: 'dev-dummy-2',
      route: '/',
      elementDescription: 'Navigation sidebar',
      xPercent: 5,
      yPercent: 40,
      comments: [
        { id: 'dev-dummy-2-c1', author: 'Designer', text: 'Consider grouping Gen AI Studio and Develop & Train under a single section.', createdAt: twoDaysAgo },
        { id: 'dev-dummy-2-c2', author: 'PM', text: 'We discussed this in the sync – defer to 3.5.', createdAt: yesterday },
        { id: 'dev-dummy-2-c3', author: 'Designer', text: "Sounds good. I'll add a note to the backlog.", createdAt: now.toISOString() },
      ],
      syncStatus: 'local',
      status: 'open',
    },
    {
      id: 'dev-dummy-3',
      route: '/settings/api-keys',
      elementDescription: 'API Keys table',
      xPercent: 30,
      yPercent: 20,
      comments: [
        { id: 'dev-dummy-3-c1', author: 'Designer', text: 'Table density feels tight. Can we add a "compact" view option?', createdAt: yesterday },
        { id: 'dev-dummy-3-c2', author: 'Dev User', text: 'Yes – PatternFly has a compact variant we can switch to.', createdAt: now.toISOString() },
      ],
      syncStatus: 'local',
      status: 'open',
    },
  ];
}

function parseMetadataFromBody(body: string): {
  cssSelector?: string;
  elementDescription?: string;
  xPercent: number;
  yPercent: number;
} {
  let cssSelector: string | undefined;
  let elementDescription: string | undefined;
  let xPercent = 0;
  let yPercent = 0;

  const selectorMatch = body.match(/CSS Selector:\s*`([^`]+)`/i);
  if (selectorMatch) cssSelector = selectorMatch[1];

  const componentMatch = body.match(/Target Component:\s*`([^`]+)`/i);
  if (componentMatch) elementDescription = componentMatch[1];

  const posMatch =
    body.match(/Fallback Position:\s*`?\(([\d.]+)%?,\s*([\d.]+)%?\)`?/i) ||
    body.match(/Coordinates:\s*`?\(([\d.]+)%?,\s*([\d.]+)%?\)`?/i);
  if (posMatch) {
    const x = Number(posMatch[1]);
    const y = Number(posMatch[2]);
    if (!Number.isNaN(x) && !Number.isNaN(y)) {
      xPercent = x;
      yPercent = y;
    }
  }

  return { cssSelector, elementDescription, xPercent, yPercent };
}

function stripReplyMarkers(body: string): string {
  return body
    .replace(/<!--\s*hale-reply-to:\d+\s*-->\s*\n?/g, '')
    .replace(/<!--\s*hale-reply-to-local\s*-->\s*\n?/g, '')
    .trimEnd();
}

/** Parse reply marker from body; returns display text and parent GitLab note id when present. */
function parseReplyMarker(body: string): { text: string; parentGitLabNoteId?: number } {
  const replyToMatch = body.match(/<!--\s*hale-reply-to:(\d+)\s*-->\s*\n?/);
  const parentId = replyToMatch ? Number(replyToMatch[1]) : undefined;
  const text = stripReplyMarkers(body);
  return { text, parentGitLabNoteId: parentId };
}

/** Build body for a reply comment sent to GitLab (includes marker so sync can restore hierarchy). */
function buildReplyBody(text: string, parentGitLabNoteId?: number): string {
  if (parentGitLabNoteId != null) {
    return `<!-- hale-reply-to:${parentGitLabNoteId} -->\n\n${text}`;
  }
  return `<!-- hale-reply-to-local -->\n\n${text}`;
}

export const CommentProvider: React.FunctionComponent<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated } = useGitLabAuth();

  const loadThreads = (): Thread[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const [threads, setThreads] = React.useState<Thread[]>(loadThreads);
  const [commentsEnabled, setCommentsEnabled] = React.useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(COMMENTS_ENABLED_KEY);
      return raw === 'true';
    } catch {
      return false;
    }
  });
  const [showPinsEnabled, setShowPinsEnabled] = React.useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(SHOW_PINS_KEY);
      return raw !== 'false'; // default to true
    } catch {
      return true;
    }
  });
  const [showClosedThreads, setShowClosedThreads] = React.useState<boolean>(() => {
    try {
      // Backward-compatible migration from the previous preference key.
      const raw =
        localStorage.getItem(SHOW_CLOSED_THREADS_KEY) ??
        localStorage.getItem(LEGACY_SHOW_RESOLVED_PINS_KEY);
      return raw === 'true';
    } catch {
      return false;
    }
  });
  const [selectedThreadId, setSelectedThreadId] = React.useState<string | null>(null);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const threadsRef = React.useRef<Thread[]>([]);
  const syncInFlight = React.useRef<Map<string, Promise<void>>>(new Map());

  React.useEffect(() => {
    threadsRef.current = threads;
  }, [threads]);

  // On localhost, seed dummy threads once so you can try Discussions/Summarize without Alt+click (e.g. on phone/remote).
  React.useEffect(() => {
    if (typeof window === 'undefined' || window.location.hostname !== 'localhost') return;
    setThreads((prev) => {
      if (prev.some((t) => t.id.startsWith(DEV_DUMMY_THREAD_ID_PREFIX))) return prev;
      return [...getDevDummyThreads(), ...prev];
    });
  }, []);

  // Persist threads (on non-localhost, exclude dev-dummy so they never leak into production)
  React.useEffect(() => {
    try {
      const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      const toSave = threads.filter(
        (t) => !t.isTemporary && (isLocalhost || !t.id.startsWith(DEV_DUMMY_THREAD_ID_PREFIX)),
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // ignore
    }
  }, [threads]);

  // Persist preferences
  React.useEffect(() => {
    try {
      localStorage.setItem(COMMENTS_ENABLED_KEY, String(commentsEnabled));
    } catch {
      // ignore
    }
  }, [commentsEnabled]);

  React.useEffect(() => {
    try {
      localStorage.setItem(SHOW_PINS_KEY, String(showPinsEnabled));
    } catch {
      // ignore
    }
  }, [showPinsEnabled]);

  React.useEffect(() => {
    try {
      localStorage.setItem(SHOW_CLOSED_THREADS_KEY, String(showClosedThreads));
      // Remove legacy key so we only persist one source of truth going forward.
      localStorage.removeItem(LEGACY_SHOW_RESOLVED_PINS_KEY);
    } catch {
      // ignore
    }
  }, [showClosedThreads]);

  // When comment mode is on, pins must be on so pins don't disappear when toggling comments
  React.useEffect(() => {
    if (commentsEnabled) {
      setShowPinsEnabled(true);
    }
  }, [commentsEnabled]);

  const addThread = (
    cssSelector: string,
    elementDescription: string,
    componentMetadata: ComponentMetadata | null,
    xPercent: number,
    yPercent: number,
    route: string,
    version?: string,
  ): string => {
    const threadId = `thread-${Date.now()}`;
    const newThread: Thread = {
      id: threadId,
      cssSelector,
      elementDescription,
      componentMetadata: componentMetadata || undefined,
      xPercent,
      yPercent,
      route,
      version,
      comments: [],
      syncStatus: 'local',
      status: 'open',
      isTemporary: true,
    };
    setThreads((prev) => [...prev, newThread]);
    return threadId;
  };

  const addReply = (threadId: string, text: string) => {
    const author = user?.login;
    const createdAt = new Date().toISOString();
    const localCommentId = `comment-${Date.now()}`;

    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id !== threadId) return thread;
        const newComment: Comment = {
          id: localCommentId,
          author,
          text,
          createdAt,
        };
        return {
          ...thread,
          comments: [...thread.comments, newComment],
          isTemporary: undefined,
        };
      }),
    );

    if (!isAuthenticated) return;

    void syncThreadToGitLab(threadId);
  };

  /** Sync a single thread to GitLab: create issue if missing, push comments without gitlabNoteId. Used by addReply and retrySync. */
  const syncThreadToGitLab = async (threadId: string): Promise<void> => {
    const thread = threadsRef.current.find((t) => t.id === threadId);
    if (!thread) return;

    try {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId ? { ...t, syncStatus: 'syncing', syncError: undefined } : t,
        ),
      );

      let issueNumber = thread.issueNumber;
      let issueUrl = thread.issueUrl;

      if (!issueNumber) {
        const created = await adapter.createIssue({
          title: `Feedback: ${thread.route}`,
          body: `Thread created from pin${thread.elementDescription ? ` on ${thread.elementDescription}` : ''}.`,
          route: thread.route,
          cssSelector: thread.cssSelector,
          elementDescription: thread.elementDescription,
          xPercent: thread.xPercent,
          yPercent: thread.yPercent,
          version: thread.version,
        });

        if (!created.success || !created.data?.number) {
          throw new Error(created.error || 'Failed to create issue');
        }

        issueNumber = created.data.number;
        issueUrl = created.data.html_url;

        setThreads((prev) =>
          prev.map((t) =>
            t.id === threadId
              ? { ...t, issueNumber, issueUrl, syncStatus: 'syncing' }
              : t,
          ),
        );
      }

      const latest = threadsRef.current.find((t) => t.id === threadId);
      const pending = (latest?.comments || []).filter((c) => !c.gitlabNoteId);

      for (const c of pending) {
        const body = buildReplyBody(c.text, c.parentGitLabNoteId);
        const res = await adapter.createComment(issueNumber!, body);
        if (res.success && res.data?.id) {
          const noteId = res.data.id as number;
          setThreads((prev) =>
            prev.map((t) => {
              if (t.id !== threadId) return t;
              return {
                ...t,
                comments: t.comments.map((cc) =>
                  cc.id === c.id ? { ...cc, gitlabNoteId: noteId } : cc,
                ),
              };
            }),
          );
        }
      }

      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId ? { ...t, syncStatus: 'synced', syncError: undefined } : t,
        ),
      );
    } catch (e: any) {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? { ...t, syncStatus: 'error', syncError: e?.message || 'Sync failed' }
            : t,
        ),
      );
    }
  };

  const retrySync = async (): Promise<void> => {
    if (!isAuthenticated) return;

    const toRetry = threadsRef.current.filter(
      (t) => t.syncStatus === 'error' || t.syncStatus === 'pending',
    );
    if (toRetry.length === 0) return;

    setIsSyncing(true);
    try {
      for (const thread of toRetry) {
        await syncThreadToGitLab(thread.id);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const syncFromGitLab = async (route?: string, _version?: string) => {
    if (!isAuthenticated) return;

    const key = route || '__all__';
    if (syncInFlight.current.has(key)) return;

    const run = (async () => {
      setIsSyncing(true);
      try {
        const result = route
          ? await adapter.fetchIssuesForRoute(route, _version)
          : await adapter.fetchAllIssues();

        if (!result.success || !result.data) return;

        const issues = result.data;
        const glThreads: Thread[] = [];

        for (const issue of issues) {
          const issueNumber = issue?.number as number | undefined;
          const issueUrl = issue?.html_url as string | undefined;
          if (!issueNumber) continue;

          const metadata = parseMetadataFromBody(issue?.body || '');

          const commentsResult = await adapter.fetchIssueComments(issueNumber);
          const notes = commentsResult.success && commentsResult.data ? commentsResult.data : [];

          // Filter out system notes (GitLab returns system notes like "closed" events)
          const userNotes = (Array.isArray(notes) ? notes : []).filter(
            (n: any) => !n.system,
          );

          const mappedComments: Comment[] = userNotes.map((n: any) => {
            const { text, parentGitLabNoteId } = parseReplyMarker(n?.body || '');
            return {
              id: `gl-${n.id}`,
              gitlabNoteId: n.id,
              author: n?.author?.username,
              text,
              createdAt: n?.created_at || new Date().toISOString(),
              issueNumber,
              parentGitLabNoteId,
            };
          });

          // Set parentCommentId by resolving parent GitLab note id to comment id
          const idByNoteId = new Map(
            mappedComments.map((c) => [c.gitlabNoteId, c.id]),
          );
          for (const c of mappedComments) {
            if (c.parentGitLabNoteId != null) {
              const parentId = idByNoteId.get(c.parentGitLabNoteId);
              if (parentId) (c as Comment).parentCommentId = parentId;
            }
          }

          // Ensure chronological order (oldest first, like GitLab UI) regardless of API order
          mappedComments.sort(
            (a, b) =>
              (a.createdAt || '').localeCompare(b.createdAt || ''),
          );

          // Extract route from metadata or labels
          const bodyRouteMatch = (issue?.body || '').match(/Route:\s*`([^`]+)`/i);
          const labelRoute = (issue?.labels || [])
            .map((l: any) => (typeof l === 'string' ? l : l?.name))
            .find((l: string) => l?.startsWith('route:'));
          const threadRoute =
            bodyRouteMatch?.[1] || (labelRoute ? labelRoute.replace('route:', '') : '/');

          glThreads.push({
            id: `gl-${issueNumber}`,
            route: threadRoute,
            cssSelector: metadata.cssSelector,
            elementDescription: metadata.elementDescription,
            xPercent: metadata.xPercent,
            yPercent: metadata.yPercent,
            comments: mappedComments,
            issueNumber,
            issueUrl,
            syncStatus: 'synced',
            status: issue?.state === 'closed' ? 'closed' : 'open',
          });
        }

        setThreads((prev) => {
          // Keep only unsynced local drafts (no issue number). Any synced thread with an
          // issue number that is missing from GitLab is treated as deleted upstream.
          const localDrafts = prev.filter((t) => !t.issueNumber);

          if (route) {
            // Route-scoped sync: preserve all other routes unchanged, and replace this route
            // with latest GitLab state plus local drafts for this route.
            const otherRoutes = prev.filter((t) => t.route !== route);
            const routeLocalDrafts = localDrafts.filter((t) => t.route === route);
            return [...otherRoutes, ...routeLocalDrafts, ...glThreads];
          }

          return [...localDrafts, ...glThreads];
        });
      } finally {
        setIsSyncing(false);
        syncInFlight.current.delete(key);
      }
    })();

    syncInFlight.current.set(key, run);
    return run;
  };

  const syncFromGitLabRef = React.useRef(syncFromGitLab);
  syncFromGitLabRef.current = syncFromGitLab;

  // When user returns to the prototype tab, pull latest from GitLab so async comments appear
  React.useEffect(() => {
    if (!isAuthenticated) return;
    const handler = () => {
      if (document.visibilityState === 'visible') {
        syncFromGitLabRef.current().catch(() => undefined);
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [isAuthenticated]);

  const closeThread = (threadId: string) => {
    const thread = threadsRef.current.find((t) => t.id === threadId);
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, status: 'closed' as const } : t)),
    );

    if (isAuthenticated && thread?.issueNumber) {
      adapter.closeIssue(thread.issueNumber);
    }
  };

  const reopenThread = (threadId: string) => {
    const thread = threadsRef.current.find((t) => t.id === threadId);
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, status: 'open' as const } : t)),
    );

    if (isAuthenticated && thread?.issueNumber) {
      adapter.reopenIssue(thread.issueNumber);
    }
  };

  const removePin = (threadId: string) => {
    const thread = threadsRef.current.find((t) => t.id === threadId);
    setThreads((prev) => prev.filter((t) => t.id !== threadId));
    if (selectedThreadId === threadId) setSelectedThreadId(null);

    if (isAuthenticated && thread?.issueNumber) {
      adapter.deleteIssue(thread.issueNumber);
    }
  };

  const deleteComment = (threadId: string, commentId: string) => {
    const thread = threadsRef.current.find((t) => t.id === threadId);
    const comment = thread?.comments.find((c) => c.id === commentId);
    const issueNumber = thread?.issueNumber;
    const gitlabNoteId = comment?.gitlabNoteId;
    const previousComments = thread?.comments ?? [];

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId) return t;
        return {
          ...t,
          comments: t.comments.filter((c) => c.id !== commentId),
        };
      }),
    );

    if (isAuthenticated && issueNumber && gitlabNoteId) {
      adapter.deleteComment(issueNumber, gitlabNoteId).then((result) => {
        if (result.success) {
          setThreads((prev) =>
            prev.map((t) =>
              t.id === threadId ? { ...t, syncStatus: 'synced', syncError: undefined } : t,
            ),
          );
        } else {
          setThreads((prev) =>
            prev.map((t) =>
              t.id === threadId
                ? { ...t, syncStatus: 'error', syncError: result.error || 'Failed to delete comment on GitLab', comments: previousComments }
                : t,
            ),
          );
        }
      }).catch(() => {
        setThreads((prev) =>
          prev.map((t) =>
            t.id === threadId
              ? { ...t, syncStatus: 'error', syncError: 'Failed to delete comment on GitLab', comments: previousComments }
              : t,
          ),
        );
      });
    }
  };

  const updateComment = (threadId: string, commentId: string, newText: string) => {
    const thread = threadsRef.current.find((t) => t.id === threadId);
    const comment = thread?.comments.find((c) => c.id === commentId);
    const issueNumber = thread?.issueNumber;
    const gitlabNoteId = comment?.gitlabNoteId;
    const previousText = comment?.text;

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId) return t;
        return {
          ...t,
          comments: t.comments.map((c) =>
            c.id === commentId ? { ...c, text: newText } : c,
          ),
        };
      }),
    );

    if (isAuthenticated && issueNumber && gitlabNoteId) {
      adapter
        .updateComment(issueNumber, gitlabNoteId, newText)
        .then((result) => {
          if (result.success) {
            setThreads((prev) =>
              prev.map((t) =>
                t.id === threadId ? { ...t, syncStatus: 'synced', syncError: undefined } : t,
              ),
            );
          } else {
            setThreads((prev) =>
              prev.map((t) => {
                if (t.id !== threadId) return t;
                return {
                  ...t,
                  syncStatus: 'error',
                  syncError: result.error || 'Failed to update comment on GitLab',
                  comments: t.comments.map((c) =>
                    c.id === commentId && previousText !== undefined
                      ? { ...c, text: previousText }
                      : c,
                  ),
                };
              }),
            );
          }
        })
        .catch(() => {
          setThreads((prev) =>
            prev.map((t) => {
              if (t.id !== threadId) return t;
              return {
                ...t,
                syncStatus: 'error',
                syncError: 'Failed to update comment on GitLab',
                comments: t.comments.map((c) =>
                  c.id === commentId && previousText !== undefined
                    ? { ...c, text: previousText }
                    : c,
                ),
              };
            }),
          );
        });
    }
  };

  const addReplyToComment = (threadId: string, parentCommentId: string, text: string) => {
    const thread = threadsRef.current.find((t) => t.id === threadId);
    const parent = thread?.comments.find((c) => c.id === parentCommentId);
    const author = user?.login;
    const createdAt = new Date().toISOString();
    const localCommentId = `comment-${Date.now()}`;
    const newComment: Comment = {
      id: localCommentId,
      author,
      text,
      createdAt,
      parentCommentId,
      parentGitLabNoteId: parent?.gitlabNoteId,
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId) return t;
        return {
          ...t,
          comments: [...t.comments, newComment],
          isTemporary: undefined,
        };
      }),
    );

    if (!isAuthenticated) return;

    const runSync = () => {
      setTimeout(async () => {
        const latest = threadsRef.current.find((t) => t.id === threadId);
        if (!latest) return;
        let issueNumber = latest.issueNumber;
        try {
          setThreads((prev) =>
            prev.map((t) =>
              t.id === threadId ? { ...t, syncStatus: 'syncing', syncError: undefined } : t,
            ),
          );
          if (!issueNumber) {
            const created = await adapter.createIssue({
              title: `Feedback: ${latest.route}`,
              body: `Thread created from pin${latest.elementDescription ? ` on ${latest.elementDescription}` : ''}.`,
              route: latest.route,
              cssSelector: latest.cssSelector,
              elementDescription: latest.elementDescription,
              xPercent: latest.xPercent,
              yPercent: latest.yPercent,
              version: latest.version,
            });
            if (!created.success || !created.data?.number) {
              throw new Error(created.error || 'Failed to create issue');
            }
            issueNumber = created.data.number;
            const issueUrl = created.data.html_url;
            setThreads((prev) =>
              prev.map((t) =>
                t.id === threadId
                  ? { ...t, issueNumber, issueUrl, syncStatus: 'syncing' }
                  : t,
              ),
            );
          }
          const res = await adapter.createComment(
            issueNumber!,
            buildReplyBody(text, parent?.gitlabNoteId),
          );
          if (res.success && res.data?.id) {
            const noteId = res.data.id as number;
            setThreads((prev) =>
              prev.map((t) => {
                if (t.id !== threadId) return t;
                return {
                  ...t,
                  comments: t.comments.map((cc) =>
                    cc.id === localCommentId ? { ...cc, gitlabNoteId: noteId } : cc,
                  ),
                  syncStatus: 'synced',
                  syncError: undefined,
                };
              }),
            );
          }
        } catch (e: any) {
          setThreads((prev) =>
            prev.map((t) =>
              t.id === threadId
                ? { ...t, syncStatus: 'error', syncError: e?.message || 'Sync failed' }
                : t,
            ),
          );
        }
      }, 0);
    };
    runSync();
  };

  const getThreadsForRoute = (routePath: string, version?: string): Thread[] => {
    return threads.filter(
      (t) =>
        t.route === routePath && (!version || (t.version ?? '1') === version),
    );
  };

  const value: CommentContextType = {
    threads,
    commentsEnabled,
    setCommentsEnabled,
    showPinsEnabled,
    setShowPinsEnabled,
    addThread,
    addReply,
    syncFromGitLab,
    closeThread,
    reopenThread,
    removePin,
    deleteComment,
    updateComment,
    addReplyToComment,
    getThreadsForRoute,
    selectedThreadId,
    setSelectedThreadId,
    showClosedThreads,
    setShowClosedThreads,
    isSyncing,
    hasPendingSync: threads.some(
      (t) => t.syncStatus === 'pending' || t.syncStatus === 'error',
    ),
    retrySync,
  };

  return <CommentContext.Provider value={value}>{children}</CommentContext.Provider>;
};

export const useComments = (): CommentContextType => {
  const ctx = React.useContext(CommentContext);
  if (!ctx) throw new Error('useComments must be used within a CommentProvider');
  return ctx;
};
