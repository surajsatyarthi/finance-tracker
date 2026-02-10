'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DeleteConfirmModal from '@/components/DeleteConfirmModal'

type DeleteLoanButtonProps = {
  id: string
  loanName: string
}

export default function DeleteLoanButton({ id, loanName }: DeleteLoanButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('loans')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      router.push('/loans')
      router.refresh()
    } catch (error) {
      console.error('Error deleting loan:', error)
      alert('Failed to delete loan. Please try again.')
    } finally {
      setIsDeleting(false)
      setIsOpen(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
      >
        Delete Loan
      </button>

      <DeleteConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title="Delete Loan"
        message="Are you sure you want to delete this loan? This action cannot be undone."
        itemName={loanName}
        isDeleting={isDeleting}
      />
    </>
  )
}
