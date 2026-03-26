import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calendar, Clock, Users, ArrowLeft, Info } from 'lucide-react'
import { restaurantApi, bookingApi, handleApiError } from '../services/api'
import type { Restaurant, Table } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import { generateTimeSlots, formatTime } from '../utils/helpers'
import toast from 'react-hot-toast'

const bookingSchema = z.object({
  booking_date: z.string().min(1, 'Please select a date'),
  booking_time: z.string().min(1, 'Please select a time'),
  party_size: z.number().min(1, 'Party size must be at least 1').max(20, 'Maximum party size is 20'),
  table_id: z.string().min(1, 'Please select a table'),
  special_requests: z.string().optional(),
})

type BookingFormData = z.infer<typeof bookingSchema>

export default function BookingPage() {
  const { restaurantId } = useParams<{ restaurantId: string }>()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [availableTables, setAvailableTables] = useState<Table[]>([])
  const [isLoadingRestaurant, setIsLoadingRestaurant] = useState(true)
  const [isLoadingTables, setIsLoadingTables] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      party_size: 2,
      booking_date: today,
    },
  })

  const watchDate = watch('booking_date')
  const watchTime = watch('booking_time')
  const watchPartySize = watch('party_size')

  useEffect(() => {
    if (!restaurantId) return
    restaurantApi.get(restaurantId)
      .then(setRestaurant)
      .catch(() => {
        toast.error('Restaurant not found')
        navigate('/restaurants')
      })
      .finally(() => setIsLoadingRestaurant(false))
  }, [restaurantId, navigate])

  useEffect(() => {
    if (!restaurantId || !watchDate || !watchTime || !watchPartySize) return
    setIsLoadingTables(true)
    setValue('table_id', '')
    restaurantApi.getAvailableTables({
      restaurant_id: restaurantId,
      date: watchDate,
      time: watchTime,
      party_size: watchPartySize,
    }).then(setAvailableTables)
      .catch(() => setAvailableTables([]))
      .finally(() => setIsLoadingTables(false))
  }, [restaurantId, watchDate, watchTime, watchPartySize, setValue])

  const onSubmit = async (data: BookingFormData) => {
    if (!restaurantId) return
    setIsSubmitting(true)
    try {
      const booking = await bookingApi.create({
        restaurant_id: restaurantId,
        table_id: data.table_id,
        booking_date: data.booking_date,
        booking_time: data.booking_time,
        party_size: data.party_size,
        special_requests: data.special_requests,
      })
      toast.success('Booking confirmed! 🎉')
      navigate(`/bookings/${booking.id}/confirmation`)
    } catch (error) {
      toast.error(handleApiError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingRestaurant) return <LoadingSpinner className="py-32" text="Loading..." />
  if (!restaurant) return null

  const timeSlots = generateTimeSlots(restaurant.opening_time, restaurant.closing_time)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to restaurant
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Book a Table</h1>
        <p className="text-gray-500 mt-1">at {restaurant.name}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card space-y-5">
          <h2 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-500" />
            Reservation Details
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                {...register('booking_date')}
                min={today}
                className="input-field"
              />
              {errors.booking_date && <p className="text-red-500 text-xs mt-1">{errors.booking_date.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Party Size</label>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  {...register('party_size', { valueAsNumber: true })}
                  min={1}
                  max={20}
                  className="input-field"
                />
              </div>
              {errors.party_size && <p className="text-red-500 text-xs mt-1">{errors.party_size.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Select Time
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {timeSlots.map(slot => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setValue('booking_time', slot)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                    watchTime === slot
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                  }`}
                >
                  {formatTime(slot)}
                </button>
              ))}
            </div>
            {errors.booking_time && <p className="text-red-500 text-xs mt-1">{errors.booking_time.message}</p>}
          </div>
        </div>

        {watchDate && watchTime && (
          <div className="card">
            <h2 className="font-semibold text-gray-900 text-lg mb-4">Select a Table</h2>
            {isLoadingTables ? (
              <LoadingSpinner size="sm" text="Checking availability..." />
            ) : availableTables.length === 0 ? (
              <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700">No tables available for the selected time and party size. Please try a different time.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableTables.map(table => (
                  <label
                    key={table.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      watch('table_id') === table.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-200'
                    }`}
                  >
                    <input
                      type="radio"
                      value={table.id}
                      {...register('table_id')}
                      className="text-primary-600"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Table {table.table_number}</p>
                      <p className="text-sm text-gray-500">Seats {table.capacity} • {table.location}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {errors.table_id && <p className="text-red-500 text-xs mt-2">{errors.table_id.message}</p>}
          </div>
        )}

        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests (optional)</label>
          <textarea
            {...register('special_requests')}
            rows={3}
            placeholder="Any dietary requirements, special occasions, seating preferences..."
            className="input-field resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-4 text-base"
        >
          {isSubmitting ? 'Confirming Reservation...' : 'Confirm Reservation'}
        </button>
      </form>
    </div>
  )
}
