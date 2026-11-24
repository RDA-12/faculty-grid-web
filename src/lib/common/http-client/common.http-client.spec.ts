import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createHttpClient, type HTTPClient } from './common.http-client'
import type { Axios } from 'axios'

describe('httpClient', () => {
  const mockResponse = {
    status: 200,
    data: {
      id: 'lol',
    },
  }
  const mockErrorResponse = {
    status: 500,
    title: 'Title',
    detail: 'Detail',
  }

  let getMock = vi.fn().mockResolvedValue({ status: 200, data: mockResponse })
  let postMock = vi.fn().mockResolvedValue({ status: 200, data: mockResponse })
  let axiosMock = {
    get: getMock,
    post: postMock,
  }
  let httpClient: HTTPClient

  beforeEach(() => {
    httpClient = createHttpClient(axiosMock as unknown as Axios)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('post', () => {
    it('should do correct axios request to the url', async () => {
      await httpClient.post('/external', {
        headers: { Authorization: 'Bearer accessToken' },
        json: {
          name: 'lol',
        },
      })

      expect(axiosMock.post).toHaveBeenCalledExactlyOnceWith(
        '/external',
        {
          name: 'lol',
        },
        expect.objectContaining({
          headers: { Authorization: 'Bearer accessToken' },
        }),
      )
    })

    it('should forward formatted response when success', async () => {
      const result = await httpClient.post('/external', {
        headers: { Authorization: 'Bearer accessToken' },
      })

      expect(result).toStrictEqual(mockResponse)
    })

    it('should forward formatted response when failed', async () => {
      axiosMock.post.mockResolvedValueOnce({
        status: 500,
        data: mockErrorResponse,
      })

      const result = await httpClient.post('/external', {
        headers: { Authorization: 'Bearer accessToken' },
      })

      expect(result).toStrictEqual({
        status: 500,
        error: mockErrorResponse,
      })
    })
  })

  describe('get', () => {
    it('should do correct axios request to url', async () => {
      await httpClient.get('/external', {
        headers: {
          Authorization: 'Bearer accessToken',
        },
      })

      expect(axiosMock.get).toHaveBeenCalledExactlyOnceWith(
        '/external',
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer accessToken',
          },
        }),
      )
    })

    it('should do correct axios request to url with params', async () => {
      await httpClient.get('/external', {}, { page: 1, pageSize: 100 })

      expect(axiosMock.get).toHaveBeenCalledExactlyOnceWith(
        '/external?page=1&pageSize=100',
        expect.anything(),
      )
    })

    it('should forward formatted response when success', async () => {
      const result = await httpClient.get('/external', {})

      expect(result).toStrictEqual(mockResponse)
    })

    it('should forward formatted response when failed', async () => {
      axiosMock.get.mockResolvedValueOnce({
        status: 500,
        data: mockErrorResponse,
      })

      const result = await httpClient.get('/external', {})

      expect(result).toStrictEqual({
        status: 500,
        error: mockErrorResponse,
      })
    })
  })
})
