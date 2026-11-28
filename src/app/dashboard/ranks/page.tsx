import PageScaffold from '@/components/common/page-scaffold'
import AddRankButton from '@/components/rank/add-rank-button'

export default async function RanksPage(_props: PageProps<'/dashboard/ranks'>) {
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
        <AddRankButton />
        <p>Data Pangkat/Golongan is in development</p>
      </main>
    </PageScaffold>
  )
}
