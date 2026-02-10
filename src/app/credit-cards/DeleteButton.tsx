'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DeleteConfirmModal from '@/components/DeleteConfirmModal'

type DeleteCreditCardButtonProps = {
  id: string
  cardName: string
}

export default function DeleteCreditCardButton({ id, cardName }: DeleteCreditCardButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('credit_cards')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      router.push('/credit-cards')
      router.refresh()
    } catch (error) {
      console.error('Error deleting credit card:', error)
      alert('Failed to delete credit card. Please try again.')
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
        Delete Card
      </button>

      <DeleteConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title="Delete Credit Card"
        message="Are you sure you want to delete this credit card? This action cannot be undone."
        itemName={cardName}
        isDeleting={isDeleting}
      />
    </>
  )
}
