'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DeleteFDButton({ id }: { id: string }) {
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm('Delete this fixed deposit?')) return

    await supabase
      .from('fixed_deposits')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    router.refresh()
  }

  return (
    <button onClick={handleDelete} className="text-red-600 hover:text-red-800">
      Delete
    </button>
  )
}
