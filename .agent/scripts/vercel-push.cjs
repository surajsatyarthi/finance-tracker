/* eslint-disable */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const envLocalPath = path.join(__dirname, '../../.env.local');
const envProdPath = path.join(__dirname, '../../.env.production.local');

try {
  // 1. Get Token
  const envLocal = fs.readFileSync(envLocalPath, 'utf8');
  const tokenMatch = envLocal.match(/VERCEL_OIDC_TOKEN="([^"]+)"/);
  if (!tokenMatch) throw new Error('VERCEL_OIDC_TOKEN not found in .env.local');
  const token = tokenMatch[1];

  // 2. Get Vars
  const envProd = fs.readFileSync(envProdPath, 'utf8');
  const vars = {};
  envProd.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)="([^"]+)"/);
    if (match) vars[match[1]] = match[2];
  });

  // 3. Push Vars
  Object.entries(vars).forEach(([key, val]) => {
    console.log(`Processing ${key}...`);
    try {
      // Try removing first to avoid overwrite prompt
      try {
        execSync(`npx -y vercel env rm ${key} production -y --token ${token}`, { stdio: 'ignore' });
        console.log(`  Removed existing ${key}.`);
      } catch (e) {
        // Ignore error if var doesn't exist
      }

      // Add new value
      execSync(`npx -y vercel env add ${key} production --token ${token}`, { 
        input: val + '\n',
        stdio: ['pipe', 'inherit', 'inherit']
      });
      console.log(`  Added ${key}.`);
    } catch (e) {
      console.error(`  Failed to push ${key}:`, e.message);
    }
  });
  console.log('Done.');

} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
}
