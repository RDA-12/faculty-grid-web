import z from 'zod'
import { PaginationQuerySchema } from '../common/pagination'
import { ProgramDegreeLevel } from './program.types'

export const CreateProgramSchema = z.object({
  name: z
    .string({ error: 'Form tidak valid' })
    .min(1, { error: 'Wajib diisi' }),
  facultyId: z
    .string({ error: 'Form tidak valid' })
    .min(1, { error: 'Wajib diisi' }),
  degreeLevel: z.enum(ProgramDegreeLevel, {
    error: 'Wajib diisi',
  }),
})

export type CreateProgramRequest = z.infer<typeof CreateProgramSchema>

export const ProgramsQueryScheme = z
  .object({
    search: z.string().optional(),
    facultyId: z.string().optional(),
    degreeLevel: z.nativeEnum(ProgramDegreeLevel).optional(),
  })
  .and(PaginationQuerySchema)

export type ProgramsQueryParams = z.input<typeof ProgramsQueryScheme>
