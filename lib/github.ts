interface GithubFile {
  path: string;
  type: string;
  size?: number;
}

export function parseGithubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const cleanUrl = url.trim().replace(/\.git$/, "");
    const parsed = new URL(cleanUrl);
    if (parsed.hostname !== "github.com") return null;

    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;

    return { owner: parts[0], repo: parts[1] };
  } catch {
    return null;
  }
}

async function fetchGithub(url: string, token?: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "repomap-App",
  };

  if (token && token !== "your_github_personal_access_token_here") {
    headers["Authorization"] = `token ${token}`;
  }

  const response = await fetch(url, { headers, next: { revalidate: 3600 } });
  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.statusText} (${response.status}) for URL ${url}`);
  }
  return response.json();
}

export async function getDefaultBranch(owner: string, repo: string, token?: string): Promise<string> {
  const data = await fetchGithub(`https://api.github.com/repos/${owner}/${repo}`, token);
  return data.default_branch || "main";
}

export async function fetchRepoTree(
  owner: string,
  repo: string,
  branch: string,
  token?: string
): Promise<GithubFile[]> {
  const data = await fetchGithub(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    token
  );
  if (!data.tree || !Array.isArray(data.tree)) {
    return [];
  }
  return data.tree.map((item: any) => ({
    path: item.path,
    type: item.type === "tree" ? "tree" : "file",
    size: item.size,
  }));
}

export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  token?: string
): Promise<string> {
  try {
    const data = await fetchGithub(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      token
    );
    if (data.content) {
      // GitHub contents are base64 encoded
      const cleanContent = data.content.replace(/\s/g, "");
      return Buffer.from(cleanContent, "base64").toString("utf-8");
    }
    return "";
  } catch (error) {
    console.warn(`Could not fetch file content for ${path}:`, error);
    return "";
  }
}

export async function getHighValueFiles(
  owner: string,
  repo: string,
  tree: GithubFile[],
  token?: string
): Promise<Record<string, string>> {
  // Config files of high interest
  const highValuePatterns = [
    "package.json",
    "requirements.txt",
    "dockerfile",
    "readme.md",
    "cargo.toml",
    "go.mod",
    "gemfile",
    "pyproject.toml",
  ];

  const contents: Record<string, string> = {};

  // Find files in the tree matching these patterns (case insensitive)
  const matchingFiles = tree.filter((file) => {
    if (file.type !== "file") return false;
    const name = file.path.split("/").pop()?.toLowerCase() || "";
    return highValuePatterns.includes(name);
  });

  // Limit fetches to top 6 config files to keep context payload reasonable
  const filesToFetch = matchingFiles.slice(0, 6);

  for (const file of filesToFetch) {
    const text = await fetchFileContent(owner, repo, file.path, token);
    if (text) {
      contents[file.path] = text;
    }
  }

  return contents;
}
