#!/usr/bin/env bash
# Make sure `npm run verify` can actually run in a fresh session.
#
# Cloud and CI sessions start from a clean clone with no node_modules, so an
# agent's first `npm test` fails for a reason that has nothing to do with the
# code — and the usual response is to start debugging the code.
set -euo pipefail

cd "$(dirname "$0")/../.."

if [ -d node_modules ]; then
  exit 0
fi

echo "Installing dependencies so the gates can run…"
if [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund
else
  npm install --no-audit --no-fund
fi
