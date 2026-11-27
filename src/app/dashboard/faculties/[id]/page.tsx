export const instant = false

export default async function FacultyDetailPage(
  props: PageProps<'/dashboard/faculties/[id]'>,
) {
  const id = (await props.params).id

  return (
    <main className="flex flex-col gap-4">
      <h1>Detail Fakultas dengan ID {id}</h1>
      <p>IN DEVELOPMENT</p>
    </main>
  )
}
