#!/usr/bin/env bash
set -euo pipefail

git config user.name "PFC Vercel Closeout"
git config user.email "iagorobo24@gmail.com"
git commit --allow-empty -m "chore: vercel git write probe" >/dev/null

echo "GIT_REMOTE_START"
git remote -v
echo "GIT_REMOTE_END"

git push --dry-run origin HEAD:chatgpt/pfc-hardening-20260818

mkdir -p dist
printf '%s\n' 'vercel git dry-run succeeded' > dist/index.html
