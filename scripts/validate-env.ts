#!/usr/bin/env tsx
/**
 * Ralph Protocol v6.0 - DPL-001: Environment Variable Validation
 *
 * This script validates that all required environment variables are present
 * before deployment. Prevents production deployments with missing config.
 *
 * Usage:
 *   npm run validate:env
 *   npm run validate:env -- --environment=production
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local for local development
try {
  const envPath = resolve(process.cwd(), '.env.local');
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  });
} catch {
  // .env.local not found, will check environment variables directly
}

const REQUIRED_ENV_VARS = {
  // Supabase Configuration (Required)
  NEXT_PUBLIC_SUPABASE_URL: {
    description: 'Supabase project URL',
    example: 'https://xxxxx.supabase.co',
    production: true,
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    description: 'Supabase anonymous/public key',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    production: true,
  },

  // Test Environment (Development only)
  TEST_USER_EMAIL: {
    description: 'Email for E2E test user',
    example: 'test@financetracker.local',
    production: false,
  },
  TEST_USER_PASSWORD: {
    description: 'Password for E2E test user',
    example: 'TestPassword123!',
    production: false,
  },
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
    // In production: only require vars with production:true
    // In development: require vars with production:true, test vars are optional
    const isRequired = config.production || !checkProduction;

    if (!value) {
      if (isRequired && config.production) {
        // Required var is missing
        missing.push(key);
        console.log(`❌ MISSING: ${key}`);
        console.log(`   Description: ${config.description}`);
        console.log(`   Example: ${config.example}\n`);
      } else {
        // Optional var (test env vars)
        warnings.push(key);
        console.log(`⚠️  OPTIONAL: ${key} (not set)`);
        console.log(`   Description: ${config.description}\n`);
      }
    } else {
      // Validate format
      let validFormat = true;
      let formatError = '';

      if (key.includes('URL')) {
        if (!value.startsWith('http://') && !value.startsWith('https://')) {
          validFormat = false;
          formatError = 'Must be a valid URL starting with http:// or https://';
        }
      }

      if (key.includes('EMAIL')) {
        if (!value.includes('@')) {
          validFormat = false;
          formatError = 'Must be a valid email address';
        }
      }

      if (validFormat) {
        console.log(`✅ ${key}`);
      } else {
        console.log(`❌ ${key} (invalid format)`);
        console.log(`   Error: ${formatError}\n`);
        missing.push(key);
      }
    }
  }

  console.log('\n==========================================================');

  const result: ValidationResult = {
    valid: missing.length === 0,
    missing,
    warnings,
  };

  if (result.valid) {
    console.log('✅ All required environment variables are present and valid\n');
  } else {
    console.log(`❌ ${missing.length} required environment variable(s) missing or invalid\n`);
    console.log('Fix: Add these variables to your .env.local file or deployment platform\n');
  }

  return result;
}

// Main execution
const args = process.argv.slice(2);
const isProduction = args.some(arg => arg.includes('production'));

const result = validateEnvironment(isProduction);

if (!result.valid) {
  process.exit(1);
}

process.exit(0);
