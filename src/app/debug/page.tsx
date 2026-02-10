import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DebugPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Try to fetch accounts with the current user
  const { data: accounts, error: accountsError } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .limit(1000)

  // Try to fetch ALL accounts (will fail if RLS is properly set)
  const { data: allAccounts, error: allAccountsError } = await supabase
    .from('accounts')
    .select('user_id, name')
    .limit(5)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug Info</h1>

        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Current User</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify({ id: user.id, email: user.email }, null, 2)}
            </pre>
          </div>

          {/* Accounts Query */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Accounts for Current User</h2>
            {accountsError ? (
              <div className="bg-red-50 text-red-600 p-4 rounded">
                Error: {accountsError.message}
              </div>
            ) : (
              <div>
                <p className="mb-2">Found: {accounts?.length || 0} accounts</p>
                <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs max-h-60">
                  {JSON.stringify(accounts, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* All Accounts Query */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Sample Accounts (First 5)</h2>
            {allAccountsError ? (
              <div className="bg-red-50 text-red-600 p-4 rounded">
                Error: {allAccountsError.message}
              </div>
            ) : (
              <div>
                <p className="mb-2">Found: {allAccounts?.length || 0} accounts</p>
                <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
                  {JSON.stringify(allAccounts, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
