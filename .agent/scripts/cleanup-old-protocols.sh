#!/bin/bash
# Ralph Protocol v6.0 - Old Protocol Cleanup Script
# Run this script BEFORE installing Alpha Protocol on existing projects

set -e

echo "🧹 Ralph Protocol v6.0 - Old Protocol Cleanup"
echo "=============================================="
echo ""

# Ensure we're in a git repository
if ! git rev-parse --show-toplevel > /dev/null 2>&1; then
  echo "❌ ERROR: Not a git repository"
  exit 1
fi

PROJECT_ROOT="$(git rev-parse --show-toplevel)"
cd "$PROJECT_ROOT"

echo "Project: $PROJECT_ROOT"
echo ""

# Check what exists
OLD_FILES_FOUND=false

echo "🔍 Scanning for old protocol files..."
echo ""

if [ -d ".agent" ]; then
  echo "  Found: .agent/ directory"
  OLD_FILES_FOUND=true
fi

if [ -f "docs/RALPH_PROTOCOL.md" ]; then
  echo "  Found: docs/RALPH_PROTOCOL.md"
  OLD_FILES_FOUND=true
fi

if [ -f "docs/PM_PROTOCOL.md" ]; then
  echo "  Found: docs/PM_PROTOCOL.md"
  OLD_FILES_FOUND=true
fi

if [ -f "RALPH_PROTOCOL.md" ]; then
  echo "  Found: RALPH_PROTOCOL.md (root)"
  OLD_FILES_FOUND=true
fi

if [ -f ".git/hooks/pre-commit" ]; then
  echo "  Found: .git/hooks/pre-commit"
  OLD_FILES_FOUND=true
fi

if [ -f ".git/hooks/pre-push" ]; then
  echo "  Found: .git/hooks/pre-push"
  OLD_FILES_FOUND=true
fi

if [ "$OLD_FILES_FOUND" = false ]; then
  echo "✅ No old protocol files found"
  echo "Ready for Alpha Protocol installation!"
  exit 0
fi

echo ""
echo "⚠️  Old protocol files detected"
echo ""
echo "Would you like to:"
echo "  1. Backup and remove (RECOMMENDED)"
echo "  2. Remove without backup"
echo "  3. Cancel"
echo ""
read -p "Enter choice (1/2/3): " choice

case $choice in
  1)
    echo ""
    echo "📦 Creating backup..."
    BACKUP_DIR=".protocol-backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"

    # Backup files
    [ -d ".agent" ] && cp -r .agent "$BACKUP_DIR/" && echo "  Backed up: .agent/"
    [ -f "docs/RALPH_PROTOCOL.md" ] && cp docs/RALPH_PROTOCOL.md "$BACKUP_DIR/" && echo "  Backed up: docs/RALPH_PROTOCOL.md"
    [ -f "docs/PM_PROTOCOL.md" ] && cp docs/PM_PROTOCOL.md "$BACKUP_DIR/" && echo "  Backed up: docs/PM_PROTOCOL.md"
    [ -f "docs/QA_PROTOCOL.md" ] && cp docs/QA_PROTOCOL.md "$BACKUP_DIR/" && echo "  Backed up: docs/QA_PROTOCOL.md"
    [ -f "RALPH_PROTOCOL.md" ] && cp RALPH_PROTOCOL.md "$BACKUP_DIR/" && echo "  Backed up: RALPH_PROTOCOL.md"
    [ -f ".git/hooks/pre-commit" ] && cp .git/hooks/pre-commit "$BACKUP_DIR/" && echo "  Backed up: pre-commit hook"
    [ -f ".git/hooks/pre-push" ] && cp .git/hooks/pre-push "$BACKUP_DIR/" && echo "  Backed up: pre-push hook"

    echo ""
    echo "✅ Backup created: $BACKUP_DIR/"
    echo ""
    echo "🗑️  Removing old protocols..."
    ;;
  2)
    echo ""
    echo "🗑️  Removing old protocols (no backup)..."
    ;;
  3)
    echo ""
    echo "❌ Cancelled"
    exit 0
    ;;
  *)
    echo ""
    echo "❌ Invalid choice"
    exit 1
    ;;
esac

# Remove old protocol files
rm -rf .agent/ && echo "  Removed: .agent/"
rm -f docs/RALPH_PROTOCOL.md && echo "  Removed: docs/RALPH_PROTOCOL.md"
rm -f docs/PM_PROTOCOL.md && echo "  Removed: docs/PM_PROTOCOL.md"
rm -f docs/QA_PROTOCOL.md && echo "  Removed: docs/QA_PROTOCOL.md"
rm -f docs/STANDING_ORDERS.md && echo "  Removed: docs/STANDING_ORDERS.md"
rm -f RALPH_PROTOCOL.md && echo "  Removed: RALPH_PROTOCOL.md"
rm -f PM_PROTOCOL.md && echo "  Removed: PM_PROTOCOL.md"
rm -f docs/governance/RALPH_PROTOCOL.md && echo "  Removed: docs/governance/RALPH_PROTOCOL.md"
rm -f .git/hooks/pre-commit && echo "  Removed: .git/hooks/pre-commit"
rm -f .git/hooks/pre-push && echo "  Removed: .git/hooks/pre-push"

echo ""
echo "=============================================="
echo "✅ Old protocols removed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Copy alpha protocols: cp -r ~/Desktop/alpha/* .agent/"
echo "2. Run setup: bash .agent/scripts/setup-enforcement.sh"
echo "3. Test: git commit -m 'test'"
echo ""
echo "=============================================="
