const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

type HTTPError = {
  title: string
  detail: string
  errors?: unknown
}

type HTTPResponse<T> = {
  error?: HTTPError
  data?: T
}

type HTTPOptions = {
  json?: unknown
} & Omit<RequestInit, 'method' | 'body'>

async function post<T>(
  endpoint: string,
  options: HTTPOptions = {},
): Promise<HTTPResponse<T>> {
  const { json, headers, ...rest } = options
  const effectiveHeaders =
    headers instanceof Array
      ? Object.fromEntries(headers)
      : (headers as Record<string, string>)

  const response = await fetch(apiUrl + endpoint, {
    method: 'POST',
    ...rest,
    headers: {
      ...effectiveHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(json),
  })

  const jsonResponse = await response.json()
  if (!response.ok) {
    return {
      error: jsonResponse,
    }
  }

  return {
    data: jsonResponse.data as T,
  }
}

async function get<T>(
  endpoint: string,
  options: Omit<HTTPOptions, 'json'> = {},
): Promise<HTTPResponse<T>> {
  const response = await fetch(apiUrl + endpoint, {
    method: 'GET',
    ...options,
  })

  const jsonResponse = await response.json()
  if (!response.ok) {
    return {
      error: jsonResponse,
    }
  }

  return {
    data: jsonResponse.data as T,
  }
}

const httpClient = {
  post: post,
  get: get,
}

export default httpClient
