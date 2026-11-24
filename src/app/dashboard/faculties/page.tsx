import PageScaffold from '@/components/common/page-scaffold'
import AddFacultyButton from '@/components/faculties/add-faculty-button'
import FacultiesList from '@/components/faculties/faculties-list'

export default async function CreateFacultyPage() {
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
        <FacultiesList />
      </main>
    </PageScaffold>
  )
}
