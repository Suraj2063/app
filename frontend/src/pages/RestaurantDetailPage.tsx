import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Star, MapPin, Clock, Phone, Mail, Globe, Users, ArrowLeft } from 'lucide-react'
import { restaurantApi } from '../services/api'
import type { Restaurant, Review } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import { getPriceRange, formatDate, getInitials } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      restaurantApi.get(id),
      restaurantApi.getReviews(id),
    ]).then(([r, revs]) => {
      setRestaurant(r)
      setReviews(revs)
    }).catch(() => {
      toast.error('Failed to load restaurant details')
      navigate('/restaurants')
    }).finally(() => setIsLoading(false))
  }, [id, navigate])

  if (isLoading) return <LoadingSpinner className="py-32" text="Loading restaurant..." />
  if (!restaurant) return null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to restaurants
      </button>

      {/* Hero */}
      <div className="rounded-2xl overflow-hidden h-64 md:h-80 bg-gray-200 mb-8 relative">
        {restaurant.image_url ? (
          <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
            <span className="text-8xl font-black text-primary-300">{restaurant.name[0]}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-3xl font-bold mb-1">{restaurant.name}</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded">{restaurant.cuisine_type}</span>
            <span className="font-medium">{getPriceRange(restaurant.price_range)}</span>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span>{restaurant.rating.toFixed(1)} ({restaurant.review_count} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">About</h2>
            <p className="text-gray-600 leading-relaxed">{restaurant.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-gray-700">Address</p>
                <p className="text-sm text-gray-500">{restaurant.address}</p>
                <p className="text-sm text-gray-500">{restaurant.city}, {restaurant.state} {restaurant.zip_code}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-gray-700">Hours</p>
                <p className="text-sm text-gray-500">{restaurant.opening_time} - {restaurant.closing_time}</p>
                <p className="text-sm text-gray-500">{restaurant.days_open?.join(', ')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-gray-700">Phone</p>
                <a href={`tel:${restaurant.phone}`} className="text-sm text-primary-600 hover:underline">{restaurant.phone}</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-gray-700">Email</p>
                <a href={`mailto:${restaurant.email}`} className="text-sm text-primary-600 hover:underline truncate">{restaurant.email}</a>
              </div>
            </div>
            {restaurant.website && (
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-gray-700">Website</p>
                  <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline">Visit website</a>
                </div>
              </div>
            )}
          </div>

          {/* Reviews */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="card">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold">
                        {getInitials(review.user?.full_name || 'A')}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{review.user?.full_name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-400">{formatDate(review.created_at)}</p>
                      </div>
                      <div className="ml-auto flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                    {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Make a Reservation</h3>
            <div className="space-y-3 mb-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary-400" />
                <span>Parties up to 20 guests</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary-400" />
                <span>{restaurant.opening_time} - {restaurant.closing_time}</span>
              </div>
            </div>
            {isAuthenticated ? (
              <Link
                to={`/bookings/new/${restaurant.id}`}
                className="btn-primary w-full text-center block py-3"
              >
                Book a Table
              </Link>
            ) : (
              <div>
                <Link
                  to="/login"
                  className="btn-primary w-full text-center block py-3 mb-3"
                >
                  Login to Book
                </Link>
                <p className="text-xs text-center text-gray-400">
                  <Link to="/signup" className="text-primary-600 hover:underline">Create an account</Link> to make reservations
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
