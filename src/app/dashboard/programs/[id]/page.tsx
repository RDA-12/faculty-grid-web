export const instant = false

export default async function ProgramDetailPage(
  props: PageProps<'/dashboard/programs/[id]'>,
) {
  const id = (await props.params).id

  return (
    <main className="flex flex-col gap-4">
      <h1>Detail Program Studi dengan ID {id}</h1>
      <p>IN DEVELOPMENT</p>
    </main>
  )
}
