const BASE_URL = 'https://vehicle-booking-system-9klo.onrender.com'

function normalizeList(data) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.results)) return data.results
  return []
}

/* ============================================================
   VEHICLES
============================================================ */

export async function fetchVehicles() {
  const res = await fetch(`${BASE_URL}/api/vehicles/`)

  if (!res.ok) {
    throw new Error(`Failed to fetch vehicles: ${res.status}`)
  }

  const data = await res.json()
  return normalizeList(data)
}

export async function fetchVehicle(id) {
  const res = await fetch(`${BASE_URL}/api/vehicles/${id}/`)

  if (!res.ok) {
    throw new Error(`Failed to fetch vehicle: ${res.status}`)
  }

  return res.json()
}

/* ============================================================
   BOOKINGS
============================================================ */

export async function fetchBookings() {
  const res = await fetch(`${BASE_URL}/api/bookings/`)

  if (!res.ok) {
    throw new Error(`Failed to fetch bookings: ${res.status}`)
  }

  const data = await res.json()
  return normalizeList(data)
}

export async function createBooking(payload) {
  const res = await fetch(`${BASE_URL}/api/bookings/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json()

  if (!res.ok) {
    const error = new Error('Booking failed')
    error.data = data
    throw error
  }

  return data
}

export async function cancelBooking(id) {
  const res = await fetch(`${BASE_URL}/api/bookings/${id}/cancel/`, {
    method: 'POST',
  })

  const data = await res.json()

  if (!res.ok) {
    const error = new Error('Cancel failed')
    error.data = data
    throw error
  }

  return data
}

/* ============================================================
   CUSTOMER REGISTER
============================================================ */

export async function registerCustomer(payload) {
  const res = await fetch(`${BASE_URL}/api/auth/register/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json()

  if (!res.ok) {
    const error = new Error('Registration failed')
    error.data = data
    throw error
  }

  return data
}

/* ============================================================
   CUSTOMER LOGIN
============================================================ */

export async function loginCustomer(payload) {
  const res = await fetch(`${BASE_URL}/api/auth/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json()

  if (!res.ok) {
    const error = new Error('Login failed')
    error.data = data
    throw error
  }

  return data
}

/* ============================================================
   LOGOUT
============================================================ */

export function logoutCustomer() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
}

/* ============================================================
   AUTH HELPERS
============================================================ */

export function getAccessToken() {
  return localStorage.getItem('access_token')
}

export function isLoggedIn() {
  return !!localStorage.getItem('access_token')
}

export function getCurrentUser() {
  const user = localStorage.getItem('user')

  if (!user) {
    return null
  }

  try {
    return JSON.parse(user)
  } catch {
    return null
  }
}