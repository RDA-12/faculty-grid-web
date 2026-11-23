import { redirect } from 'next/navigation'
import { loginAction } from './auth.action'
import { getAuthResponse } from '../../../test/mock/http-response/auth.response'
import httpClient from '../common/http-client'
import { setSession } from '../common/user-session'
import { getUserResponse } from '../../../test/mock/http-response/user.response'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../common/user-session', () => ({
  setSession: vi.fn().mockImplementation(() => {}),
}))
vi.mock('../common/http-client', () => ({
  default: {
    post: vi.fn().mockImplementation(() => {
      return getAuthResponse('/auth/login', 'POST', 200)
    }),
    get: vi.fn().mockImplementation(() => {
      return getUserResponse('/users/me', 'GET', 200)
    }),
  },
}))
vi.mock('next/navigation', () => ({
  redirect: vi.fn().mockImplementation(() => {}),
}))

describe('AuthAction', () => {
  describe('loginAction', () => {
    const loginRequest = new FormData()
    loginRequest.append('email', 'email@email.com')
    loginRequest.append('password', 'password')

    it('should return errors when validation failed', async () => {
      const loginRequest = new FormData()
      loginRequest.append('email', 'invalid')
      loginRequest.append('password', 'password')

      const result = await loginAction({}, loginRequest)

      expect(result).toMatchObject({
        errors: {
          email: 'Email tidak valid',
        },
      })
    })

    it('should return error when login failed', async () => {
      const response = getAuthResponse('/auth/login', 'POST', 401)!
      vi.mocked(httpClient.post).mockImplementationOnce(async () => {
        return response
      })

      const result = await loginAction({}, loginRequest)

      expect(result).toMatchObject({
        error: response.error,
      })
    })

    it('should return error when get user failed', async () => {
      const response = getUserResponse('/users/me', 'GET', 500)!
      vi.mocked(httpClient.post).mockImplementationOnce(async () => {
        return response
      })

      const result = await loginAction({}, loginRequest)

      expect(result).toMatchObject({
        error: response.error,
      })
    })

    it('should set correct session when success', async () => {
      await loginAction({}, loginRequest)

      expect(setSession).toHaveBeenCalledExactlyOnceWith(
        getAuthResponse('/auth/login', 'POST', 200)?.data,
        getUserResponse('/users/me', 'GET', 200)?.data,
      )
    })

    it('should redirect user to / when success', async () => {
      await loginAction({}, loginRequest)

      expect(redirect).toHaveBeenCalledExactlyOnceWith('/')
    })
  })
})
