import type { ReadonlyURLSearchParams } from 'next/navigation'

type SearchParams = {
  key: string
  value: string
}

export function createQueryString(
  searchParams: ReadonlyURLSearchParams,
  params: SearchParams[],
) {
  const newParams = new URLSearchParams(searchParams.toString())
  for (let p of params) {
    newParams.set(p.key, p.value)
  }
  return newParams.toString()
}

export { cn } from 'cn'
