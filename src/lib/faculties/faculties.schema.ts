import z from 'zod'

export const CreateFacultySchema = z.object({
  name: z.string({ error: 'Form tidak valid' }),
})

export type CreateFacultyRequest = z.infer<typeof CreateFacultySchema>
