// Temporary diagnostic: rebuild with parts of pass-02 disabled and report silhouette leaks.
const { execFileSync } = require('child_process');
for (const off of (process.argv[2] || 'side,mail,pad').split(',')) {
  const env = { ...process.env, P2OFF: off };
  execFileSync('node', ['build.js'], { cwd: __dirname, env, stdio: 'ignore' });
  const out = execFileSync('node', ['diag_pass02.cjs'], { cwd: __dirname, env }).toString();
  console.log(`== OFF=${off}\n` + out.split('\n').map(l => l.slice(0, 90)).join('\n'));
}
