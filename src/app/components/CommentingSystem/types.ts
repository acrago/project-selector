export interface Comment {
  id: string;
  author?: string;
  text: string;
  createdAt: string;
  gitlabNoteId?: number;
  parentCommentId?: string;
  parentGitLabNoteId?: number;
  issueNumber?: number;
}

export type SyncStatus = 'synced' | 'local' | 'pending' | 'syncing' | 'error';
export type ThreadStatus = 'open' | 'closed';

export interface ComponentMetadata {
  componentName?: string;
  componentType?: string;
  props?: Record<string, unknown>;
  displayName?: string;
  key?: string | number | null;
  componentPath?: string[];
}

export interface Thread {
  id: string;
  cssSelector?: string;
  elementDescription?: string;
  componentMetadata?: ComponentMetadata;
  xPercent: number;
  yPercent: number;
  route: string;
  version?: string;
  comments: Comment[];
  issueNumber?: number;
  issueUrl?: string;
  syncStatus?: SyncStatus;
  syncError?: string;
  status?: ThreadStatus;
  isTemporary?: boolean;
}

export interface CreateIssueParams {
  title: string;
  body: string;
  route: string;
  cssSelector?: string;
  elementDescription?: string;
  xPercent: number;
  yPercent: number;
  version?: string;
}

export interface IssueData {
  number: number;
  html_url: string;
}

export interface ProviderResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface GitLabUser {
  login: string;
  avatar: string;
}
