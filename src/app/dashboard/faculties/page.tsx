export const instant = false

import PageScaffold from '@/components/common/page-scaffold'
import FacultiesList from '@/components/faculties/faculties-list'
import FacultiesSearchBar from '@/components/faculties/faculties-search-bar'
import httpClient from '@/lib/common/http-client/http-client.server'
import { getFacultiesQuery } from '@/lib/faculties/faculties.query'
import { connection } from 'next/server'

export default async function FacultiesListPage(
  props: PageProps<'/dashboard/faculties'>,
) {
  await connection()
  const searchParams = (await props.searchParams) as Record<
    string,
    string | undefined
  >
  const params = {
    search: searchParams['search'] ?? undefined,
    page: searchParams['page'] ? Number(searchParams['page']) : undefined,
    pageSize: searchParams['pageSize']
      ? Number(searchParams['pageSize'])
      : undefined,
  }
  const result = await getFacultiesQuery(httpClient, params)

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
        <FacultiesSearchBar />
        <FacultiesList
          initial={result.error?.status === 401 ? undefined : result}
          params={params}
        />
      </main>
    </PageScaffold>
  )
}
