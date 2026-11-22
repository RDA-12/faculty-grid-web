import z from 'zod'

export const CreateFacultySchema = z.object({
  name: z
    .string({ error: 'Form tidak valid' })
    .min(1, { error: 'Wajib diisi' }),
})

export type CreateFacultyRequest = z.infer<typeof CreateFacultySchema>
