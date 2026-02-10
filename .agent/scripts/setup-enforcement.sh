#!/bin/bash
# Ralph Protocol v6.0 - Automated Enforcement Setup
# Run this script in any project to install all enforcement mechanisms

set -e

echo "🦅 Ralph Protocol v6.0 - Automated Enforcement Setup"
echo "===================================================="
echo ""

# Ensure we're in a git repository
if ! git rev-parse --show-toplevel > /dev/null 2>&1; then
  echo "❌ ERROR: Not a git repository"
  echo "Run 'git init' first"
  exit 1
fi

PROJECT_ROOT="$(git rev-parse --show-toplevel)"
cd "$PROJECT_ROOT"

# Step 1: Install pre-commit hook
echo "📦 Step 1/5: Installing pre-commit hook..."
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Ralph Protocol v6.0 - Pre-commit Enforcement

set -e

echo "🦅 Ralph Protocol: Pre-commit Gate Check"
echo "========================================="

# Find package.json directory
if [ -f "package.json" ]; then
  PROJECT_DIR="."
elif [ -f "bmn-site/package.json" ]; then
  PROJECT_DIR="bmn-site"
else
  echo "❌ ERROR: Cannot find package.json"
  exit 1
fi

cd "$PROJECT_DIR"

# GATE CHECK 1: Build
echo "🔨 Checking build..."
if ! npm run build > /dev/null 2>&1; then
  echo "❌ BLOCKED: Build failed"
  echo "Fix: Run 'npm run build' and resolve all errors"
  exit 1
fi
echo "✅ Build passed"

# GATE CHECK 2: Lint
echo "🧹 Checking lint..."
if ! npm run lint > /dev/null 2>&1; then
  echo "❌ BLOCKED: Lint failed"
  echo "Fix: Run 'npm run lint' and resolve all errors"
  exit 1
fi
echo "✅ Lint passed"

# GATE CHECK 3: Tests
echo "🧪 Checking tests..."
if ! npm run test > /dev/null 2>&1; then
  echo "❌ BLOCKED: Tests failed"
  echo "Fix: Run 'npm run test' and resolve all failures"
  exit 1
fi
echo "✅ Tests passed"

# GATE CHECK 4: Security scan (if available)
if npm run ralph:scan --if-present > /dev/null 2>&1; then
  echo "✅ Security scan passed"
fi

echo ""
echo "✅ All pre-commit gates passed"
echo "========================================="

exit 0
EOF

chmod +x .git/hooks/pre-commit
echo "✅ Pre-commit hook installed at .git/hooks/pre-commit"

# Step 2: Install pre-push hook
echo ""
echo "📦 Step 2/5: Installing pre-push hook..."
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash
# Ralph Protocol v6.0 - Pre-push Enforcement

set -e

echo "🦅 Ralph Protocol: Pre-push Gate Check"
echo "========================================="

remote="$1"
url="$2"

while read local_ref local_sha remote_ref remote_sha
do
  branch=$(echo "$remote_ref" | sed 's|refs/heads/||')

  if [[ "$branch" == "main" || "$branch" == "master" ]]; then
    echo "⚠️  Pushing to protected branch: $branch"
    echo ""

    # Find package.json directory
    PROJECT_ROOT="$(git rev-parse --show-toplevel)"
    cd "$PROJECT_ROOT"

    if [ -f "package.json" ]; then
      PROJECT_DIR="."
    elif [ -f "bmn-site/package.json" ]; then
      PROJECT_DIR="bmn-site"
    else
      echo "❌ ERROR: Cannot find package.json"
      exit 1
    fi

    cd "$PROJECT_DIR"

    echo "🔍 Verifying quality gates..."

    # Re-run build
    if ! npm run build > /dev/null 2>&1; then
      echo "❌ BLOCKED: Build failed"
      echo "Cannot push to $branch with failing build"
      exit 1
    fi

    # Re-run tests
    if ! npm run test > /dev/null 2>&1; then
      echo "❌ BLOCKED: Tests failed"
      echo "Cannot push to $branch with failing tests"
      exit 1
    fi

    echo "✅ Quality gates verified"
    echo ""

    # Production deployment checklist
    echo "⚠️  PRODUCTION DEPLOYMENT CHECKLIST:"
    echo "  [ ] Environment variables configured in hosting platform?"
    echo "  [ ] Staging deployment verified?"
    echo "  [ ] Database migrations applied?"
    echo "  [ ] Rollback plan documented?"
    echo ""
    echo "Press ENTER to confirm deployment readiness, or Ctrl+C to abort"
    read -r confirmation
  fi
done

echo "✅ Pre-push gates passed"
echo "========================================="

exit 0
EOF

chmod +x .git/hooks/pre-push
echo "✅ Pre-push hook installed at .git/hooks/pre-push"

# Step 3: Copy environment validator template
echo ""
echo "📦 Step 3/5: Installing environment validator..."

# Find or create scripts directory
if [ -f "package.json" ]; then
  SCRIPTS_DIR="scripts"
elif [ -f "bmn-site/package.json" ]; then
  SCRIPTS_DIR="bmn-site/scripts"
else
  SCRIPTS_DIR="scripts"
fi

mkdir -p "$SCRIPTS_DIR"

# Check if .agent/templates exists (from alpha folder)
if [ -f ".agent/templates/validate-env.ts" ]; then
  cp .agent/templates/validate-env.ts "$SCRIPTS_DIR/"
  echo "✅ Environment validator installed at $SCRIPTS_DIR/validate-env.ts"
else
  echo "⚠️  Template not found - copy validate-env.ts manually from alpha/templates/"
fi

# Step 4: Instructions for package.json
echo ""
echo "📦 Step 4/5: Package.json configuration..."
echo ""
echo "⚠️  MANUAL STEP REQUIRED:"
echo "Add these scripts to your package.json:"
echo ""
echo '  "scripts": {'
echo '    "validate:env": "npx tsx scripts/validate-env.ts",'
echo '    "validate:env:production": "npx tsx scripts/validate-env.ts --environment=production"'
echo '  }'
echo ""

# Step 5: CI/CD setup
echo "📦 Step 5/5: CI/CD configuration..."
if [ -d ".github/workflows" ]; then
  echo "✅ GitHub Actions directory exists"
  echo "⚠️  Update .github/workflows/ci.yml with Ralph Protocol gates"
  echo "    Template available at .agent/templates/ci.yml"
else
  mkdir -p .github/workflows
  if [ -f ".agent/templates/ci.yml" ]; then
    cp .agent/templates/ci.yml .github/workflows/
    echo "✅ CI workflow template installed"
  else
    echo "⚠️  Create .github/workflows/ci.yml manually"
  fi
fi

echo ""
echo "===================================================="
echo "✅ Ralph Protocol Enforcement Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Add npm scripts to package.json (see above)"
echo "2. Customize scripts/validate-env.ts with your env vars"
echo "3. Update .github/workflows/ci.yml if needed"
echo "4. Test with: git commit -m 'test enforcement'"
echo ""
echo "📖 Documentation:"
echo "   .agent/ENFORCEMENT_GUIDE.md"
echo "   .agent/RALPH_PROTOCOL.md"
echo ""
echo "🧪 Test enforcement:"
echo "   npm run validate:env"
echo "   git commit -m 'test'"
echo "===================================================="
