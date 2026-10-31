// Read-only source hashes; append-only baseline metadata, never replaces the backup.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const assert = require('assert/strict');
const root = path.resolve(__dirname, '../..');
const backup = path.join(root, 'REVIEW_BACKUP_01');
const target = path.join(backup, 'protected_sources.json');
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}
const files = ['lib', 'units'].flatMap(d => walk(path.join(__dirname, d)))
  .filter(p => !['spider.js', 'spiderKits.js'].includes(path.basename(p)));
files.push(...['build.js', 'gallery.js', 'gallery.template.html', 'gallery_view.js', 'package.json', 'package-lock.json'].map(p => path.join(__dirname, p)));
const hashes = Object.fromEntries(files.map(p => [path.relative(root, p).replace(/\\/g, '/'), crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]));
if (fs.existsSync(target)) assert.deepEqual(JSON.parse(fs.readFileSync(target, 'utf8')), hashes);
else fs.writeFileSync(target, JSON.stringify(hashes, null, 2), { flag: 'wx' });
console.log(`PASS: protected hashes recorded/confirmed for ${files.length} sources; existing ART/ART_SRC backup untouched.`);
