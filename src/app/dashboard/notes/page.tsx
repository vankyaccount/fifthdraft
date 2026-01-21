import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import NotesListWithFilter from '@/components/notes/NotesListWithFilter'

export default async function NotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all notes for the user
  const { data: notes, error } = await supabase
    .from('notes')
    .select(`
      *,
      recording:recordings(duration)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching notes:', error)
  }

  const allNotes = notes || []

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
        <p className="text-gray-600 mt-2">
          All your transcribed recordings and meeting notes
        </p>
      </div>

      <NotesListWithFilter notes={allNotes} />
    </div>
  )
}
