export interface GithubInstallUrl {
  installUrl: string;
}

export interface GithubRepoSummary {
  name: string;
  fullName: string;
  private: boolean;
  htmlUrl: string;
}

export interface ProjectGithubRepo {
  id: number;
  githubRepoUrl: string;
  githubWebhookChannelId?: number | null;
}

export interface AddProjectGithubRepoRequest {
  githubRepoUrl: string;
}

export interface SetGithubWebhookChannelRequest {
  channelId: number;
}

export interface GithubPullSummary {
  number: number;
  title: string;
  author: string;
  state: string;
  draft: boolean;
  merged: boolean;
  htmlUrl: string;
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GithubPullBoard {
  draft: GithubPullSummary[];
  inReview: GithubPullSummary[];
}

export interface GithubPull {
  number: number;
  title: string;
  body?: string | null;
  author: string;
  state: string;
  mergeable?: boolean | null;
  mergeableState: string;
  reviewDecision?: 'APPROVED' | 'CHANGES_REQUESTED' | null;
  headRef: string;
  baseRef: string;
  htmlUrl: string;
}

export interface GithubPullFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  patch?: string | null;
}
