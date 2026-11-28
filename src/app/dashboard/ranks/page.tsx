export const instant = false

import PageScaffold from '@/components/common/page-scaffold'
import RanksList from '@/components/rank/ranks-list'
import RanksSearchBar from '@/components/rank/ranks-search-bar'
import httpClient from '@/lib/common/http-client/http-client.server'
import { getRanksQuery } from '@/lib/rank/rank.query'
import { RankType } from '@/lib/rank/rank.types'
import { connection } from 'next/server'

export default async function RanksPage(props: PageProps<'/dashboard/ranks'>) {
  await connection()
  const searchParams = (await props.searchParams) as Record<
    string,
    string | undefined
  >
  const typeParam = searchParams['type']
  const type = Object.values(RankType).includes(typeParam as RankType)
    ? (typeParam as RankType)
    : undefined
  const params = {
    search: searchParams['search'] ?? undefined,
    type,
    page: searchParams['page'] ? Number(searchParams['page']) : undefined,
    pageSize: searchParams['pageSize']
      ? Number(searchParams['pageSize'])
      : undefined,
  }
  const result = await getRanksQuery(httpClient, params)

  return (
    <PageScaffold
      title="Data Pangkat/Golongan"
      description="Tambah, perbarui, atau hapus data pangkat/golongan."
      links={[
        {
          label: 'Dashboard',
          href: '/dashboard',
        },
        {
          label: 'Data Pangkat/Golongan',
          href: '/dashboard/ranks',
        },
      ]}
    >
      <main className="flex-1 flex flex-col gap-4 min-h-0">
        <RanksSearchBar initialParams={params} />
        <RanksList
          initial={result.error?.status === 401 ? undefined : result}
          params={params}
        />
      </main>
    </PageScaffold>
  )
}
