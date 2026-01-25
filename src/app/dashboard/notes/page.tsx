import { getCurrentUser } from '@/lib/auth/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import NotesListWithFilter from '@/components/notes/NotesListWithFilter'
import { db } from '@/lib/db/queries'

export default async function NotesPage() {
  const { user } = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all notes for the user
  const notes = await db.notes.findByUserId(user.id, 100)

  const allNotes = notes || []

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
        <p className="text-gray-600 mt-2">
          All your transcribed recordings and meeting notes
        </p>
      </div>

      <NotesListWithFilter notes={allNotes as any} />
    </div>
  )
}
