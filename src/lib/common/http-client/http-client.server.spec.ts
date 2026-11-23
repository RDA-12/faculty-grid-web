import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import httpClient from './http-client.server'

vi.mock('../user-session', () => ({
  getSessionData: vi.fn().mockResolvedValue({
    accessToken: 'accessToken',
  }),
}))

describe('httpClient', () => {
  const mockResponse = {
    status: 200,
    data: {
      id: 'lol',
    },
  }
  let fetchMock = vi.fn().mockResolvedValue({
    json: async () => mockResponse,
  })

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  describe('post', () => {
    it('should do correct fetch request to backend proxy url', async () => {
      await httpClient.post('/external', {
        json: {
          name: 'lol',
        },
      })

      expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
        'http://localhost:8000/external',
        {
          headers: {
            Authorization: 'Bearer accessToken',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: 'lol' }),
          method: 'POST',
        },
      )
    })

    it('should forward formatted response', async () => {
      const result = await httpClient.post('/external', {
        headers: { Authorization: 'Bearer accessToken' },
      })

      expect(result).toStrictEqual(mockResponse)
    })
  })

  describe('get', () => {
    it('should do correct fetch request to backend url', async () => {
      await httpClient.get('/external', {})

      expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
        'http://localhost:8000/external',
        {
          headers: {
            Authorization: 'Bearer accessToken',
          },
          method: 'GET',
        },
      )
    })

    it('should do correct fetch request to backend url with params', async () => {
      await httpClient.get('/external', {}, { page: 1, pageSize: 100 })

      expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
        'http://localhost:8000/external?page=1&pageSize=100',
        {
          headers: {
            Authorization: 'Bearer accessToken',
          },
          method: 'GET',
        },
      )
    })

    it('should forward formatted response', async () => {
      const result = await httpClient.get('/external', {
        headers: { Authorization: 'Bearer accessToken' },
      })

      expect(result).toStrictEqual(mockResponse)
    })
  })
})
