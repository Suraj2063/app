import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { restaurantApi } from '../services/api'
import type { Restaurant, RestaurantFilters } from '../types'
import RestaurantCard from '../components/RestaurantCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { CUISINE_TYPES } from '../utils/helpers'
import toast from 'react-hot-toast'

const PRICE_RANGES = [
  { value: '', label: 'Any Price' },
  { value: '1', label: '$ (Budget)' },
  { value: '2', label: '$$ (Moderate)' },
  { value: '3', label: '$$$ (Upscale)' },
  { value: '4', label: '$$$$ (Fine Dining)' },
]

export default function RestaurantsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState<RestaurantFilters>({
    search: searchParams.get('search') || '',
    cuisine_type: searchParams.get('cuisine_type') || '',
    city: searchParams.get('city') || '',
    price_range: searchParams.get('price_range') ? Number(searchParams.get('price_range')) : undefined,
    min_rating: searchParams.get('min_rating') ? Number(searchParams.get('min_rating')) : undefined,
  })

  const [searchInput, setSearchInput] = useState(filters.search || '')

  const loadRestaurants = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await restaurantApi.list(filters, page, 12)
      setRestaurants(response.items)
      setTotal(response.total)
    } catch {
      toast.error('Failed to load restaurants')
    } finally {
      setIsLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    loadRestaurants()
  }, [loadRestaurants])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters(prev => ({ ...prev, search: searchInput }))
    setPage(1)
  }

  const updateFilter = (key: keyof RestaurantFilters, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({})
    setSearchInput('')
    setSearchParams({})
    setPage(1)
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  const perPage = 12
  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Restaurant</h1>
        <p className="text-gray-500">Discover and book tables at the best restaurants near you</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search restaurants, cuisine, location..."
            className="input-field pl-10"
          />
        </form>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary flex items-center gap-2 ${activeFilterCount > 0 ? 'border-primary-500 text-primary-600' : ''}`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden md:block">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="btn-secondary flex items-center gap-1 text-red-500 border-red-200">
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Type</label>
              <select
                value={filters.cuisine_type || ''}
                onChange={(e) => updateFilter('cuisine_type', e.target.value)}
                className="input-field"
              >
                <option value="">All Cuisines</option>
                {CUISINE_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={filters.city || ''}
                onChange={(e) => updateFilter('city', e.target.value)}
                placeholder="Enter city..."
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
              <select
                value={filters.price_range || ''}
                onChange={(e) => updateFilter('price_range', e.target.value ? Number(e.target.value) : undefined)}
                className="input-field"
              >
                {PRICE_RANGES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
              <select
                value={filters.min_rating || ''}
                onChange={(e) => updateFilter('min_rating', e.target.value ? Number(e.target.value) : undefined)}
                className="input-field"
              >
                <option value="">Any Rating</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Cuisine quick-filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {['Italian', 'Japanese', 'Mexican', 'Indian', 'American', 'Chinese', 'French', 'Thai'].map(cuisine => (
          <button
            key={cuisine}
            onClick={() => updateFilter('cuisine_type', filters.cuisine_type === cuisine ? '' : cuisine)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filters.cuisine_type === cuisine
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
            }`}
          >
            {cuisine}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <LoadingSpinner className="py-20" text="Finding restaurants..." />
      ) : restaurants.length === 0 ? (
        <div className="text-center py-20">
          <Search className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No restaurants found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
          <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">{total} restaurant{total !== 1 ? 's' : ''} found</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary disabled:opacity-40"
              >
                Previous
              </button>
              <span className="flex items-center text-sm text-gray-600 px-4">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
