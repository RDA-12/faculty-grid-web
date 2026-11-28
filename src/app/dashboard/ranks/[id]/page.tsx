export const instant = false

export default async function RankDetailPage(
  props: PageProps<'/dashboard/ranks/[id]'>,
) {
  const id = (await props.params).id

  return (
    <main className="flex flex-col gap-4">
      <h1>Detail Pangkat/Golongan dengan ID {id}</h1>
      <p>IN DEVELOPMENT</p>
    </main>
  )
}
