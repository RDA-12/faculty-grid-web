import z from 'zod'
import { PaginationQuerySchema } from '../common/pagination'

export const CreateFacultySchema = z.object({
  name: z
    .string({ error: 'Form tidak valid' })
    .min(1, { error: 'Wajib diisi' }),
})

export type CreateFacultyRequest = z.infer<typeof CreateFacultySchema>

export const FacultiesQueryScheme = z
  .object({
    search: z.string().optional(),
  })
  .and(PaginationQuerySchema)

export type FacultiesQueryParams = z.input<typeof FacultiesQueryScheme>
