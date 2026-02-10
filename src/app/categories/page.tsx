import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'
import DeleteCategoryButton from './DeleteButton'
import type { Category } from '@/types/database'

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('type', { ascending: true })
   .order('name', { ascending: true })
    .limit(1000)

  const list = (categories || []) as Category[]
  const incomeCategories = list.filter(c => c.type === 'income')
  const expenseCategories = list.filter(c => c.type === 'expense')

  return (
    <AppLayout userEmail={user.email || ''}>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
            <Link
              href="/categories/form"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              + Add Category
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income Categories */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-green-50 border-b border-green-100">
                <h2 className="text-lg font-semibold text-green-800">Income Categories</h2>
              </div>
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Name</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {incomeCategories.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="px-6 py-8 text-center text-gray-500">
                          No income categories yet.
                        </td>
                      </tr>
                    ) : (
                      incomeCategories.map((category) => (
                        <tr key={category.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <Link href={`/categories/form?id=${category.id}`} className="text-blue-600 hover:text-blue-800 mr-4">
                              Edit
                            </Link>
                            <DeleteCategoryButton id={category.id} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Expense Categories */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-red-50 border-b border-red-100">
                <h2 className="text-lg font-semibold text-red-800">Expense Categories</h2>
              </div>
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Name</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {expenseCategories.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="px-6 py-8 text-center text-gray-500">
                          No expense categories yet.
                        </td>
                      </tr>
                    ) : (
                      expenseCategories.map((category) => (
                        <tr key={category.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <Link href={`/categories/form?id=${category.id}`} className="text-blue-600 hover:text-blue-800 mr-4">
                              Edit
                            </Link>
                            <DeleteCategoryButton id={category.id} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
