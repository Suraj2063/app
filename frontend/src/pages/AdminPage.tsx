import { useState, useEffect } from 'react'
import { Users, ChefHat, Calendar, TrendingUp, CheckCircle, XCircle, AlertCircle, Plus, Trash2, Edit2 } from 'lucide-react'
import { adminApi, restaurantApi, handleApiError } from '../services/api'
import type { DashboardStats, Booking, Restaurant, User } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import { formatDate, formatTime } from '../utils/helpers'
import toast from 'react-hot-toast'

type AdminTab = 'overview' | 'bookings' | 'restaurants' | 'users'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [statsData, bookingsData, restaurantsData, usersData] = await Promise.all([
        adminApi.getStats(),
        adminApi.listAllBookings(1, 20),
        adminApi.listAllRestaurants(1, 20),
        adminApi.listUsers(1, 20),
      ])
      setStats(statsData)
      setBookings(bookingsData.items)
      setRestaurants(restaurantsData.items)
      setUsers(usersData.items)
    } catch (error) {
      toast.error(handleApiError(error))
    } finally {
      setIsLoading(false)
    }
  }

  const updateBookingStatus = async (id: string, status: string) => {
    try {
      await adminApi.updateBookingStatus(id, status)
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: status as Booking['status'] } : b))
      toast.success('Booking status updated')
    } catch (error) {
      toast.error(handleApiError(error))
    }
  }

  const deleteRestaurant = async (id: string) => {
    if (!confirm('Are you sure you want to delete this restaurant?')) return
    try {
      await restaurantApi.delete(id)
      setRestaurants(prev => prev.filter(r => r.id !== id))
      toast.success('Restaurant deleted')
    } catch (error) {
      toast.error(handleApiError(error))
    }
  }

  const tabs: { key: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'overview', label: 'Overview', icon: TrendingUp },
    { key: 'bookings', label: 'Bookings', icon: Calendar },
    { key: 'restaurants', label: 'Restaurants', icon: ChefHat },
    { key: 'users', label: 'Users', icon: Users },
  ]

  if (isLoading) return <LoadingSpinner className="py-32" text="Loading admin dashboard..." />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your restaurant booking platform</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === key ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Bookings', value: stats.total_bookings, icon: Calendar, color: 'bg-blue-50 text-blue-700' },
              { label: 'Today\'s Bookings', value: stats.bookings_today, icon: TrendingUp, color: 'bg-green-50 text-green-700' },
              { label: 'Total Restaurants', value: stats.total_restaurants, icon: ChefHat, color: 'bg-purple-50 text-purple-700' },
              { label: 'Total Users', value: stats.total_users, icon: Users, color: 'bg-orange-50 text-orange-700' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className={`rounded-xl p-5 ${color}`}>
                <Icon className="h-6 w-6 mb-2" />
                <div className="text-3xl font-bold">{value}</div>
                <div className="text-sm font-medium mt-1">{label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Upcoming', value: stats.upcoming_bookings, icon: AlertCircle, color: 'text-yellow-600 bg-yellow-50' },
              { label: 'Completed', value: stats.completed_bookings, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
              { label: 'Cancelled', value: stats.cancelled_bookings, icon: XCircle, color: 'text-red-600 bg-red-50' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className={`card flex items-center gap-4 ${color}`}>
                <Icon className="h-8 w-8" />
                <div>
                  <div className="text-2xl font-bold">{value}</div>
                  <div className="text-sm font-medium">{label} Bookings</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Bookings</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Code', 'Restaurant', 'Guest', 'Date & Time', 'Party', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map(booking => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{booking.confirmation_code}</td>
                    <td className="px-4 py-3 font-medium">{booking.restaurant?.name || '-'}</td>
                    <td className="px-4 py-3">{booking.user?.full_name || '-'}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(booking.booking_date)} {formatTime(booking.booking_time)}
                    </td>
                    <td className="px-4 py-3">{booking.party_size}</td>
                    <td className="px-4 py-3"><StatusBadge status={booking.status} /></td>
                    <td className="px-4 py-3">
                      <select
                        value={booking.status}
                        onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-md px-2 py-1"
                      >
                        {['pending', 'confirmed', 'cancelled', 'completed', 'no_show'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && (
              <div className="text-center py-8 text-gray-500">No bookings found</div>
            )}
          </div>
        </div>
      )}

      {/* Restaurants Tab */}
      {activeTab === 'restaurants' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">All Restaurants</h2>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Restaurant
            </button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name', 'Cuisine', 'City', 'Rating', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {restaurants.map(restaurant => (
                  <tr key={restaurant.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{restaurant.name}</td>
                    <td className="px-4 py-3 text-gray-500">{restaurant.cuisine_type}</td>
                    <td className="px-4 py-3 text-gray-500">{restaurant.city}</td>
                    <td className="px-4 py-3">⭐ {restaurant.rating.toFixed(1)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={restaurant.is_active ? 'available' : 'maintenance'} label={restaurant.is_active ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteRestaurant(restaurant.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {restaurants.length === 0 && (
              <div className="text-center py-8 text-gray-500">No restaurants found</div>
            )}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Users</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name', 'Email', 'Phone', 'Role', 'Joined'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{user.full_name}</td>
                    <td className="px-4 py-3 text-gray-500">{user.email}</td>
                    <td className="px-4 py-3 text-gray-500">{user.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="badge badge-info capitalize">{user.role}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(user.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-8 text-gray-500">No users found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
