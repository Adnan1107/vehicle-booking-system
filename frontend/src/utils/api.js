// Single source of truth for the backend URL and the auth token key.
// Previously Login.jsx / Register.jsx / VehicleList.jsx each hardcoded
// 'http://127.0.0.1:8000', which breaks the moment this is deployed.
// Set VITE_API_URL in a .env file (frontend/.env.example is provided).
export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

// Previously Login.jsx stored the token as 'access_token' while
// Navbar.jsx's logout cleared 'token' / 'access' / 'refresh' / 'user'.
// One key, used everywhere.
const TOKEN_KEY = 'access_token'
const USER_KEY = 'user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function setSession(user, token) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearSession() {
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(TOKEN_KEY)
}

export function isAuthenticated() {
  return Boolean(getToken() && getUser())
}

export function isAdmin() {
  return Boolean(getUser()?.is_staff)
}

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }

  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Token ${token}`
  }

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Unable to connect to the server. Please try again.', 0, null)
  }

  // 204 No Content etc.
  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    if (response.status === 401) {
      clearSession()
    }
    const message =
      data?.detail ||
      (data && typeof data === 'object' ? Object.values(data).flat().join(' ') : null) ||
      'Something went wrong. Please try again.'
    throw new ApiError(message, response.status, data)
  }

  return data
}

// ---- Auth ----
export const login = (username, password) =>
  request('/api/auth/login/', { method: 'POST', body: { username, password }, auth: false })

export const register = (payload) =>
  request('/api/auth/register/', { method: 'POST', body: payload, auth: false })

// ---- Vehicles ----
export const fetchVehicles = (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  return request(`/api/vehicles/${qs ? `?${qs}` : ''}`, { auth: false })
}
export const fetchVehicle = (id) => request(`/api/vehicles/${id}/`, { auth: false })

// ---- Bookings ----
export const fetchBookings = () => request('/api/bookings/')
export const fetchBooking = (id) => request(`/api/bookings/${id}/`)
export const createBooking = (payload) =>
  request('/api/bookings/', { method: 'POST', body: payload })
export const cancelBooking = (id) =>
  request(`/api/bookings/${id}/cancel/`, { method: 'POST' })

// ---- Payments ----
export const fetchPayments = () => request('/api/payments/')
export const payDemo = (paymentId) =>
  request(`/api/payments/${paymentId}/pay/`, { method: 'POST' })

async function requestForm(path, method, formData) {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Token ${token}`

  let response
  try {
    response = await fetch(`${API_URL}${path}`, { method, headers, body: formData })
  } catch {
    throw new ApiError('Unable to connect to the server. Please try again.', 0, null)
  }

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message =
      data?.detail ||
      (data && typeof data === 'object' ? Object.values(data).flat().join(' ') : null) ||
      'Something went wrong. Please try again.'
    throw new ApiError(message, response.status, data)
  }

  return data
}

// ---- Admin ----
export const fetchAdminStats = () => request('/api/admin/stats/')
export const adminSetBookingStatus = (id, statusValue) =>
  request(`/api/bookings/${id}/set-status/`, { method: 'POST', body: { status: statusValue } })

// Vehicle create/update use multipart because of the image field.
export const adminCreateVehicle = (formData) => requestForm('/api/vehicles/', 'POST', formData)
export const adminUpdateVehicle = (id, formData) => requestForm(`/api/vehicles/${id}/`, 'PATCH', formData)
export const adminDeleteVehicle = (id) => request(`/api/vehicles/${id}/`, { method: 'DELETE' })
export { ApiError }

// ---------------------------------------------------------------
// Navbar.jsx should call clearSession() from here on logout instead
// of manually removing 'token'/'access'/'refresh'/'user' — those key
// names never matched what Login.jsx actually stored.
// ---------------------------------------------------------------