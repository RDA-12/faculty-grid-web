export const instant = false

import PageScaffold from '@/components/common/page-scaffold'
import ProgramsList from '@/components/programs/programs-list'
import ProgramsSearchBar from '@/components/programs/programs-search-bar'
import httpClient from '@/lib/common/http-client/http-client.server'
import { ProgramDegreeLevel } from '@/lib/programs/program.types'
import { getProgramsQuery } from '@/lib/programs/programs.query'
import { connection } from 'next/server'

export default async function ProgramsPage(
  props: PageProps<'/dashboard/programs'>,
) {
  await connection()
  const searchParams = (await props.searchParams) as Record<
    string,
    string | undefined
  >
  const degreeLevelParam = searchParams['degreeLevel']
  const degreeLevel = Object.values(ProgramDegreeLevel).includes(
    degreeLevelParam as ProgramDegreeLevel,
  )
    ? (degreeLevelParam as ProgramDegreeLevel)
    : undefined
  const params = {
    search: searchParams['search'] ?? undefined,
    facultyId: searchParams['facultyId'] ?? undefined,
    degreeLevel,
    page: searchParams['page'] ? Number(searchParams['page']) : undefined,
    pageSize: searchParams['pageSize']
      ? Number(searchParams['pageSize'])
      : undefined,
  }
  const result = await getProgramsQuery(httpClient, params)

  return (
    <PageScaffold
      title="Data Program Studi"
      description="Tambah, perbarui, atau hapus data program. Pilih salah satu program studi untuk melihat data lengkapnya."
      links={[
        {
          label: 'Dashboard',
          href: '/dashboard',
        },
        {
          label: 'Data Program Studi',
          href: '/dashboard/programs',
        },
      ]}
    >
      <main className="flex-1 flex flex-col gap-4 min-h-0">
        <ProgramsSearchBar initialParams={params} />
        <ProgramsList
          initial={result.error?.status === 401 ? undefined : result}
          params={params}
        />
      </main>
    </PageScaffold>
  )
}
