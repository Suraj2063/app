import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, Users, MapPin, Plus, ChefHat } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { bookingApi } from '../services/api'
import type { Booking } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import { formatDate, formatTime } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      const response = await bookingApi.list(1, 50)
      setBookings(response.items)
    } catch {
      toast.error('Failed to load bookings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    setCancellingId(id)
    try {
      await bookingApi.cancel(id)
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
      toast.success('Booking cancelled successfully')
    } catch {
      toast.error('Failed to cancel booking')
    } finally {
      setCancellingId(null)
    }
  }

  const now = new Date()
  const upcomingBookings = bookings.filter(b => {
    const bookingDate = new Date(`${b.booking_date}T${b.booking_time}`)
    return bookingDate >= now && (b.status === 'confirmed' || b.status === 'pending')
  })
  const pastBookings = bookings.filter(b => {
    const bookingDate = new Date(`${b.booking_date}T${b.booking_time}`)
    return bookingDate < now || b.status === 'completed' || b.status === 'cancelled' || b.status === 'no_show'
  })

  const displayBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.full_name}!</p>
        </div>
        <Link to="/restaurants" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Booking
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Bookings', value: bookings.length, color: 'bg-blue-50 text-blue-700' },
          { label: 'Upcoming', value: upcomingBookings.length, color: 'bg-green-50 text-green-700' },
          { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, color: 'bg-purple-50 text-purple-700' },
          { label: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, color: 'bg-red-50 text-red-700' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl p-4 ${stat.color}`}>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm font-medium mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'upcoming' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Upcoming ({upcomingBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'past' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Past ({pastBookings.length})
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner className="py-16" text="Loading your bookings..." />
      ) : displayBookings.length === 0 ? (
        <div className="text-center py-16">
          <ChefHat className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {activeTab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
          </h3>
          <p className="text-gray-500 mb-6">
            {activeTab === 'upcoming' ? 'Ready to find your next dining experience?' : 'Your past bookings will appear here.'}
          </p>
          {activeTab === 'upcoming' && (
            <Link to="/restaurants" className="btn-primary">Browse Restaurants</Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayBookings.map((booking) => (
            <div key={booking.id} className="card hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {booking.restaurant?.name || 'Restaurant'}
                    </h3>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-primary-400" />
                      <span>{formatDate(booking.booking_date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary-400" />
                      <span>{formatTime(booking.booking_time)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-primary-400" />
                      <span>{booking.party_size} guests</span>
                    </div>
                    {booking.restaurant && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-primary-400" />
                        <span className="truncate">{booking.restaurant.city}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className="text-xs text-gray-400">Confirmation: </span>
                    <span className="text-xs font-mono font-semibold text-gray-700">{booking.confirmation_code}</span>
                  </div>
                  {booking.special_requests && (
                    <p className="text-xs text-gray-500 mt-1 italic">Note: {booking.special_requests}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancellingId === booking.id}
                      className="btn-danger text-sm"
                    >
                      {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                  {booking.restaurant && (
                    <Link
                      to={`/restaurants/${booking.restaurant_id}`}
                      className="btn-secondary text-sm"
                    >
                      View Restaurant
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
