import { ActionState } from '@/lib/common/types'
import { act, render, screen, type UserEvent } from '../../../test/rtl-helper'
import LoginForm from './login-form'
import { loginAction } from '@/lib/auth/auth.action'

vi.mock('@/lib/auth/auth.action', () => ({
  loginAction: vi.fn(),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  async function clickSubmit(user: UserEvent) {
    await user.click(screen.getByRole('button', { name: /login/i }))
  }

  async function inputEmail(user: UserEvent, email: string) {
    const inputEl = screen.getByLabelText(/email/i)

    await user.type(inputEl, email)

    return inputEl
  }

  async function inputPassword(user: UserEvent, password: string) {
    const inputEl = screen.getByLabelText(/password/i)

    await user.type(inputEl, password)

    return inputEl
  }

  describe('Render', () => {
    it('should shows email field', () => {
      render(<LoginForm />)

      // Ensure input visible
      expect(screen.getByLabelText(/email/i)).toBeVisible()
      // Ensure label visible
      expect(screen.getByText('Email')).toBeVisible()
      // Ensure placeholder visible
      expect(screen.getByPlaceholderText('example@email.com')).toBeVisible()
    })

    it('should shows password field', () => {
      render(<LoginForm />)

      const inputEl = screen.getByLabelText(/password/i)
      expect(inputEl).toBeVisible()
      expect(inputEl).toHaveAttribute('type', 'password')
      expect(screen.getByText('Password')).toBeVisible()
    })

    it('should shows login button', () => {
      render(<LoginForm />)

      expect(screen.getByRole('button', { name: /login/i })).toBeVisible()
      expect(screen.getByText('Login')).toBeVisible()
    })

    it('should disbled login button and shows spinner when isPending', async () => {
      let resolveAction!: (v: ActionState<unknown, null>) => void
      vi.mocked(loginAction).mockImplementation(
        () =>
          new Promise((r) => {
            resolveAction = r
          }),
      )

      const { user } = render(<LoginForm />)

      await clickSubmit(user)

      expect(screen.getByRole('button', { name: /login/i })).toBeDisabled()
      expect(screen.getByRole('status')).toBeVisible()

      await act(async () => {
        resolveAction({ data: null })
      })

      expect(screen.getByRole('button', { name: /login/i })).not.toBeDisabled()
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('should shows error when submit with invalid email/password', async () => {
      vi.mocked(loginAction).mockResolvedValue({
        errors: {
          email: 'Invalid email',
          password: 'Invalid password',
        },
      })

      const { user } = render(<LoginForm />)

      await clickSubmit(user)

      expect(screen.getByText('Invalid email')).toBeVisible()
      expect(screen.getByText('Invalid password')).toBeVisible()
    })

    it('should shows error toast when login is failed', async () => {
      vi.mocked(loginAction).mockResolvedValue({
        error: {
          status: 401,
          title: 'Error title',
          detail: 'Error detail',
        },
      })

      const { user } = render(<LoginForm />)

      await clickSubmit(user)

      expect(await screen.findByText('Error title')).toBeVisible()
      expect(await screen.findByText('Error detail')).toBeVisible()
    })
  })

  describe('Interactions', () => {
    it('allows input email', async () => {
      const { user } = render(<LoginForm />)

      const emailInput = await inputEmail(user, 'email@email.com')

      expect(emailInput).toHaveValue('email@email.com')
    })

    it('allows input password', async () => {
      const { user } = render(<LoginForm />)

      const passwordInput = await inputEmail(user, 'password')

      expect(passwordInput).toHaveValue('password')
    })

    it('allows submit to loginAction with correct value', async () => {
      const { user } = render(<LoginForm />)

      await inputEmail(user, 'email@email.com')
      await inputPassword(user, 'password')
      await clickSubmit(user)

      const expectedFormData = new FormData()
      expectedFormData.append('email', 'email@email.com')
      expectedFormData.append('password', 'password')
      expect(loginAction).toHaveBeenCalledExactlyOnceWith({}, expectedFormData)
    })
  })
})
