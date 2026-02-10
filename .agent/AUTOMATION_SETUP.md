# 🤖 Ralph Protocol v6.0 - Automated Enforcement Setup

## Overview

This document provides the **automated enforcement mechanisms** that make Ralph Protocol self-enforcing. Copy these to any new project to enable automatic quality gates.

---

## 📦 What This Includes

1. **Pre-commit Hook** - Blocks commits with failing gates
2. **Pre-push Hook** - Blocks production pushes without confirmation
3. **CI/CD Configuration** - GitHub Actions enforcement
4. **Environment Validator** - Validates required env vars
5. **Vercel Configuration** - Deployment-time checks

---

## 🧹 STEP 1: Remove Old Protocols (Existing Projects)

**⚠️ IMPORTANT:** Most projects have old Ralph/PM protocols. Clean them up first to avoid conflicts.

### Option A: Automated Cleanup (RECOMMENDED) ⭐

Use the provided interactive cleanup script:

```bash
cd /path/to/your-project

# Copy cleanup script from alpha folder
cp ~/Desktop/alpha/scripts/cleanup-old-protocols.sh .

# Run it (interactive - will prompt for backup)
bash cleanup-old-protocols.sh

# Remove the script after cleanup
rm cleanup-old-protocols.sh
```

**The script will:**
- ✅ Scan for all old protocol files
- ✅ Prompt you to create a timestamped backup
- ✅ Remove all old protocols safely
- ✅ Prepare project for fresh Alpha installation

### Option B: Quick Manual Cleanup

If you prefer manual commands:

```bash
cd /path/to/your-project

# Backup first (RECOMMENDED)
BACKUP_DIR=".protocol-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
[ -d ".agent" ] && cp -r .agent "$BACKUP_DIR/"
[ -f "docs/RALPH_PROTOCOL.md" ] && cp docs/RALPH_PROTOCOL.md "$BACKUP_DIR/"

# Remove old protocol locations
rm -rf .agent/
rm -f docs/RALPH_PROTOCOL.md
rm -f docs/PM_PROTOCOL.md
rm -f docs/QA_PROTOCOL.md
rm -f docs/STANDING_ORDERS.md
rm -f docs/governance/RALPH_PROTOCOL.md
rm -f RALPH_PROTOCOL.md
rm -f PM_PROTOCOL.md

# Remove old git hooks (will be recreated)
rm -f .git/hooks/pre-commit
rm -f .git/hooks/pre-push

echo "✅ Old protocols removed - ready for Alpha"
```

### Common Old Protocol Locations

Projects typically have old protocols in these locations:

- `.agent/RALPH_PROTOCOL.md` (old location)
- `docs/RALPH_PROTOCOL.md`
- `docs/PM_PROTOCOL.md`
- `docs/governance/RALPH_PROTOCOL.md`
- `RALPH_PROTOCOL.md` (project root)
- `.git/hooks/pre-commit` (old hook)
- `.git/hooks/pre-push` (old hook)

**All will be replaced with Alpha Protocol v6.0**

---

## 🚀 STEP 2: Install Alpha Protocol

### Quick Setup (After Cleanup)

```bash
# 1. Copy alpha protocol documents
cp -r ~/Desktop/alpha/* /path/to/project/.agent/

# 2. Run automated setup
cd /path/to/project
bash .agent/scripts/setup-enforcement.sh

# 3. Configure environment variables (see ENFORCEMENT_GUIDE.md)

# 4. Test enforcement
git commit -m "test"  # Should trigger pre-commit checks
```

### Full Installation Steps

```bash
# Navigate to your project
cd /path/to/your-project

# Step 1: Clean up old protocols (if any)
rm -rf .agent/
rm -f .git/hooks/pre-commit .git/hooks/pre-push

# Step 2: Copy alpha protocols
cp -r ~/Desktop/alpha/* .agent/

# Step 3: Run automated setup
bash .agent/scripts/setup-enforcement.sh

# Step 4: Verify installation
ls -la .git/hooks/pre-commit    # Should exist
ls -la .git/hooks/pre-push      # Should exist
ls -la .agent/                  # Should have all protocol files

# Step 5: Test enforcement
git commit -m "test"            # Will trigger pre-commit checks
```

---

## 📁 File Structure

```
project-root/
├── .git/hooks/
│   ├── pre-commit          # Auto-generated from setup script
│   └── pre-push            # Auto-generated from setup script
├── .github/workflows/
│   └── ci.yml              # Ralph Protocol CI enforcement
├── scripts/
│   └── validate-env.ts     # Environment variable validator
├── .agent/
│   ├── RALPH_PROTOCOL.md
│   ├── PM_PROTOCOL.md
│   ├── QA_PROTOCOL.md
│   ├── STANDING_ORDERS.md
│   ├── WORKFLOW.md
│   ├── ENFORCEMENT_GUIDE.md
│   └── scripts/
│       └── setup-enforcement.sh
└── vercel.json             # With pre-build validation
```

---

## 🔧 Automated Setup Script

**File:** `.agent/scripts/setup-enforcement.sh`

This script automatically installs all enforcement mechanisms.

```bash
#!/bin/bash
# Ralph Protocol v6.0 - Automated Enforcement Setup
# Run this script to install all enforcement mechanisms in a new project

set -e

echo "🦅 Ralph Protocol v6.0 - Automated Enforcement Setup"
echo "===================================================="
echo ""

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
  exit 1
fi
echo "✅ Build passed"

# GATE CHECK 2: Lint
echo "🧹 Checking lint..."
if ! npm run lint > /dev/null 2>&1; then
  echo "❌ BLOCKED: Lint failed"
  exit 1
fi
echo "✅ Lint passed"

# GATE CHECK 3: Tests
echo "🧪 Checking tests..."
if ! npm run test > /dev/null 2>&1; then
  echo "❌ BLOCKED: Tests failed"
  exit 1
fi
echo "✅ Tests passed"

echo ""
echo "✅ All pre-commit gates passed"
echo "========================================="

exit 0
EOF

chmod +x .git/hooks/pre-commit
echo "✅ Pre-commit hook installed"

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
    if [ -f "package.json" ]; then
      PROJECT_DIR="."
    elif [ -f "bmn-site/package.json" ]; then
      PROJECT_DIR="bmn-site"
    else
      echo "❌ ERROR: Cannot find package.json"
      exit 1
    fi

    cd "$PROJECT_DIR"

    # Re-run quality gates
    if ! npm run build > /dev/null 2>&1; then
      echo "❌ BLOCKED: Build failed"
      exit 1
    fi

    if ! npm run test > /dev/null 2>&1; then
      echo "❌ BLOCKED: Tests failed"
      exit 1
    fi

    echo "✅ Quality gates verified"
    echo ""

    # Deployment checklist
    echo "⚠️  PRODUCTION DEPLOYMENT CHECKLIST:"
    echo "  [ ] Environment variables configured?"
    echo "  [ ] Staging deployment verified?"
    echo "  [ ] Database migrations applied?"
    echo "  [ ] Rollback plan documented?"
    echo ""
    echo "Press ENTER to confirm, or Ctrl+C to abort"
    read -r confirmation
  fi
done

echo "✅ Pre-push gates passed"

exit 0
EOF

chmod +x .git/hooks/pre-push
echo "✅ Pre-push hook installed"

# Step 3: Install environment validator
echo ""
echo "📦 Step 3/5: Installing environment validator..."

# Find scripts directory
if [ -d "scripts" ]; then
  SCRIPTS_DIR="scripts"
elif [ -d "bmn-site/scripts" ]; then
  SCRIPTS_DIR="bmn-site/scripts"
else
  mkdir -p scripts
  SCRIPTS_DIR="scripts"
fi

# Copy validator from .agent/templates if it exists
if [ -f ".agent/templates/validate-env.ts" ]; then
  cp .agent/templates/validate-env.ts "$SCRIPTS_DIR/"
  echo "✅ Environment validator installed"
else
  echo "⚠️  Environment validator template not found - skipping"
fi

# Step 4: Update package.json scripts
echo ""
echo "📦 Step 4/5: Adding npm scripts..."
echo "⚠️  Manual step required: Add these to package.json scripts:"
echo ""
echo '  "validate:env": "npx tsx scripts/validate-env.ts",'
echo '  "validate:env:production": "npx tsx scripts/validate-env.ts --environment=production"'
echo ""

# Step 5: CI/CD setup
echo "📦 Step 5/5: CI/CD configuration..."
if [ -d ".github/workflows" ]; then
  echo "✅ GitHub Actions directory exists"
  echo "⚠️  Manual step: Update .github/workflows/ci.yml with Ralph Protocol gates"
else
  echo "⚠️  .github/workflows not found - create it manually"
fi

echo ""
echo "===================================================="
echo "✅ Ralph Protocol Enforcement Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Add npm scripts to package.json (see above)"
echo "2. Update .github/workflows/ci.yml with enforcement"
echo "3. Configure required environment variables"
echo "4. Test with: git commit -m 'test'"
echo ""
echo "Documentation: .agent/ENFORCEMENT_GUIDE.md"
echo "===================================================="
EOF

chmod +x .agent/scripts/setup-enforcement.sh
```

---

## 📄 Template Files

### 1. Environment Validator Template

**File:** `.agent/templates/validate-env.ts`

```typescript
#!/usr/bin/env tsx
/**
 * Ralph Protocol v6.0 - DPL-001: Environment Variable Validation
 */

const REQUIRED_ENV_VARS = {
  // Add your required environment variables here
  NEXT_PUBLIC_API_URL: {
    description: 'Public API URL',
    example: 'https://api.example.com',
    production: true,
  },
  DATABASE_URL: {
    description: 'PostgreSQL connection string',
    example: 'postgresql://user:pass@host:5432/dbname',
    production: true,
  },
  // Add more as needed
} as const;

interface ValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

function validateEnvironment(checkProduction = false): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  console.log('🔍 Ralph Protocol DPL-001: Environment Variable Validation');
  console.log('==========================================================\n');

  for (const [key, config] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = process.env[key];
    const isRequired = checkProduction ? config.production : true;

    if (!value) {
      if (isRequired) {
        missing.push(key);
        console.log(`❌ MISSING: ${key}`);
        console.log(`   Description: ${config.description}`);
        console.log(`   Example: ${config.example}\n`);
      } else {
        warnings.push(key);
        console.log(`⚠️  OPTIONAL: ${key} (not set)\n`);
      }
    } else {
      console.log(`✅ ${key}`);
    }
  }

  console.log('\n==========================================================');

  const result: ValidationResult = {
    valid: missing.length === 0,
    missing,
    warnings,
  };

  if (result.valid) {
    console.log('✅ All required environment variables present\n');
  } else {
    console.log(`❌ ${missing.length} required variable(s) missing\n`);
  }

  return result;
}

const args = process.argv.slice(2);
const isProduction = args.some(arg => arg.includes('production'));
const result = validateEnvironment(isProduction);

process.exit(result.valid ? 0 : 1);
```

---

## ⚙️ CI/CD Template

**File:** `.agent/templates/ci.yml`

```yaml
name: Ralph Protocol v6.0 - CI Enforcement

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  ralph-protocol-gates:
    name: 🦅 Ralph Protocol - Quality Gates
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout
        uses: actions/checkout@v4

      - name: 📦 Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: 📦 Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: 📦 Install
        run: pnpm install --frozen-lockfile

      - name: Gate 7 - Lint
        run: pnpm run lint

      - name: Gate 7 - Build
        run: pnpm run build
        env:
          # Add test environment variables here

      - name: Gate 8 - Tests
        run: pnpm run test

      - name: DPL-003 - Secrets Scan
        run: |
          ! grep -r "password.*=.*\"" src/ || exit 1
          echo "✅ No hardcoded secrets"

      - name: ✅ All Gates Passed
        run: echo "✅ Ralph Protocol: All CI Gates Passed"
```

---

## 🔄 Vercel Configuration Template

**File:** `.agent/templates/vercel.json`

```json
{
  "buildCommand": "npm run validate:env:production && npm run build",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "github": {
    "silent": false,
    "autoJobCancelation": true
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Ralph-Protocol",
          "value": "v6.0-enforced"
        }
      ]
    }
  ]
}
```

---

## 📋 Project Checklist

**After running setup, verify:**

- [ ] Pre-commit hook blocks failing builds
- [ ] Pre-commit hook blocks failing tests
- [ ] Pre-push hook shows deployment checklist
- [ ] CI/CD runs on pull requests
- [ ] Environment validator works: `npm run validate:env`
- [ ] Vercel build includes validation

**Test commands:**
```bash
# Test pre-commit
git commit -m "test"

# Test environment validator
npm run validate:env

# Test pre-push (dry run)
git push --dry-run origin main
```

---

## 🆕 Adding to New Projects

1. **Copy alpha folder to project:**
   ```bash
   cp -r ~/Desktop/alpha/.agent /path/to/project/
   ```

2. **Run setup script:**
   ```bash
   cd /path/to/project
   bash .agent/scripts/setup-enforcement.sh
   ```

3. **Customize for project:**
   - Edit `scripts/validate-env.ts` with project's env vars
   - Update `.github/workflows/ci.yml` with project-specific tests
   - Configure `vercel.json` with correct build commands

4. **Document in project README:**
   - Link to `.agent/ENFORCEMENT_GUIDE.md`
   - Include setup instructions

---

## ✅ Verification

**Enforcement is working if:**
- ✅ Cannot commit code with failing tests
- ✅ Cannot push to main without confirmation
- ✅ CI blocks all PRs with failing checks
- ✅ Vercel deployment fails without env vars

**Enforcement is failing if:**
- ❌ Can commit with failing tests
- ❌ Can push to main without checks
- ❌ CI doesn't run on PRs
- ❌ Deployment succeeds with missing env vars

---

**Created:** 2026-02-10
**Version:** Ralph Protocol v6.0
**Status:** PRODUCTION-READY
