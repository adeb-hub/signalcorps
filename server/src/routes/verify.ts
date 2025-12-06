// src/routes/verify.routes.ts
import { Router, Request, Response } from 'express';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { Octokit } from 'octokit';
import User from '../models/User.js'; 

const router = Router();

const octokit = new Octokit({ 
  auth: process.env.GITHUB_TOKEN 
});

const ALLOWED_EXTENSIONS = [
  '.js', '.ts', '.jsx', '.tsx', '.py', '.go', '.rs', '.java', '.c', '.cpp', '.h', '.hpp', '.cs', '.php', '.rb', '.sol', '.vy', 
  '.json', '.yml', '.yaml', '.toml', '.xml', '.ini', '.env.example'
];

const IMPORTANT_FILES = [
  'Dockerfile', 'docker-compose.yml', 'Makefile', 'Gemfile', 'Procfile', 
  'CMakeLists.txt', 'package.json', 'cargo.toml', 'go.mod', 'requirements.txt',
  'hardhat.config.js', 'foundry.toml', 'next.config.js'
];

// --- HELPER: Deep Recursive Scan + Multi-File Dependency Check ---
async function getRepoDetails(owner: string, repo: string) {
  try {
    const { data: repoData } = await octokit.request('GET /repos/{owner}/{repo}', {
      owner, repo
    });
    const defaultBranch = repoData.default_branch;

    // 1. Parallel Request: Readme + File Tree
    const [readmeRes, treeRes] = await Promise.all([
      octokit.request('GET /repos/{owner}/{repo}/readme', {
        owner, repo, mediaType: { format: 'raw' }
      }).catch(() => ({ data: "No Readme" })),

      octokit.request('GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1', {
        owner, repo, branch: defaultBranch,
      }).catch(() => ({ data: { tree: [] } })) 
    ]);

    const allFiles = (treeRes.data as any).tree || [];

    // 2. NEW STRATEGY: Find ALL dependency files (limit 3 per repo)
    // This ensures we catch server/package.json AND client/package.json
    const depFiles = allFiles
        .filter((f: any) => {
            const p = f.path.toLowerCase();
            return p.endsWith('package.json') || 
                   p.endsWith('requirements.txt') || 
                   p.endsWith('cargo.toml') ||
                   p.endsWith('go.mod');
        })
        // Sort by depth (deepest might be most important in monorepos) or just take top 3
        .slice(0, 3); 

    let dependencies = "";

    if (depFiles.length > 0) {
        // Fetch content for ALL 3 files in parallel
        const depContents = await Promise.all(
            depFiles.map(async (file: any) => {
                try {
                    const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                        owner, repo, path: file.path, mediaType: { format: 'raw' }
                    });
                    // Label the file so AI knows which package.json this is
                    return `\n\n--- FILE: ${file.path} ---\n${(data as unknown as string).substring(0, 1500)}`;
                } catch (e) {
                    return "";
                }
            })
        );
        dependencies = depContents.join("");
    }

    // 3. Filter Interesting Files (Structure)
    const interestingFiles = allFiles
      .filter((f: any) => {
        if (f.type !== 'blob') return false;
        const path = f.path;
        if (path.includes('node_modules') || path.includes('.git/') || path.includes('dist/') || path.includes('build/')) return false;
        
        const filename = path.split('/').pop();
        return IMPORTANT_FILES.includes(filename) || ALLOWED_EXTENSIONS.some(ext => path.toLowerCase().endsWith(ext));
      })
      .map((f: any) => f.path)
      .slice(0, 50);

    return {
      readmeSnippet: (readmeRes.data as string).substring(0, 1500), 
      dependencySnippet: dependencies,
      files: interestingFiles 
    };
  } catch (e) {
    return { readmeSnippet: "", dependencySnippet: "", files: [] };
  }
}

// --- MAIN FETCHER (Checks all 5 repos) ---
async function getGithubData(username: string) {
  try {
    const { data: profile } = await octokit.request('GET /users/{username}', { username });
    
    // Get Top 5 Repos
    const { data: repos } = await octokit.request('GET /users/{username}/repos', {
      username, sort: 'updated', per_page: 5, 
    });

    // Deep dive into ALL 5
    const reposWithDetails = await Promise.all(
      repos.map(async (repo) => {
        const details = await getRepoDetails(username, repo.name);
        return {
          name: repo.name,
          language: repo.language || "N/A",
          description: repo.description,
          stars: repo.stargazers_count,
          files: details.files, 
          // Combine Readme + ALL dependency files found
          readme: details.readmeSnippet + details.dependencySnippet
        };
      })
    );

    return {
      username: profile.login,
      bio: profile.bio,
      repos: reposWithDetails 
    };
  } catch (error) {
    console.error("GitHub API Error:", error);
    return null;
  }
}

// --- ROUTE ---
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, bio, githubUsername, answer } = req.body;

    if (!userId || !bio || !githubUsername) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const realGithubData = await getGithubData(githubUsername);
    if (!realGithubData) return res.status(404).json({ status: 'SUS', reason: "GitHub not found.", question: "Check typos." });

    const { object: result } = await generateObject({
      model: google('gemini-flash-latest'), 
      schema: z.object({
        status: z.enum(['VERIFIED', 'SUSPICIOUS']),
        reason: z.string(),
        challenge_question: z.string(), 
      }),
      system: `
        You are 'Vibe Check'. Verify claims using code evidence from TOP 5 REPOS.
        
        INPUTS: 
        - Bio (Claim)
        - 5 Repos (Each has 'files' list and MULTIPLE 'package.json' contents in the 'readme' field).

        CRITICAL RULES:
        1. Scan ALL dependency files provided in the evidence.
           - "Docker" -> Look for Dockerfile OR 'dockerode' in any package.json.
           - "React" -> Look for 'react' in any package.json.
        2. If they lack a Dockerfile but have 'dockerode' listed in a 'server/package.json' -> VERIFIED.
        3. If evidence is found in ANY of the 5 repos -> VERIFIED.
        
        OUTPUT:
        - If SUSPICIOUS, generate a "challenge_question".
      `,
      prompt: `
        USER CLAIM: "${bio}"
        EVIDENCE: ${JSON.stringify(realGithubData, null, 2)}
        DEFENSE ANSWER: "${answer || "N/A"}"
      `
    });

    const isVerified = result.status === 'VERIFIED';
    
    await User.findOneAndUpdate(
      { clerkId: userId },
      { clerkId: userId, githubUsername, bio, isVerified: isVerified },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (isVerified) {
      return res.json({ status: 'VERIFIED' });
    } else {
      return res.json({ 
        status: 'SUS', 
        reason: result.reason, 
        question: result.challenge_question || "Explain your technical implementation."
      });
    }

  } catch (error) {
    console.error("Verification Error:", error);
    return res.status(500).json({ error: "AI Service Failed" });
  }
});

export default router;