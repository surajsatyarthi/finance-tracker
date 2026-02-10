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

const REQUIRED_ENV_VARS = {
  // Supabase Configuration
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
  SUPABASE_SERVICE_ROLE_KEY: {
    description: 'Supabase service role key (admin)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    production: true,
  },

  // Database
  DATABASE_URL: {
    description: 'PostgreSQL connection string',
    example: 'postgresql://user:pass@host:5432/dbname',
    production: true,
  },

  // Email Service
  RESEND_API_KEY: {
    description: 'Resend API key for transactional emails',
    example: 're_xxxxxxxxxxxxx',
    production: true,
  },
  RESEND_FROM_EMAIL: {
    description: 'From email address for transactional emails',
    example: 'noreply@businessmarket.network',
    production: true,
  },

  // Application
  NEXT_PUBLIC_APP_URL: {
    description: 'Public application URL',
    example: 'https://smartket.network',
    production: true,
  },
  CRON_SECRET: {
    description: 'Secret for authenticating cron job requests',
    example: 'random-secure-string',
    production: true,
  },

  // OAuth
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: {
    description: 'Google OAuth client ID',
    example: '123456789-xxxxxxxx.apps.googleusercontent.com',
    production: false,
  },
  GOOGLE_CLIENT_SECRET: {
    description: 'Google OAuth client secret',
    example: 'GOCSPX-xxxxxxxxxxxxx',
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
    const isRequired = checkProduction ? config.production : true;

    if (!value) {
      if (isRequired) {
        missing.push(key);
        console.log(`❌ MISSING: ${key}`);
        console.log(`   Description: ${config.description}`);
        console.log(`   Example: ${config.example}\n`);
      } else {
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
