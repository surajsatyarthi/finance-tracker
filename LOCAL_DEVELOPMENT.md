# Local Development Setup

## Prerequisites
- Docker Desktop installed and running
- Supabase CLI installed (v1.x or higher)
  - Recommended: `brew install supabase/tap/supabase`
  - Or download binary to `~/.local/bin/supabase`

## Setup Local Supabase

1. **Start Supabase**
   ```bash
   # From finance-tracker directory
   ~/.local/bin/supabase start
   # OR if in PATH:
   supabase start
   ```

   **Note:** We use custom ports to avoid conflicts with other projects:
   - API: 55321
   - DB: 55322
   - Studio: 55323
   - Inbucket: 55324

2. **Configure Environment**
   Update `.env.local` with the local credentials output by `supabase start`.
   (A backup of production config is saved as `.env.local.backup`)

   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321,
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   ```

3. **Run Application**
   ```bash
   npm run dev
   ```

## Seeding Test Data

To seed a test user for development:
```bash
node scripts/seed-test-user.js
```
Credentials: `test@financetracker.local` / `TestPassword123!`

## Switching Environments

- **Local:** Use `.env.local` with localhost URLs
- **Production:** Restore `.env.local.backup`

## Troubleshooting

### Port Conflicts
If ports 553xx are in use, check `supabase/config.toml` and update accordingly.

### Database Connection Failed
Ensure Docker is running and `supabase status` shows all services as healthy.
