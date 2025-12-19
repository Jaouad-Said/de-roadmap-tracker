// GitHub API Integration Utility
import { GitHubRepoData, GitHubCommit } from '@/types';

const GITHUB_API_BASE = 'https://api.github.com';
const CACHE_DURATION_MS = 1000 * 60 * 30; // 30 minutes cache

/**
 * Parse GitHub URL to extract owner and repo name
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    // Handle various GitHub URL formats
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/.*)?$/,
      /^([^\/]+)\/([^\/]+)$/, // owner/repo format
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch repository data from GitHub API
 */
export async function fetchGitHubRepo(
  githubUrl: string,
  token?: string
): Promise<GitHubRepoData | null> {
  const parsed = parseGitHubUrl(githubUrl);
  if (!parsed) return null;

  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    // Fetch repo info, languages, and recent commits in parallel
    const [repoRes, languagesRes, commitsRes] = await Promise.all([
      fetch(`${GITHUB_API_BASE}/repos/${parsed.owner}/${parsed.repo}`, { headers }),
      fetch(`${GITHUB_API_BASE}/repos/${parsed.owner}/${parsed.repo}/languages`, { headers }),
      fetch(`${GITHUB_API_BASE}/repos/${parsed.owner}/${parsed.repo}/commits?per_page=5`, { headers }),
    ]);

    if (!repoRes.ok) {
      console.error('GitHub API error:', repoRes.status, await repoRes.text());
      return null;
    }

    const repo = await repoRes.json();
    const languages = languagesRes.ok ? await languagesRes.json() : {};
    const commitsData = commitsRes.ok ? await commitsRes.json() : [];

    const recentCommits: GitHubCommit[] = Array.isArray(commitsData) 
      ? commitsData.map((c: any) => ({
          sha: c.sha?.substring(0, 7) || '',
          message: c.commit?.message?.split('\n')[0] || '', // First line only
          author: c.commit?.author?.name || c.author?.login || 'Unknown',
          date: c.commit?.author?.date || '',
          url: c.html_url || '',
        }))
      : [];

    const githubData: GitHubRepoData = {
      name: repo.name,
      description: repo.description,
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      watchers: repo.watchers_count || 0,
      language: repo.language,
      languages,
      topics: repo.topics || [],
      openIssues: repo.open_issues_count || 0,
      lastPush: repo.pushed_at,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      recentCommits,
      fetchedAt: new Date().toISOString(),
    };

    return githubData;
  } catch (error) {
    console.error('Failed to fetch GitHub repo:', error);
    return null;
  }
}

/**
 * Check if cached GitHub data is still valid
 */
export function isGitHubDataStale(githubData: GitHubRepoData | undefined): boolean {
  if (!githubData?.fetchedAt) return true;
  
  const fetchedAt = new Date(githubData.fetchedAt).getTime();
  const now = Date.now();
  
  return (now - fetchedAt) > CACHE_DURATION_MS;
}

/**
 * Format language percentages from bytes
 */
export function formatLanguagePercentages(
  languages: Record<string, number>
): { name: string; percentage: number; color: string }[] {
  const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
  if (total === 0) return [];

  const languageColors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Python: '#3572A5',
    Java: '#b07219',
    Go: '#00ADD8',
    Rust: '#dea584',
    Ruby: '#701516',
    PHP: '#4F5D95',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    Swift: '#ffac45',
    Kotlin: '#A97BFF',
    Scala: '#c22d40',
    SQL: '#e38c00',
    Shell: '#89e051',
    HTML: '#e34c26',
    CSS: '#563d7c',
    SCSS: '#c6538c',
    Vue: '#41b883',
    Jupyter: '#DA5B0B',
    R: '#198CE7',
  };

  return Object.entries(languages)
    .map(([name, bytes]) => ({
      name,
      percentage: Math.round((bytes / total) * 100),
      color: languageColors[name] || '#6e7681',
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5); // Top 5 languages
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  
  return date.toLocaleDateString();
}
