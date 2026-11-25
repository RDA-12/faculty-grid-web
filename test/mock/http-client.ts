import { vi } from 'vitest'

const httpClient = {
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}

export default httpClient
