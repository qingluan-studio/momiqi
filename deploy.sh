#!/bin/bash
set -e

if [ -z "$GITHUB_TOKEN" ]; then
  echo "请设置 GITHUB_TOKEN 环境变量: export GITHUB_TOKEN=ghp_xxx"
  exit 1
fi

REPO="qingluan-studio/momiqi"

echo "Building..."
npm run build
cp dist/index.html dist/404.html

echo "Deploying to gh-pages..."
cd /tmp
rm -rf momiqi-pages
git config --global user.email "agent@monkeycode.ai" 2>/dev/null || true
git config --global user.name "AI Deploy" 2>/dev/null || true
git clone "https://${GITHUB_TOKEN}@github.com/${REPO}.git" momiqi-pages
cd momiqi-pages
git checkout gh-pages 2>/dev/null || git checkout --orphan gh-pages
git rm -rf . 2>/dev/null || true
cp -r "$OLDPWD/dist/"* .
git add -A
git commit -m "deploy: $(date +%Y-%m-%d-%H%M)" || echo "nothing to commit"
git push origin gh-pages

echo ""
echo "Deployed! 请前往仓库 Settings > Pages 设置 Source 为 gh-pages 分支"
echo "访问地址: https://qingluan-studio.github.io/momiqi/"
