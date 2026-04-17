import { GoogleGenAI } from '@google/genai';

export async function analyzeRepository(repoFullName, accessToken) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const ai = new GoogleGenAI({ apiKey });

  // 1. Fetch repo details for default branch
  const repoRes = await fetch(`https://api.github.com/repos/${repoFullName}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!repoRes.ok) throw new Error('Failed to fetch repo details');
  const repoData = await repoRes.json();
  const defaultBranch = repoData.default_branch;
  const description = repoData.description || 'No description';

  // 2. Fetch File tree
  const treeRes = await fetch(
    `https://api.github.com/repos/${repoFullName}/git/trees/${defaultBranch}?recursive=1`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );
  let treeText = '';
  let files = [];
  if (treeRes.ok) {
    const treeData = await treeRes.json();
    if (treeData.tree) {
      files = treeData.tree.filter(item => item.type === 'blob');
      treeText = treeData.tree.map((node) => node.path).join('\n');
    }
  }

  // Helper to fetch file content
  const fetchFile = async (path) => {
    const res = await fetch(
      `https://api.github.com/repos/${repoFullName}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.raw+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );
    if (!res.ok) return null;
    return await res.text();
  };

  // 3. Fetch README
  let readme = 'Not found';
  const readmePaths = ['README.md', 'readme.md', 'Readme.md'];
  for (const path of readmePaths) {
    const content = await fetchFile(path);
    if (content) {
      readme = content;
      break;
    }
  }

  // 4. Fetch Configs / Key Files
  const configFiles = ['package.json', 'requirements.txt', 'tsconfig.json', 'Dockerfile', 'docker-compose.yml'];
  const fetchedConfigs = {};
  for (const file of configFiles) {
    const content = await fetchFile(file);
    if (content) fetchedConfigs[file] = content;
  }

  // 5. Fetch Sample Logic Files (limit to avoid huge context)
  const codeFiles = files.filter(f =>
    f.path.match(/\.(ts|tsx|js|jsx|py|java|go|rs|c|cpp)$/) &&
    !f.path.includes('node_modules') &&
    !f.path.includes('dist') &&
    !f.path.includes('build') &&
    !f.path.includes('vendor') &&
    f.size < 50000 // Only files < 50KB to respect limits
  );

  // Sort by some heuristic, like index files first, or just take first 5
  codeFiles.sort((a, b) => {
    const aIsIndex = a.path.includes('index') || a.path.includes('main') || a.path.includes('App');
    const bIsIndex = b.path.includes('index') || b.path.includes('main') || b.path.includes('App');
    if (aIsIndex && !bIsIndex) return -1;
    if (!aIsIndex && bIsIndex) return 1;
    return 0;
  });

  const sampleFiles = codeFiles.slice(0, 5);
  const fetchedSamples = {};
  for (const file of sampleFiles) {
    const content = await fetchFile(file.path);
    if (content) fetchedSamples[file.path] = content;
  }

  // Sanitize / Trim lengths to be safe
  const truncate = (str, len = 20000) => str.length > len ? str.substring(0, len) + '...(truncated)' : str;

  // Construct prompt
  const prompt = `You are an expert software engineer and code reviewer evaluating a GitHub repository. Please generate a comprehensive, structured, and high-quality report using a clean, modern, and minimal scoring approach. Focus on insightful qualitative feedback instead of excessive scoring.
  
Repository Name: ${repoFullName}
Description: ${description}

File Structure Tree:
${truncate(treeText, 10000)}

README Content:
${truncate(readme, 15000)}

Configuration/Dependency Files:
${Object.entries(fetchedConfigs).map(([name, content]) => `--- \${name} ---\n${truncate(content, 5000)}\n`).join('\\n')}

Sample Source Code Files:
${Object.entries(fetchedSamples).map(([name, content]) => `--- \${name} ---\n${content}\n`).join('\\n')}

Output Format REQUIRED (STRICTLY Markdown):

# 🧠 Repository Analysis Report

## 🔷 Overall Score
**X / 10**

[Concise 1–2 line justification summarizing overall repository quality.]

## 🧩 Key Observations (Qualitative Analysis)

### 🏗️ Project Structure & Organization
[Clear, concise evaluation of folder structure, modularity, separation of concerns]

### 🧼 Code Quality & Best Practices
[Readability, naming, consistency, design patterns. Include short code snippets if necessary using triple backticks]

### 📚 Documentation
[README quality, completeness, clarity. Inline comments where relevant]

### 📦 Dependency Management
[Usage of dependencies, redundant or missing packages]

### ⚙️ Scalability & Maintainability
[Ease of extending the project, reusability and modular design]

### ⚡ Performance Considerations
[Inefficiencies or bottlenecks, suggested optimizations]

### 🛡️ Error Handling & Edge Cases
[Robustness and handling of unexpected inputs]

### 🔐 Security Practices
[Potential vulnerabilities or unsafe patterns]

### 🧪 Testing
[Presence/absence and quality of tests]

### 🔄 Version Control Practices
[Inferred quality from structure/files if commit data unavailable]

### 🚀 Deployment Readiness
[Presence of Dockerfile, CI/CD configs, environment setup]

### 💡 Innovation / Uniqueness
[Notable or creative aspects of the project]

## ✅ Strengths
- [Bullet points highlighting specific strong aspects. Avoid generic statements]

## ⚠️ Key Issues
- [Group related problems logically. Keep concise but specific]

## 🛠️ Action Plan (Priority-Based)
### High priority fixes
- [Actionable and clear steps]
### Medium priority improvements
- [Actionable and clear steps]
### Low priority enhancements
- [Actionable and clear steps]

## 🌱 Beginner-Friendly Guidance
[Simplified explanations for key improvements]

## 🚀 Advanced Recommendations
[Higher-level architectural or performance improvements]

Formatting Rules:
- Clean spacing and consistent headings.
- Avoid dense paragraphs.
- Use bullet points wherever possible.
- Include code snippets only when valuable.
- Maintain a professional, concise, and non-generic tone.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: prompt
  });

  return response.text;
}
