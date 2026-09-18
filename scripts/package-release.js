const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const manifest = require(path.join(root, 'package.json'));
const lockfile = require(path.join(root, 'package-lock.json'));
const dist = path.join(root, 'dist');
const release = path.join(dist, manifest.name);

fs.rmSync(dist, { force: true, recursive: true });
fs.mkdirSync(release, { recursive: true });

for (const name of ['README.md', 'package.json', 'lib', 'styles']) {
  fs.cpSync(path.join(root, name), path.join(release, name), { recursive: true });
}

for (const [name, metadata] of Object.entries(lockfile.packages)) {
  if (!name.startsWith('node_modules/') || metadata.dev) continue;
  fs.cpSync(path.join(root, name), path.join(release, name), { recursive: true });
}

require.resolve('imapflow', { paths: [release] });
console.log(`Created dist/${manifest.name}/`);
