# Quick Test Setup Guide

## ✅ Your Supabase is Already Configured!

Your test environment is ready to use your existing Supabase project:
- **Supabase URL**: https://zzwouesueadoqrlmteyh.supabase.co
- **Project**: Finance Tracker

## 🎯 Create a Test User (One-Time Setup)

You need to create a test user account in Supabase Auth:

### Option 1: Use Supabase Dashboard (Recommended - 2 minutes)

1. **Open Supabase Dashboard**:
   - Go to: https://supabase.com/dashboard/project/zzwouesueadoqrlmteyh
   - Login with kriger.5490@gmail.com

2. **Create Test User**:
   - Click **Authentication** in sidebar
   - Click **Users** tab
   - Click **Add user** → **Create new user**
   - Email: `test@financetracker.local`
   - Password: `TestPassword123!`
   - ✅ Check "Auto Confirm User"
   - Click **Create user**

3. **Done!**  
   Your test user is ready. Tests will use this account.

### Option 2: Use Your Existing Account (Quick but Not Recommended)

**Update `.env.test` with your actual credentials:**
```env
TEST_USER_EMAIL=kriger.5490@gmail.com
TEST_USER_PASSWORD=your_actual_password
```

⚠️ **Warning**: Tests will create/modify/delete financial data in your account!

## 🚀 Run Tests

Once test user is created:

```bash
# Run single test with visible browser
npm run test:e2e:headed -- tests/e2e/auth.spec.ts -g "should login"

# Run all tests (headless)
npm run test:e2e

# Run with UI (interactive)
npm run test:e2e:ui
```

## 📝 Current Status

- ✅ Supabase configured
- ✅ Dev server running (localhost:3001)
- ✅ Tests configured
- ⏳ **Waiting for**: Test user creation

**Estimated time**: 2 minutes to create user, then tests will work!
