'use client'

import { useActionState, useEffect } from 'react'
import { Button } from '../ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '../ui/field'
import { Input } from '../ui/input'
import { loginAction } from '@/lib/auth/auth.action'
import { Spinner } from '../ui/spinner'
import { toast } from 'sonner'

/**
 * Creates a FieldSet consists of email and password Field
 */
export default function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, {})

  useEffect(() => {
    if (state.error) {
      toast.error(state.error.title, {
        description: state.error.detail,
        position: 'top-center',
        duration: Infinity,
      })
    }
  }, [state.error])

  return (
    <FieldSet>
      <form action={action}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              aria-invalid={!!state.errors?.email}
              placeholder="example@email.com"
            />
            {state.errors?.email && (
              <FieldError>{state.errors?.email}</FieldError>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              aria-invalid={!!state.errors?.password}
            />
            {state.errors?.password && (
              <FieldError>{state.errors?.password}</FieldError>
            )}
          </Field>
          <Field>
            <Button type="submit" disabled={isPending} icon-data="inline-start">
              {isPending && <Spinner />} Login
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </FieldSet>
  )
}
