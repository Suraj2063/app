import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Calendar, Clock, Users, MapPin, Copy } from 'lucide-react'
import { bookingApi } from '../services/api'
import type { Booking } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatDate, formatTime } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function BookingConfirmationPage() {
  const { id } = useParams<{ id: string }>()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    bookingApi.get(id)
      .then(setBooking)
      .catch(() => toast.error('Failed to load booking'))
      .finally(() => setIsLoading(false))
  }, [id])

  const copyConfirmationCode = () => {
    if (booking?.confirmation_code) {
      navigator.clipboard.writeText(booking.confirmation_code)
      toast.success('Confirmation code copied!')
    }
  }

  if (isLoading) return <LoadingSpinner className="py-32" text="Loading booking details..." />
  if (!booking) return null

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-500">Your table has been reserved. We'll see you soon!</p>
      </div>

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">{booking.restaurant?.name || 'Restaurant'}</h2>
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">Confirmation Code</p>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-primary-600 text-sm">{booking.confirmation_code}</span>
              <button onClick={copyConfirmationCode} className="text-gray-400 hover:text-gray-600">
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4 text-primary-400" />
            <span>{formatDate(booking.booking_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4 text-primary-400" />
            <span>{formatTime(booking.booking_time)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4 text-primary-400" />
            <span>{booking.party_size} guests</span>
          </div>
          {booking.restaurant && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4 text-primary-400" />
              <span>{booking.restaurant.city}</span>
            </div>
          )}
        </div>

        {booking.table && (
          <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
            <span className="font-medium">Table:</span> {booking.table.table_number} ({booking.table.location})
          </div>
        )}

        {booking.special_requests && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 italic">Note: {booking.special_requests}</p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 rounded-xl p-4 mb-6 text-sm text-blue-700">
        <p className="font-medium mb-1">📧 Confirmation Email Sent</p>
        <p>A confirmation has been sent to your email address. Please save your confirmation code: <strong>{booking.confirmation_code}</strong></p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/dashboard" className="btn-primary flex-1 text-center py-3">
          View My Bookings
        </Link>
        <Link to="/restaurants" className="btn-secondary flex-1 text-center py-3">
          Browse More Restaurants
        </Link>
      </div>
    </div>
  )
}
