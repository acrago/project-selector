import { getStoredToken, isDevFakeAuth } from '../contexts/GitLabAuthContext';
import { CreateIssueParams, IssueData, ProviderResult } from '../types';

function getBaseUrl(): string {
  const url = process.env.VITE_GITLAB_BASE_URL || 'https://gitlab.cee.redhat.com';
  return url.replace(/\/+$/, '');
}

function getProjectId(): string {
  const projectPath = process.env.VITE_GITLAB_PROJECT_PATH || '';
  return encodeURIComponent(projectPath);
}

function isDev(): boolean {
  return typeof window !== 'undefined' && window.location.hostname === 'localhost';
}

async function gitlabApiRequest(
  method: string,
  endpoint: string,
  data?: any,
): Promise<any> {
  const token = getStoredToken();
  if (!token) {
    throw new Error('Not authenticated with GitLab');
  }

  if (isDev()) {
    const resp = await fetch('/api/gitlab-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, method, endpoint, data }),
    });

    if (!resp.ok) {
      const payload = await resp.json().catch(() => ({}));
      throw new Error(
        payload?.message || payload?.error || `GitLab API error (${resp.status})`,
      );
    }
    return resp.json();
  }

  const baseUrl = getBaseUrl();
  const opts: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  if (data && method !== 'GET') {
    opts.body = JSON.stringify(data);
  }

  const resp = await fetch(`${baseUrl}/api/v4${endpoint}`, opts);

  if (!resp.ok) {
    const payload = await resp.json().catch(() => ({}));
    throw new Error(
      payload?.message || payload?.error || `GitLab API error (${resp.status})`,
    );
  }

  if (resp.status === 204) return {};
  return resp.json();
}

function getLabelNames(issue: any): string[] {
  const labels = issue?.labels;
  if (!Array.isArray(labels)) return [];
  return labels
    .map((l: any) => (typeof l === 'string' ? l : l?.name || l?.title))
    .filter((n: any) => typeof n === 'string');
}

export function isGitLabConfigured(): boolean {
  const token = getStoredToken();
  return Boolean(isDevFakeAuth() || (token && process.env.VITE_GITLAB_PROJECT_PATH));
}

export async function createIssue(
  params: CreateIssueParams,
): Promise<ProviderResult<IssueData>> {
  if (!isGitLabConfigured()) return { success: false, error: 'Please sign in with GitLab' };

  if (isDevFakeAuth()) {
    return { success: true, data: { number: 999, html_url: '#' } };
  }

  const projectId = getProjectId();

  try {
    const metadata = [
      `- Route: \`${params.route}\``,
      params.version ? `- Version: \`${params.version}\`` : null,
      params.cssSelector
        ? `- Target Component: \`${params.elementDescription || 'unknown'}\``
        : null,
      params.cssSelector ? `- CSS Selector: \`${params.cssSelector}\`` : null,
      `- Fallback Position: \`(${params.xPercent.toFixed(1)}%, ${params.yPercent.toFixed(1)}%)\``,
    ]
      .filter(Boolean)
      .join('\n');

    const labels: string[] = ['prototype-comment', `route:${params.route}`];
    if (params.cssSelector && params.elementDescription) {
      labels.push(`component:${params.elementDescription}`);
    }
    labels.push(
      `coords:${Math.round(params.xPercent)},${Math.round(params.yPercent)}`,
    );
    if (params.version) labels.push(`version:${params.version}`);

    const data = await gitlabApiRequest(
      'POST',
      `/projects/${projectId}/issues`,
      {
        title: params.title,
        description: `${params.body}\n\n---\n**Metadata:**\n${metadata}`,
        labels: labels.join(','),
      },
    );

    return {
      success: true,
      data: { number: data.iid, html_url: data.web_url },
    };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to create issue' };
  }
}

export async function closeIssue(
  issueNumber: number,
): Promise<ProviderResult> {
  if (!isGitLabConfigured()) return { success: false, error: 'Please sign in with GitLab' };
  if (isDevFakeAuth()) return { success: true };
  const projectId = getProjectId();
  try {
    await gitlabApiRequest('PUT', `/projects/${projectId}/issues/${issueNumber}`, {
      state_event: 'close',
    });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to close issue' };
  }
}

export async function reopenIssue(
  issueNumber: number,
): Promise<ProviderResult> {
  if (!isGitLabConfigured()) return { success: false, error: 'Please sign in with GitLab' };
  if (isDevFakeAuth()) return { success: true };
  const projectId = getProjectId();
  try {
    await gitlabApiRequest('PUT', `/projects/${projectId}/issues/${issueNumber}`, {
      state_event: 'reopen',
    });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to reopen issue' };
  }
}


export async function deleteIssue(
  issueNumber: number,
): Promise<ProviderResult> {
  if (!isGitLabConfigured()) return { success: false, error: 'Please sign in with GitLab' };
  if (isDevFakeAuth()) return { success: true };
  const projectId = getProjectId();
  try {
    await gitlabApiRequest('DELETE', `/projects/${projectId}/issues/${issueNumber}`);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to delete issue' };
  }
}

export async function fetchAllIssues(): Promise<ProviderResult<any[]>> {
  if (!isGitLabConfigured()) return { success: false, error: 'Please sign in with GitLab' };
  if (isDevFakeAuth()) return { success: true, data: [] };
  const projectId = getProjectId();
  try {
    const data = await gitlabApiRequest(
      'GET',
      `/projects/${projectId}/issues?labels=prototype-comment&scope=all&per_page=100`,
    );

    const normalized = (Array.isArray(data) ? data : []).map((issue: any) => ({
      ...issue,
      number: issue.iid,
      body: issue.description,
      html_url: issue.web_url,
    }));

    return { success: true, data: normalized };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to fetch issues' };
  }
}

export async function fetchIssuesForRoute(
  route: string,
  version?: string,
): Promise<ProviderResult<any[]>> {
  const allResult = await fetchAllIssues();
  if (!allResult.success || !allResult.data) return allResult;

  const filtered = allResult.data
    .filter((issue: any) => {
      const body: string = issue?.body || '';
      const labels = getLabelNames(issue);
      return body.includes(`Route: \`${route}\``) || labels.includes(`route:${route}`);
    })
    .filter((issue: any) => {
      if (!version) return true;
      const labels = getLabelNames(issue);
      const body: string = issue?.body || '';
      return (
        labels.includes(`version:${version}`) ||
        body.includes(`Version: \`${version}\``)
      );
    });

  return { success: true, data: filtered };
}

export async function createComment(
  issueNumber: number,
  body: string,
): Promise<ProviderResult> {
  if (!isGitLabConfigured()) return { success: false, error: 'Please sign in with GitLab' };
  if (isDevFakeAuth()) return { success: true, data: {} };
  const projectId = getProjectId();
  try {
    const data = await gitlabApiRequest(
      'POST',
      `/projects/${projectId}/issues/${issueNumber}/notes`,
      { body },
    );
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to create comment' };
  }
}

export async function fetchIssueComments(
  issueNumber: number,
): Promise<ProviderResult<any[]>> {
  if (!isGitLabConfigured()) return { success: false, error: 'Please sign in with GitLab' };
  if (isDevFakeAuth()) return { success: true, data: [] };
  const projectId = getProjectId();
  try {
    const data = await gitlabApiRequest(
      'GET',
      `/projects/${projectId}/issues/${issueNumber}/notes?per_page=100&order_by=created_at&sort=asc`,
    );
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to fetch comments' };
  }
}

export async function deleteComment(
  issueNumber: number,
  commentId: number,
): Promise<ProviderResult> {
  if (!isGitLabConfigured()) return { success: false, error: 'Please sign in with GitLab' };
  if (isDevFakeAuth()) return { success: true };
  const projectId = getProjectId();
  try {
    await gitlabApiRequest(
      'DELETE',
      `/projects/${projectId}/issues/${issueNumber}/notes/${commentId}`,
    );
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to delete comment' };
  }
}

export async function updateComment(
  issueNumber: number,
  noteId: number,
  body: string,
): Promise<ProviderResult> {
  if (!isGitLabConfigured()) return { success: false, error: 'Please sign in with GitLab' };
  if (isDevFakeAuth()) return { success: true };
  const projectId = getProjectId();
  try {
    await gitlabApiRequest(
      'PUT',
      `/projects/${projectId}/issues/${issueNumber}/notes/${noteId}`,
      { body },
    );
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to update comment' };
  }
}
