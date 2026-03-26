export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  role: 'customer' | 'admin' | 'restaurant_owner'
  created_at: string
  updated_at: string
}

export interface Restaurant {
  id: string
  name: string
  description: string
  cuisine_type: string
  address: string
  city: string
  state: string
  zip_code: string
  country: string
  phone: string
  email: string
  website?: string
  image_url?: string
  opening_time: string
  closing_time: string
  days_open: string[]
  price_range: 1 | 2 | 3 | 4
  rating: number
  review_count: number
  is_active: boolean
  owner_id: string
  created_at: string
  updated_at: string
}

export interface Table {
  id: string
  restaurant_id: string
  table_number: string
  capacity: number
  location: 'indoor' | 'outdoor' | 'bar' | 'private'
  status: 'available' | 'occupied' | 'reserved' | 'maintenance'
  min_capacity?: number
  description?: string
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  user_id: string
  restaurant_id: string
  table_id: string
  booking_date: string
  booking_time: string
  party_size: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  special_requests?: string
  confirmation_code: string
  created_at: string
  updated_at: string
  restaurant?: Restaurant
  table?: Table
  user?: User
}

export interface Review {
  id: string
  user_id: string
  restaurant_id: string
  booking_id?: string
  rating: number
  comment?: string
  created_at: string
  updated_at: string
  user?: User
}

export interface AdminLog {
  id: string
  admin_id: string
  action: string
  resource_type: string
  resource_id: string
  details?: Record<string, unknown>
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
  phone?: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface BookingRequest {
  restaurant_id: string
  table_id: string
  booking_date: string
  booking_time: string
  party_size: number
  special_requests?: string
}

export interface RestaurantFilters {
  search?: string
  cuisine_type?: string
  city?: string
  price_range?: number
  min_rating?: number
  date?: string
  time?: string
  party_size?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  pages: number
}

export interface ApiError {
  detail: string
  status_code?: number
}

export interface AvailabilityRequest {
  restaurant_id: string
  date: string
  time: string
  party_size: number
}

export interface DashboardStats {
  total_bookings: number
  upcoming_bookings: number
  completed_bookings: number
  cancelled_bookings: number
  total_restaurants: number
  total_users: number
  revenue_this_month: number
  bookings_today: number
}
