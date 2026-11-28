import z from 'zod'
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
