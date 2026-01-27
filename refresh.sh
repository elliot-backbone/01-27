#/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
# refresh.sh — Backbone V9 Refresh Protocol
# Usage: ./refresh.sh [--dry-run]

set -e
cd "$(dirname "$0")"

DRY_RUN=false
[[ "$1" == "--dry-run" ]] && DRY_RUN=true

echo "=== Backbone V9 Refresh ==="

# Step 1: Pull latest
echo "→ Pulling latest..."
git pull

# Step 2: Run QA
echo "→ Running QA..."
node smoke.js
node qa32.js

# Step 3: Regenerate instructions
echo "→ Regenerating INSTRUCTIONS.md..."
node gen-instructions.js

# Step 4: Conditional commit/push
if git diff --quiet && git diff --cached --quiet; then
  echo "✓ No changes to commit"
else
  if $DRY_RUN; then
    echo "→ Dry-run: would commit these changes:"
    git status --short
  else
    echo "→ Committing and pushing..."
    git add .
    git commit -m "Auto-save: QA passed"
    git push
    echo "✓ Pushed to origin"
  fi
fi

echo "=== Refresh complete ==="
