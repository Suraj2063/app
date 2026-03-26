import axios, { AxiosError } from 'axios'
import toast from 'react-hot-toast'
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Restaurant,
  RestaurantFilters,
  Table,
  Booking,
  BookingRequest,
  User,
  Review,
  PaginatedResponse,
  DashboardStats,
  AvailabilityRequest,
} from '../types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail: string }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const formData = new URLSearchParams()
    formData.append('username', data.email)
    formData.append('password', data.password)
    const response = await api.post<AuthResponse>('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return response.data
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data)
    return response.data
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me')
    return response.data
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<User>('/auth/me', data)
    return response.data
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.put('/auth/me/password', { current_password: currentPassword, new_password: newPassword })
  },
}

// Restaurants
export const restaurantApi = {
  list: async (filters?: RestaurantFilters, page = 1, perPage = 12): Promise<PaginatedResponse<Restaurant>> => {
    const params = { ...filters, page, per_page: perPage }
    const response = await api.get<PaginatedResponse<Restaurant>>('/restaurants', { params })
    return response.data
  },

  get: async (id: string): Promise<Restaurant> => {
    const response = await api.get<Restaurant>(`/restaurants/${id}`)
    return response.data
  },

  create: async (data: Partial<Restaurant>): Promise<Restaurant> => {
    const response = await api.post<Restaurant>('/restaurants', data)
    return response.data
  },

  update: async (id: string, data: Partial<Restaurant>): Promise<Restaurant> => {
    const response = await api.put<Restaurant>(`/restaurants/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/restaurants/${id}`)
  },

  getTables: async (id: string): Promise<Table[]> => {
    const response = await api.get<Table[]>(`/restaurants/${id}/tables`)
    return response.data
  },

  getAvailableTables: async (request: AvailabilityRequest): Promise<Table[]> => {
    const response = await api.get<Table[]>(`/restaurants/${request.restaurant_id}/available-tables`, {
      params: {
        date: request.date,
        time: request.time,
        party_size: request.party_size,
      },
    })
    return response.data
  },

  getReviews: async (id: string): Promise<Review[]> => {
    const response = await api.get<Review[]>(`/restaurants/${id}/reviews`)
    return response.data
  },
}

// Tables
export const tableApi = {
  create: async (restaurantId: string, data: Partial<Table>): Promise<Table> => {
    const response = await api.post<Table>(`/restaurants/${restaurantId}/tables`, data)
    return response.data
  },

  update: async (id: string, data: Partial<Table>): Promise<Table> => {
    const response = await api.put<Table>(`/tables/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tables/${id}`)
  },
}

// Bookings
export const bookingApi = {
  create: async (data: BookingRequest): Promise<Booking> => {
    const response = await api.post<Booking>('/bookings', data)
    return response.data
  },

  list: async (page = 1, perPage = 10): Promise<PaginatedResponse<Booking>> => {
    const response = await api.get<PaginatedResponse<Booking>>('/bookings', {
      params: { page, per_page: perPage },
    })
    return response.data
  },

  get: async (id: string): Promise<Booking> => {
    const response = await api.get<Booking>(`/bookings/${id}`)
    return response.data
  },

  cancel: async (id: string): Promise<Booking> => {
    const response = await api.put<Booking>(`/bookings/${id}/cancel`)
    return response.data
  },

  update: async (id: string, data: Partial<Booking>): Promise<Booking> => {
    const response = await api.put<Booking>(`/bookings/${id}`, data)
    return response.data
  },
}

// Admin
export const adminApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/admin/stats')
    return response.data
  },

  listUsers: async (page = 1, perPage = 20): Promise<PaginatedResponse<User>> => {
    const response = await api.get<PaginatedResponse<User>>('/admin/users', {
      params: { page, per_page: perPage },
    })
    return response.data
  },

  listAllBookings: async (page = 1, perPage = 20): Promise<PaginatedResponse<Booking>> => {
    const response = await api.get<PaginatedResponse<Booking>>('/admin/bookings', {
      params: { page, per_page: perPage },
    })
    return response.data
  },

  listAllRestaurants: async (page = 1, perPage = 20): Promise<PaginatedResponse<Restaurant>> => {
    const response = await api.get<PaginatedResponse<Restaurant>>('/admin/restaurants', {
      params: { page, per_page: perPage },
    })
    return response.data
  },

  updateBookingStatus: async (id: string, status: string): Promise<Booking> => {
    const response = await api.put<Booking>(`/admin/bookings/${id}/status`, { status })
    return response.data
  },
}

// Reviews
export const reviewApi = {
  create: async (restaurantId: string, data: { rating: number; comment?: string; booking_id?: string }): Promise<Review> => {
    const response = await api.post<Review>(`/restaurants/${restaurantId}/reviews`, data)
    return response.data
  },
}

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.detail || error.message
    if (Array.isArray(message)) {
      return message.map((m: { msg: string }) => m.msg).join(', ')
    }
    return message || 'An unexpected error occurred'
  }
  return 'An unexpected error occurred'
}

export const withToast = async <T>(
  promise: Promise<T>,
  successMessage: string,
  errorMessage?: string
): Promise<T> => {
  try {
    const result = await promise
    toast.success(successMessage)
    return result
  } catch (error) {
    const message = errorMessage || handleApiError(error)
    toast.error(message)
    throw error
  }
}

export default api
