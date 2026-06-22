import { useEffect, useState } from 'react';

export interface GitLabFork {
  id: number;
  name: string;
  path: string;
  path_with_namespace: string;
  web_url: string;
  namespace: {
    id: number;
    name: string;
    path: string;
    full_path: string;
    kind: string;
    avatar_url: string | null;
  };
  pages_url?: string;
  pages_enabled?: boolean;
  // Additional metadata
  last_activity_at?: string;
  created_at?: string;
  description?: string;
  default_branch?: string;
  avatar_url?: string;
}

export interface ForkWithPages {
  id: number;
  name: string;
  owner: string;
  ownerPath: string;
  pagesUrl: string;
  repoUrl: string;
  // Additional metadata
  lastActivityAt?: Date;
  createdAt?: Date;
  description?: string;
  defaultBranch?: string;
  avatarUrl?: string;
  isMain?: boolean;
  mostRecentBranch?: string;
  mostRecentBranchUpdatedAt?: Date;
}

interface GitLabBranch {
  name: string;
  commit: {
    committed_date: string;
    id: string;
  };
}

interface UseGitLabForksResult {
  forks: ForkWithPages[];
  loading: boolean;
  error: string | null;
  currentFork: ForkWithPages | null;
}

// GitLab API configuration
const GITLAB_BASE_URL = 'https://gitlab.cee.redhat.com';
const GITLAB_API_URL = `${GITLAB_BASE_URL}/api/v4`;
const MAIN_PROJECT_PATH = 'uxd/prototypes/rhoai';

/**
 * Static fallback list of known forks with Pages deployments.
 * This is used when the GitLab API is not accessible (no token, CORS issues, etc.)
 * 
 * To add a fork to this list:
 * 1. Find the fork's GitLab project ID
 * 2. Get the owner's name and GitLab username
 * 3. Find the Pages URL from the fork's GitLab Pages settings
 * 
 * The list is ordered by owner name (main repo first).
 */
const STATIC_FORKS: ForkWithPages[] = [
  {
    id: 1,
    name: 'rhoai',
    owner: 'UXD Prototypes',
    ownerPath: 'uxd-prototypes',
    pagesUrl: 'https://uxd-prototypes-rhoai-3-4-b7c7bf.pages.redhat.com',
    repoUrl: 'https://gitlab.cee.redhat.com/uxd/prototypes/rhoai',
    isMain: true,
    defaultBranch: '3.4',
  },
  {
    id: 2,
    name: 'rhoai',
    owner: 'acrago',
    ownerPath: 'acrago',
    pagesUrl: 'https://acrago.github.io/project-selector/',
    repoUrl: 'https://gitlab.cee.redhat.com/acrago/rhoai',
    mostRecentBranch: 'project-selector',
  },
  // Add more forks here as they are discovered
];

// Fetch the most recently updated branch for a project
async function fetchMostRecentBranch(projectId: number, token: string): Promise<{ name: string; updatedAt: Date } | null> {
  try {
    const response = await fetch(
      `${GITLAB_API_URL}/projects/${projectId}/repository/branches?sort=updated_desc&per_page=1`,
      {
        headers: {
          'PRIVATE-TOKEN': token,
        },
      }
    );
    
    if (!response.ok) {
      return null;
    }
    
    const branches: GitLabBranch[] = await response.json();
    if (branches.length > 0) {
      return {
        name: branches[0].name,
        updatedAt: new Date(branches[0].commit.committed_date),
      };
    }
    return null;
  } catch {
    return null;
  }
}

// Derive Pages URL from GitLab project info
// GitLab Pages URLs for gitlab.cee.redhat.com follow the pattern:
// https://{namespace-path}-{project-path}-{hash}.pages.redhat.com
// But actually, the pages_url is usually returned by the API
function derivePagesUrl(fork: GitLabFork): string | null {
  // If GitLab provides the pages_url, use it
  if (fork.pages_url) {
    return fork.pages_url;
  }
  
  // Fallback: construct a likely Pages URL
  // GitLab Pages on gitlab.cee.redhat.com typically use this pattern
  // This is a best-guess and may need adjustment based on actual GitLab configuration
  const projectSlug = fork.path.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const namespaceSlug = fork.namespace.path.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  
  // Try common patterns - the actual pattern depends on GitLab Pages configuration
  return `https://${namespaceSlug}.pages.redhat.com/${projectSlug}`;
}

// Normalize fork list from JSON (e.g. /forks.json from CI)
function normalizeForkFromJson(entry: Record<string, unknown>): ForkWithPages {
  return {
    id: entry.id as number,
    name: entry.name as string,
    owner: entry.owner as string,
    ownerPath: entry.ownerPath as string,
    pagesUrl: entry.pagesUrl as string,
    repoUrl: entry.repoUrl as string,
    isMain: entry.isMain as boolean | undefined,
    defaultBranch: entry.defaultBranch as string | undefined,
    description: entry.description as string | undefined,
    avatarUrl: entry.avatarUrl as string | undefined,
    lastActivityAt: entry.lastActivityAt ? new Date(entry.lastActivityAt as string) : undefined,
    createdAt: entry.createdAt ? new Date(entry.createdAt as string) : undefined,
  };
}

// Detect current fork from hostname
function detectCurrentFork(forks: ForkWithPages[]): ForkWithPages | null {
  if (typeof window === 'undefined') return null;
  
  const currentHostname = window.location.hostname;
  const currentHref = window.location.href;
  
  // Check if we're on any of the fork's Pages URLs
  for (const fork of forks) {
    try {
      const forkUrl = new URL(fork.pagesUrl);
      if (currentHostname === forkUrl.hostname || currentHref.startsWith(fork.pagesUrl)) {
        return fork;
      }
    } catch {
      // Invalid URL, skip
    }
  }
  
  return null;
}

export function useGitLabForks(): UseGitLabForksResult {
  const [forks, setForks] = useState<ForkWithPages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFork, setCurrentFork] = useState<ForkWithPages | null>(null);

  useEffect(() => {
    async function fetchForks() {
      // Prefer fork list from build (CI-generated /forks.json) when available
      try {
        const res = await fetch('/forks.json');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const forksFromJson = data.map((entry: Record<string, unknown>) =>
              normalizeForkFromJson(entry)
            );
            setForks(forksFromJson);
            setCurrentFork(detectCurrentFork(forksFromJson));
            setError(null);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Ignore; fall through to token or static list
      }

      const token = process.env.GITLAB_TOKEN;
      
      // If no token is configured, use the static fallback list
      if (!token) {
        console.log('GitLab token not configured, using static fork list');
        setForks(STATIC_FORKS);
        setCurrentFork(detectCurrentFork(STATIC_FORKS));
        setError(null);
        setLoading(false);
        return;
      }

      try {
        // Encode the project path for URL
        const encodedPath = encodeURIComponent(MAIN_PROJECT_PATH);
        
        // Fetch forks from GitLab API
        const response = await fetch(
          `${GITLAB_API_URL}/projects/${encodedPath}/forks?per_page=100&statistics=false`,
          {
            headers: {
              'PRIVATE-TOKEN': token,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Invalid GitLab token');
          } else if (response.status === 404) {
            throw new Error('Project not found');
          }
          throw new Error(`GitLab API error: ${response.status}`);
        }

        const forksData: GitLabFork[] = await response.json();
        
        // Also fetch the main project to include it in the list
        const mainProjectResponse = await fetch(
          `${GITLAB_API_URL}/projects/${encodedPath}`,
          {
            headers: {
              'PRIVATE-TOKEN': token,
            },
          }
        );
        
        let mainProject: GitLabFork | null = null;
        if (mainProjectResponse.ok) {
          mainProject = await mainProjectResponse.json();
        }

        // Process forks to get Pages URLs
        const forksWithPages: ForkWithPages[] = [];
        
        // Add main project first
        if (mainProject) {
          const mainPagesUrl = derivePagesUrl(mainProject);
          if (mainPagesUrl) {
            forksWithPages.push({
              id: mainProject.id,
              name: mainProject.name,
              owner: mainProject.namespace.name,
              ownerPath: mainProject.namespace.path,
              pagesUrl: mainPagesUrl,
              repoUrl: mainProject.web_url,
              lastActivityAt: mainProject.last_activity_at ? new Date(mainProject.last_activity_at) : undefined,
              createdAt: mainProject.created_at ? new Date(mainProject.created_at) : undefined,
              description: mainProject.description || undefined,
              defaultBranch: mainProject.default_branch || undefined,
              avatarUrl: mainProject.namespace.avatar_url || mainProject.avatar_url || undefined,
              isMain: true,
            });
          }
        }
        
        // Process each fork
        for (const fork of forksData) {
          const pagesUrl = derivePagesUrl(fork);
          
          if (pagesUrl) {
            forksWithPages.push({
              id: fork.id,
              name: fork.name,
              owner: fork.namespace.name,
              ownerPath: fork.namespace.path,
              pagesUrl,
              repoUrl: fork.web_url,
              lastActivityAt: fork.last_activity_at ? new Date(fork.last_activity_at) : undefined,
              createdAt: fork.created_at ? new Date(fork.created_at) : undefined,
              description: fork.description || undefined,
              defaultBranch: fork.default_branch || undefined,
              avatarUrl: fork.namespace.avatar_url || fork.avatar_url || undefined,
              isMain: false,
            });
          }
        }
        
        // Sort alphabetically by owner name, but keep main project first
        forksWithPages.sort((a, b) => {
          if (a.isMain) return -1;
          if (b.isMain) return 1;
          return a.owner.localeCompare(b.owner);
        });

        // If we got results from API, use them; otherwise fall back to static list
        if (forksWithPages.length > 0) {
          setForks(forksWithPages);
          setCurrentFork(detectCurrentFork(forksWithPages));
          
          // Fetch most recent branches for each fork in parallel (don't block initial render)
          const branchPromises = forksWithPages.map(async (fork) => {
            const branchInfo = await fetchMostRecentBranch(fork.id, token);
            return { id: fork.id, branchInfo };
          });
          
          // Update forks with branch info as it comes in
          Promise.all(branchPromises).then((branchResults) => {
            setForks(currentForks => {
              return currentForks.map(fork => {
                const branchResult = branchResults.find(r => r.id === fork.id);
                if (branchResult?.branchInfo) {
                  return {
                    ...fork,
                    mostRecentBranch: branchResult.branchInfo.name,
                    mostRecentBranchUpdatedAt: branchResult.branchInfo.updatedAt,
                  };
                }
                return fork;
              });
            });
          });
        } else {
          console.log('No forks found from API, using static fork list');
          setForks(STATIC_FORKS);
          setCurrentFork(detectCurrentFork(STATIC_FORKS));
        }
        setError(null);
      } catch (err) {
        // On API failure, fall back to static list
        console.warn('GitLab API error, using static fork list:', err);
        setForks(STATIC_FORKS);
        setCurrentFork(detectCurrentFork(STATIC_FORKS));
        setError(null); // Don't show error to user, we have fallback
      } finally {
        setLoading(false);
      }
    }

    fetchForks();
  }, []);

  return { forks, loading, error, currentFork };
}
