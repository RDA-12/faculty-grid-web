export const instant = false

import PageScaffold from '@/components/common/page-scaffold'
import AddFacultyButton from '@/components/faculties/add-faculty-button'
import FacultiesList from '@/components/faculties/faculties-list'
import httpClient from '@/lib/common/http-client/http-client.server'
import { getFacultiesQuery } from '@/lib/faculties/faculties.query'
import { connection } from 'next/server'

export default async function FacultiesListPage() {
  await connection()
  const result = await getFacultiesQuery(httpClient)

  return (
    <PageScaffold
      title="Data Fakultas"
      description="Tambah, perbarui, atau hapus data fakultas. Pilih salah satu fakultas untuk melihat data lengkapnya."
      links={[
        {
          label: 'Dashboard',
          href: '/dashboard',
        },
        {
          label: 'Data Fakultas',
          href: '/dashboard/faculties',
        },
      ]}
    >
      <main className="flex flex-col gap-4">
        <AddFacultyButton />
        <FacultiesList
          initial={result.error?.status === 401 ? undefined : result}
        />
      </main>
    </PageScaffold>
  )
}
