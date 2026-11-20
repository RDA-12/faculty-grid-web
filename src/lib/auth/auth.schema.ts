import z from 'zod'

export const LoginSchema = z.object({
  email: z.email('Email tidak valid').trim(),
  password: z.string().trim(),
})

export type LoginRequest = z.infer<typeof LoginSchema>
