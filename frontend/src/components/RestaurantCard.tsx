import { Link } from 'react-router-dom'
import { Star, MapPin, Clock, DollarSign, Users } from 'lucide-react'
import type { Restaurant } from '../types'
import { getPriceRange } from '../utils/helpers'

interface RestaurantCardProps {
  restaurant: Restaurant
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
    >
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {restaurant.image_url ? (
          <img
            src={restaurant.image_url}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
            <span className="text-4xl font-bold text-primary-400">{restaurant.name[0]}</span>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 flex items-center gap-1 text-sm font-semibold shadow">
          <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
          <span>{restaurant.rating.toFixed(1)}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight">{restaurant.name}</h3>
          <span className="text-gray-500 font-medium ml-2">{getPriceRange(restaurant.price_range)}</span>
        </div>
        <p className="text-sm text-primary-600 font-medium mb-2">{restaurant.cuisine_type}</p>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{restaurant.description}</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{restaurant.address}, {restaurant.city}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{restaurant.opening_time} - {restaurant.closing_time}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{restaurant.review_count} reviews</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              <span>{getPriceRange(restaurant.price_range)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
