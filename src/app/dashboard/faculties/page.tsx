export const instant = false

import AddFacultyButton from '@/components/faculties/add-faculty-button'
import FacultiesList from '@/components/faculties/faculties-list'
import { getFacultiesAction } from '@/lib/faculties/faculties.action'
import { connection } from 'next/server'

export default async function CreateFacultyPage() {
  await connection()
  const result = await getFacultiesAction({})

  return (
    <main className="flex flex-col gap-4">
      <AddFacultyButton />
      <FacultiesList initial={result} />
    </main>
  )
}
