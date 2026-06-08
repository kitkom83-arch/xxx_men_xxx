/*
  Secret scan (no ripgrep)
  - Scans source files under project root
  - Skips: node_modules, .next, .git, test-results, playwright-report, docs/x-research.md
  - Looks for secret-shaped patterns in both text source and JSON.
  - Fails if any hit is found outside allowed files.
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const SKIP_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  'test-results',
  'playwright-report',
  '.docker-tmp',
]);

const SKIP_FILES = new Set([
  path.join('docs', 'x-research.md'),
]);

function walk(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    const rel = path.relative(ROOT, full);

    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      // also skip hidden temp dirs beginning with '.'
      if (ent.name.startsWith('.') && SKIP_DIRS.size) {
        // keep .docker-tmp handled above
      }
      walk(full, fileList);
      continue;
    }

    if (!ent.isFile()) continue;

    const relNorm = rel.split(path.sep).join('/');
    if (SKIP_FILES.has(path.join(relNorm.split('/')[0] ? relNorm.split('/')[0] : '', ...relNorm.split('/').slice(1)))) {
      // unreachable for most, but keep safe
    }
    if (SKIP_FILES.has(rel.split(path.sep).join(path.sep)) || SKIP_FILES.has(relNorm)) {
      if (SKIP_FILES.has(relNorm)) continue;
      // best effort
    }

    fileList.push(full);
  }
  return fileList;
}

function isBinaryLikely(buf) {
  const len = Math.min(buf.length, 8000);
  for (let i = 0; i < len; i++) {
    const c = buf[i];
    // null bytes -> binary
    if (c === 0) return true;
  }
  return false;
}

function readTextFile(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    if (isBinaryLikely(buf)) return null;
    // limit size
    if (buf.length > 2_000_000) return null;
    return buf.toString('utf8');
  } catch {
    return null;
  }
}

// Secret-shaped patterns (tunable)
const PATTERNS = [
  {
    id: 'xox',
    // Slack-style tokens often start with xox... and include many characters
    regex: /\bxox[a-zA-Z]-[A-Za-z0-9-]{10,}\b/g,
    severity: 'high',
    hint: 'Slack token pattern (xox...)',
  },
  {
    id: 'sk-',
    // OpenAI style: sk-... plus length
    regex: /\bsk-[A-Za-z0-9]{20,}\b/g,
    severity: 'high',
    hint: 'OpenAI-style secret (sk-...)',
  },
  {
    id: 'bearer-long',
    // Bearer <token> length threshold
    regex: /\bBearer\s+([A-Za-z0-9\-_=]{30,})\b/g,
    severity: 'high',
    hint: 'Authorization Bearer token leaked',
    capture: 1,
  },
  {
    id: 'api-key-like',
    // Generic key-value assignment with likely credential values.
    // Match only when there is an explicit quoted value to reduce false positives.
    regex: /\b(api[_-]?key|apikey|apiKey|secret|token|access[_-]?token|refresh[_-]?token|client[_-]?secret|password)\b\s*[:=]\s*(['"])([A-Za-z0-9_\-]{16,})\2/gi,
    severity: 'high',
    hint: 'Key/token/secret/password hardcoded',
    capture: 3,
  },
  {
    id: 'private-key',
    regex: /-----BEGIN (?:[A-Z ]+)?PRIVATE KEY-----/g,
    severity: 'critical',
    hint: 'PEM private key block',
  },
];

function scanText(text, filePath) {
  const hits = [];

  for (const p of PATTERNS) {
    p.regex.lastIndex = 0;
    const matches = text.matchAll(p.regex);
    for (const m of matches) {
      const captured = p.capture ? m[p.capture] : m[0];
      const at = m.index ?? -1;
      // compute line
      const before = at >= 0 ? text.slice(0, at) : '';
      const line = before.split(/\r?\n/).length;
      hits.push({
        patternId: p.id,
        severity: p.severity,
        hint: p.hint,
        match: String(captured).slice(0, 120),
        line,
      });

      // Avoid runaway hits
      if (hits.length > 200) return hits;
    }
  }

  return hits;
}

function relPath(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join('/');
}

function main() {
  const allFiles = [];
  // manual walk with skipping rules
  function walk2(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      const rel = relPath(full);

      if (ent.isDirectory()) {
        if (SKIP_DIRS.has(ent.name)) continue;
        walk2(full);
        continue;
      }
      if (!ent.isFile()) continue;

      // Skip explicitly
      if (SKIP_FILES.has(rel)) continue;
      if (rel.startsWith('docs/x-research.md')) continue;

      allFiles.push(full);
    }
  }

  walk2(ROOT);

  const hitsByFile = [];

  for (const filePath of allFiles) {
    const rel = relPath(filePath);
    const text = readTextFile(filePath);
    if (text == null) continue;

    const hits = scanText(text, filePath);
    if (hits.length) {
      hitsByFile.push({ file: rel, hits });
    }
  }

  if (hitsByFile.length) {
    console.error('❌ Secret scan FAILED');
    for (const f of hitsByFile) {
      console.error(`\nFile: ${f.file}`);
      for (const h of f.hits) {
        console.error(`- [${h.severity}] ${h.patternId} @ line ${h.line}: ${h.hint} => ${h.match}`);
      }
    }
    process.exit(1);
  }

  console.log('✅ Secret scan PASSED (no secret-shaped hits found)');
}

main();

