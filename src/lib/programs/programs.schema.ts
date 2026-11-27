import z from 'zod'
import { PaginationQuerySchema } from '../common/pagination'

export const CreateProgramSchema = z.object({
  name: z
    .string({ error: 'Form tidak valid' })
    .min(1, { error: 'Wajib diisi' }),
  facultyId: z
    .string({ error: 'Form tidak valid' })
    .min(1, { error: 'Wajib diisi' }),
})

export type CreateProgramRequest = z.infer<typeof CreateProgramSchema>

export const ProgramsQueryScheme = z
  .object({
    search: z.string().optional(),
    facultyId: z.string().optional(),
  })
  .and(PaginationQuerySchema)

export type ProgramsQueryParams = z.input<typeof ProgramsQueryScheme>
