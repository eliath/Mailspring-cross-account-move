#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
package_name="$(node -p "require('${repo_dir}/package.json').name")"
package_version="$(node -p "require('${repo_dir}/package.json').version")"

cd "$repo_dir"
npm run build
node scripts/package-release.js

cd dist
zip -qr "${package_name}-${package_version}.zip" "$package_name"
echo "Created dist/${package_name}-${package_version}.zip"
