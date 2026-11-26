'use client'

import { useActionState, useEffect, useState } from 'react'
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '../ui/input-group'
import { Eye, EyeClosed } from 'lucide-react'

/**
 * Creates a FieldSet consists of email and password Field
 */
export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [state, action, isPending] = useActionState(loginAction, {})

  useEffect(() => {
    toast.dismiss()
    if (state.error) {
      toast.error(state.error.title, {
        description: state.error.detail,
        position: 'top-center',
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
            <InputGroup>
              <InputGroupInput
                id="password"
                name="password"
                type={showPassword ? undefined : 'password'}
                aria-invalid={!!state.errors?.password}
              />
              <InputGroupAddon align={'inline-end'}>
                <InputGroupButton
                  aria-label={
                    showPassword ? 'Tutup password' : 'Lihat password'
                  }
                  title={showPassword ? 'Tutup password' : 'Lihat password'}
                  size="icon-xs"
                  onClick={() => {
                    setShowPassword((p) => !p)
                  }}
                >
                  {showPassword ? <EyeClosed /> : <Eye />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
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
