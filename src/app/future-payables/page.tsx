import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'

type Payable = {
  id: string
  type: 'emi' | 'bnpl' | 'credit_card' | 'loan'
  name: string
  amount: number
  dueDate: string
  status: 'overdue' | 'due_soon' | 'upcoming'
  sourceLink: string
}

export default async function FuturePayablesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const today = new Date()

  // Fetch EMIs
  const { data: emis } = await supabase
    .from('emis')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .not('next_due_date', 'is', null)
    .limit(1000)

  // Fetch BNPLs
  const { data: bnpls } = await supabase
    .from('bnpls')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .not('next_due_date', 'is', null)
    .limit(1000)

  // Fetch Credit Cards
  const { data: creditCards } = await supabase
    .from('credit_cards')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .not('due_date', 'is', null)
    .limit(1000)

  // Fetch Loans
  const { data: loans } = await supabase
    .from('loans')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .not('next_emi_date', 'is', null)
    .limit(1000)

  const payables: Payable[] = []

  // Process EMIs
  emis?.forEach(emi => {
    if (emi.next_due_date) {
      const dueDate = new Date(emi.next_due_date)
      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      payables.push({
        id: emi.id,
        type: 'emi',
        name: emi.emi_name,
        amount: emi.monthly_emi,
        dueDate: emi.next_due_date,
        status: daysDiff < 0 ? 'overdue' : daysDiff <= 7 ? 'due_soon' : 'upcoming',
        sourceLink: '/emis'
      })
    }
  })

  // Process BNPLs
  bnpls?.forEach(bnpl => {
    if (bnpl.next_due_date) {
      const dueDate = new Date(bnpl.next_due_date)
      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      payables.push({
        id: bnpl.id,
        type: 'bnpl',
        name: `${bnpl.provider} - ${bnpl.merchant}`,
        amount: bnpl.installment_amount,
        dueDate: bnpl.next_due_date,
        status: daysDiff < 0 ? 'overdue' : daysDiff <= 7 ? 'due_soon' : 'upcoming',
        sourceLink: '/bnpl'
      })
    }
  })

  // Process Credit Cards
  creditCards?.forEach(card => {
    if (card.due_date) {
      const currentMonth = today.getMonth()
      const currentYear = today.getFullYear()
      const dueDay = card.due_date

      let dueDate = new Date(currentYear, currentMonth, dueDay)
      if (dueDate < today) {
        dueDate = new Date(currentYear, currentMonth + 1, dueDay)
      }

      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      payables.push({
        id: card.id,
        type: 'credit_card',
        name: card.name,
        amount: card.current_balance,
        dueDate: dueDate.toISOString().split('T')[0],
        status: daysDiff < 0 ? 'overdue' : daysDiff <= 7 ? 'due_soon' : 'upcoming',
        sourceLink: '/credit-cards'
      })
    }
  })

  // Process Loans
  loans?.forEach(loan => {
    if (loan.next_emi_date && loan.emi_amount) {
      const dueDate = new Date(loan.next_emi_date)
      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      payables.push({
        id: loan.id,
        type: 'loan',
        name: loan.name,
        amount: loan.emi_amount,
        dueDate: loan.next_emi_date,
        status: daysDiff < 0 ? 'overdue' : daysDiff <= 7 ? 'due_soon' : 'upcoming',
        sourceLink: '/loans'
      })
    }
  })

  // Sort by due date
  payables.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  const totalAmount = payables.reduce((sum, p) => sum + p.amount, 0)
  const overdueCount = payables.filter(p => p.status === 'overdue').length
  const dueSoonCount = payables.filter(p => p.status === 'due_soon').length

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'emi': return 'EMI'
      case 'bnpl': return 'BNPL'
      case 'credit_card': return 'Credit Card'
      case 'loan': return 'Loan'
      default: return type
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'overdue':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-medium">Overdue</span>
      case 'due_soon':
        return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 font-medium">Due Soon</span>
      case 'upcoming':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-medium">Upcoming</span>
      default:
        return null
    }
  }

  const getDaysInfo = (dateStr: string) => {
    const dueDate = new Date(dateStr)
    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff < 0) return `${Math.abs(daysDiff)} days overdue`
    if (daysDiff === 0) return 'Due today'
    if (daysDiff === 1) return 'Due tomorrow'
    return `In ${daysDiff} days`
  }

  return (
    <AppLayout userEmail={user.email || ''}>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Future Payables</h1>
            <p className="text-sm text-gray-600 mt-1">
              Upcoming payments and due dates across all accounts
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Total Payables</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</div>
              <div className="text-xs text-gray-500 mt-1">{payables.length} payments</div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Overdue</div>
              <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
              <div className="text-xs text-gray-500 mt-1">Requires immediate attention</div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Due Soon (7 days)</div>
              <div className="text-2xl font-bold text-orange-600">{dueSoonCount}</div>
              <div className="text-xs text-gray-500 mt-1">Payment needed soon</div>
            </div>
          </div>

          {/* Payables Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <div className="max-h-[600px] overflow-y-auto">
                {payables.length === 0 ? (
                  <div className="px-6 py-12 text-center text-gray-500">
                    No upcoming payables found.
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Due Date</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Amount</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payables.map((payable) => (
                        <tr key={`${payable.type}-${payable.id}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(payable.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{getTypeLabel(payable.type)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{payable.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(payable.dueDate)}</div>
                            <div className={`text-xs ${
                              payable.status === 'overdue' ? 'text-red-600' :
                              payable.status === 'due_soon' ? 'text-orange-600' :
                              'text-gray-500'
                            }`}>
                              {getDaysInfo(payable.dueDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-sm font-semibold text-gray-900">{formatCurrency(payable.amount)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <Link href={payable.sourceLink} className="text-blue-600 hover:text-blue-800">
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
