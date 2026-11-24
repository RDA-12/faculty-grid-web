export const instant = false

import AddFacultyButton from '@/components/faculties/add-faculty-button'
import FacultiesList from '@/components/faculties/faculties-list'
import httpClient from '@/lib/common/http-client/http-client.server'
import { getFacultiesQuery } from '@/lib/faculties/faculties.query'
import { connection } from 'next/server'

export default async function CreateFacultyPage() {
  await connection()
  const result = await getFacultiesQuery(httpClient)

  return (
    <main className="flex flex-col gap-4">
      <AddFacultyButton />
      <FacultiesList initial={result} />
    </main>
  )
}
