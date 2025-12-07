import { NextResponse } from 'next/server'
import { generateDailySummary } from '@/lib/summaryService'
import { createClient } from '@supabase/supabase-js'

// Helper to get user ID - For Cron jobs, we might need to iterate ALL users?
// Or for this Personal App, we just target the main user.
// Since it's a personal app, we assume we want the summary for the owner.
// AUTH STRATEGY: 
// 1. Cron job sends a CRON_SECRET header.
// 2. We use a service role key (if avail) or just assume a single user context for this MVP.
// LIMITATION: 'financeManager' relies on 'authContext' which is client-side.
// We need a SERVER-SIDE version of fetching data for this API to work autonomously.

// RE-FACTOR: 'financeManager' is client-side (uses browser supabase client).
// We need to use 'createClient' here directly with Service Role or just standard client if public/anon (bad idea).

export async function GET(request: Request) {
    try {
        // 1. Auth / Security Check
        const authHeader = request.headers.get('authorization')
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            // return new NextResponse('Unauthorized', { status: 401 })
            // For testing easier, let's allow open access if in DEV mode or just warn
        }

        // 2. We need the User ID. 
        // Is there a logged in user? Likely not if it's a Cron.
        // Solution for Personal App: Hardcode the User ID or fetch the first user.
        // Ideally, we'd fetch all users and loop, but this is a single user app.

        // TEMPORARY: Since we can't easily get the "Context User" in an API route without a session cookie,
        // and Cron jobs don't have session cookies, we need the User ID.
        // We will attempt to get it from the request query param for testing: ?userId=...
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        // NOTE: In a real app, you'd iterate over supabase.auth.admin.listUsers() 

        if (!userId) {
            return NextResponse.json({ error: 'User ID required for test. Provide ?userId=...' }, { status: 400 })
        }

        // WARNING: 'financeManager' might fail because it expects 'this.userId' to be set via 'initialize()' which uses 'supabase.auth.getUser()'.
        // We can't use 'financeManager' here easily.
        // We should use 'summaryService' but inject a custom data fetcher?
        // OR: We update 'financeManager' to allow setting userId manually.
        // Let's assume we can instance financeManager? No, it's a singleton export.

        // FIX: We need to modify 'summaryService' to accept a Supabase Client and UserId? 
        // OR simpler: Just instantiate a fresh Supabase client here and fetch raw data.

        // Let's just return a message saying "Backend Email requires Service Role configuration"
        // Actually, 'financeManager' uses the unexpected 'createClientComponentClient'.
        // API Routes should use 'createRouteHandlerClient' or 'createClient'.

        return NextResponse.json({
            success: false,
            message: 'Email Summary requires Server-Side Data Fetching implementation. The current DataManager is Client-Side only.'
        })

        /* 
        // DESIRED IMPLEMENTATION ONCE SERVER-SIDE FETCHING IS SOLVED:
        const summary = await generateDailySummary(userId)
        
        // Email Sending Logic (Resend Example)
        // await resend.emails.send({
        //   from: 'Finance Tracker <onboarding@resend.dev>',
        //   to: 'suraj.satyarthi@gmail.com', // Replace with user email
        //   subject: 'Daily Financial Summary',
        //   html: summary.html
        // })
    
        return NextResponse.json({ success: true, summary: summary.text })
        */

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
