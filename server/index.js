import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { analyzeRepository } from './analyzer.js';
import { connectDB } from './db.js';
import { Report } from './models/Report.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Storing session ID
const sessions = new Map();

function generateSessionId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// POST /auth/github 
app.post('/api/auth/github', async (req, res) => {
  const { code } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid code' });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET env vars');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  try {
    const tokenRes = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      }
    );

    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      console.error('GitHub token exchange error:', tokenData);
      return res
        .status(400)
        .json({ error: tokenData.error_description || 'Token exchange failed' });
    }

// Store token server-side and hand the client a session id
    const sessionId = generateSessionId();
    sessions.set(sessionId, {
      accessToken: tokenData.access_token,
      scope: tokenData.scope,
      createdAt: Date.now(),
    });

    return res.json({ sessionId });
  } catch (err) {
    console.error('Token exchange error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/repos 
// Returns the authenticated user's repositories.
app.get('/api/repos', async (req, res) => {
  const sessionId = req.headers['x-session-id'];

  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { accessToken } = sessions.get(sessionId);

  try {
    const repoRes = await fetch(
      'https://api.github.com/user/repos?sort=updated&per_page=100',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    if (!repoRes.ok) {
      const errText = await repoRes.text();
      console.error('GitHub API error:', errText);
      return res.status(repoRes.status).json({ error: 'GitHub API error' });
    }

    const repos = await repoRes.json();

//Return only the fields the frontend needs
    const sanitized = repos.map((r) => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      visibility: r.visibility,
      updated_at: r.updated_at,
      html_url: r.html_url,
      language: r.language,
      stargazers_count: r.stargazers_count,
      forks_count: r.forks_count,
    }));

    return res.json(sanitized);
  } catch (err) {
    console.error('Repo fetch error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

//GET /api/user
// Returns basic info about the authenticated user.
app.get('/api/user', async (req, res) => {
  const sessionId = req.headers['x-session-id'];

  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { accessToken } = sessions.get(sessionId);

  try {
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (!userRes.ok) {
      return res.status(userRes.status).json({ error: 'GitHub API error' });
    }

    const user = await userRes.json();
    return res.json({
      login: user.login,
      name: user.name,
      avatar_url: user.avatar_url,
    });
  } catch (err) {
    console.error('User fetch error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

//POST /api/analyze
app.post('/api/analyze', async (req, res) => {
  const sessionId = req.headers['x-session-id'];
  const { repoFullName } = req.body;

  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!repoFullName) {
    return res.status(400).json({ error: 'Missing repoFullName' });
  }

  const { accessToken } = sessions.get(sessionId);

  try {
    // 1. Fetch current timestamp from GitHub to check freshness
    let currentUpdate = null;
    let repoDescription = null;
    const checkRes = await fetch(`https://api.github.com/repos/${repoFullName}`, {
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      }
    });

    if (checkRes.ok) {
      const checkData = await checkRes.json();
      currentUpdate = checkData.pushed_at || checkData.updated_at;
      repoDescription = checkData.description;
    }

    // 2. Read from Cache
    const cachedReport = await Report.findOne({ repoFullName });

    if (cachedReport) {
      if (!currentUpdate || cachedReport.lastRepoUpdate === currentUpdate) {
        console.log(`[Cache Hit] Returning stored report for ${repoFullName}`);
        return res.json({ report: cachedReport.report, isCached: true });
      }
      console.log(`[Cache Invalidation] Repo updated. Re-generating for ${repoFullName}`);
    } else {
      console.log(`[Cache Miss] Generating new report for ${repoFullName}`);
    }

    // 3. Generate new report
    const reportStr = await analyzeRepository(repoFullName, accessToken);

    // 4. Save/Update Cache
    await Report.findOneAndUpdate(
      { repoFullName },
      { 
        repoFullName, 
        report: reportStr, 
        repoDescription,
        lastRepoUpdate: currentUpdate 
      },
      { upsert: true, new: true }
    ).catch(err => console.error("Could not save report to DB:", err));

    return res.json({ report: reportStr, isCached: false });
  } catch (err) {
    console.error('Analyze error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

//POST /auth/logout
app.post('/api/auth/logout', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  if (sessionId) sessions.delete(sessionId);
  return res.json({ ok: true });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
