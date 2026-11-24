import AddFacultyButton from '@/components/faculties/add-faculty-button'
import FacultiesList from '@/components/faculties/faculties-list'

export default async function CreateFacultyPage() {
  return (
    <main className="flex flex-col gap-4">
      <AddFacultyButton />
      <FacultiesList />
    </main>
  )
}
