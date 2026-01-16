'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DeleteBNPLButton({ id }: { id: string }) {
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm('Delete this BNPL record?')) return
    await supabase.from('bnpls').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    router.refresh()
  }

  return (
    <button onClick={handleDelete} className="text-red-600 hover:text-red-800">Delete</button>
  )
}
