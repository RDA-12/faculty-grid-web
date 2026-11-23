import z from 'zod'

export type ValidationError<T> = Partial<Record<keyof T, string>>

export type InvalidRequestError<T> = {
  errors: ValidationError<T>
}

/**
 * Return InvalidRequestError for client from zod error
 */
export function parseZodError<T>(error: z.ZodError<T>): InvalidRequestError<T> {
  const flatten = z.flattenError(error).fieldErrors
  const firstMessage = Object.entries<string[] | undefined>(flatten).map(
    ([k, v]) => [k, v?.at(0)],
  )
  const errors: ValidationError<T> = Object.fromEntries(firstMessage)
  return { errors }
}

export type ResponseError = {
  /** HTTP status code */
  status: number
  title: string
  detail: string
}

export type ActionState<TRequest, TData> = {
  /** Validation errors */
  errors?: ValidationError<TRequest>

  /** Data returned */
  data?: TData

  /** Generate error */
  error?: ResponseError
}
