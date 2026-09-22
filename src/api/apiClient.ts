import { API_BASE_URL } from './config'
import { clearAuth, getStoredToken } from '../auth/authStorage'
import { ApiError, type ApiValidationError, type PaginationRequest } from './types'

type QueryValue = string | number | boolean | null | undefined
type QueryParams = Record<string, QueryValue> | PaginationRequest

export type ApiRequestOptions = Omit<RequestInit, 'body' | 'method'> & {
  query?: QueryParams
  body?: BodyInit | object | null
  /** When true, do not JSON-parse an empty/204 response. */
  emptyResponse?: boolean
  /** Skip Authorization header (e.g. login). */
  skipAuth?: boolean
}

async function parseError(response: Response): Promise<ApiError> {
  let message = 'Sorğu uğursuz oldu.'
  let errors: Record<string, string[]> = {}

  try {
    const data = (await response.json()) as ApiValidationError
    if (data.title) message = data.title
    if (data.errors) {
      errors = data.errors
      const first = Object.values(data.errors).flat()[0]
      if (first) message = first
    } else if (data.detail) {
      message = data.detail
    }
  } catch {
    // ignore non-json bodies
  }

  return new ApiError(response.status, message, errors)
}

export function buildQuery(params?: QueryParams): string {
  if (!params) return ''

  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue
    const text = String(value).trim()
    if (!text) continue
    query.set(key, text)
  }

  const qs = query.toString()
  return qs ? `?${qs}` : ''
}

function buildUrl(path: string, query?: QueryParams): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalized}${buildQuery(query)}`
}

function resolveBody(body: ApiRequestOptions['body'], headers: Headers): BodyInit | undefined {
  if (body == null) return undefined

  if (
    typeof body === 'string' ||
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body)
  ) {
    return body as BodyInit
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return JSON.stringify(body)
}

function handleUnauthorized() {
  clearAuth()
  const path = window.location.pathname
  if (!path.startsWith('/login')) {
    const redirect = encodeURIComponent(path + window.location.search)
    window.location.assign(`/login?from=${redirect}`)
  }
}

async function request<T>(
  method: string,
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { query, body, emptyResponse, skipAuth, headers: initHeaders, ...rest } =
    options
  const headers = new Headers(initHeaders)
  const resolvedBody = resolveBody(body, headers)

  if (resolvedBody instanceof FormData) {
    headers.delete('Content-Type')
  }

  if (!skipAuth) {
    const token = getStoredToken()
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: resolvedBody,
    ...rest,
  })

  if (response.status === 401 && !skipAuth) {
    handleUnauthorized()
    throw await parseError(response)
  }

  if (!response.ok) {
    throw await parseError(response)
  }

  if (
    emptyResponse ||
    response.status === 204 ||
    response.status === 205 ||
    method === 'DELETE'
  ) {
    return undefined as T
  }

  const contentType = response.headers.get('Content-Type') ?? ''
  if (!contentType.includes('application/json')) {
    return undefined as T
  }

  return (await response.json()) as T
}

export const apiClient = {
  get<T>(path: string, options?: ApiRequestOptions) {
    return request<T>('GET', path, options)
  },

  post<T>(path: string, body?: ApiRequestOptions['body'], options?: ApiRequestOptions) {
    return request<T>('POST', path, { ...options, body })
  },

  put<T>(path: string, body?: ApiRequestOptions['body'], options?: ApiRequestOptions) {
    return request<T>('PUT', path, { ...options, body })
  },

  delete(path: string, options?: ApiRequestOptions) {
    return request<void>('DELETE', path, { ...options, emptyResponse: true })
  },
}
