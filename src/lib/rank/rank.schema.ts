import z from 'zod'
import { PaginationQuerySchema } from '../common/pagination'
import { RankType } from './rank.types'

export const CreateRankSchema = z.object({
  name: z
    .string({ error: 'Form tidak valid' })
    .min(1, { error: 'Wajib diisi' }),
  type: z.enum(RankType, {
    error: 'Wajib diisi',
  }),
})

export type CreateRankRequest = z.infer<typeof CreateRankSchema>

export const RanksQueryScheme = z
  .object({
    search: z.string().optional(),
    type: z.enum(RankType).optional(),
  })
  .and(PaginationQuerySchema)

export type RanksQueryParams = z.input<typeof RanksQueryScheme>
