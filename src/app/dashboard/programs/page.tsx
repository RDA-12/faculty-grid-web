import PageScaffold from '@/components/common/page-scaffold'
import AddProgramButton from '@/components/programs/add-program-button'

export default async function ProgramsPage(_props: PageProps<'/dashboard/programs'>) {
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
        <AddProgramButton />
        <p>Data Program Studi is in development</p>
      </main>
    </PageScaffold>
  )
}
