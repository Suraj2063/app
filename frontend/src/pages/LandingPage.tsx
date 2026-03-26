import { useNavigate } from 'react-router-dom'
import { Search, Star, Clock, ChefHat, Shield, Smartphone } from 'lucide-react'
import { useState } from 'react'

const FEATURED_CUISINES = ['Italian', 'Japanese', 'Mexican', 'Indian', 'American', 'Chinese', 'French', 'Thai']

const TESTIMONIALS = [
  { name: 'Sarah M.', comment: 'TableEase made our anniversary dinner perfect! Easy to book and the restaurant was exactly as described.', rating: 5 },
  { name: 'James K.', comment: 'I use this app every week. The interface is clean and booking is instant. Highly recommended!', rating: 5 },
  { name: 'Priya R.', comment: 'Great variety of restaurants and the special requests feature is super helpful. Love it!', rating: 4 },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/restaurants?search=${encodeURIComponent(searchQuery)}`)
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80')] bg-cover bg-center opacity-20"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Reserve Your Perfect
              <span className="text-primary-400"> Dining Experience</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Discover thousands of restaurants, check real-time availability, and book your table in seconds. No more waiting on hold.
            </p>
            <form onSubmit={handleSearch} className="flex gap-3 max-w-xl">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search restaurants, cuisine, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button type="submit" className="btn-primary px-6 py-3 rounded-xl whitespace-nowrap">
                Find Tables
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary-600 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10,000+', label: 'Restaurants' },
              { value: '500,000+', label: 'Happy Diners' },
              { value: '1M+', label: 'Bookings Made' },
              { value: '4.8/5', label: 'Average Rating' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-primary-200 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Cuisine */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse by Cuisine</h2>
          <p className="text-gray-500 mb-8">Explore restaurants by your favorite cuisine type</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {FEATURED_CUISINES.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => navigate(`/restaurants?cuisine_type=${cuisine}`)}
                className="group relative h-24 rounded-xl overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 hover:from-primary-100 hover:to-primary-200 border border-primary-100 transition-all hover:shadow-md"
              >
                <span className="text-primary-800 font-semibold text-lg">{cuisine}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How TableEase Works</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Book your table in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Search, step: '1', title: 'Search', desc: 'Find restaurants by cuisine, location, date, or party size.' },
              { icon: Clock, step: '2', title: 'Choose a Time', desc: 'Select available time slots that work best for you.' },
              { icon: ChefHat, step: '3', title: 'Enjoy Your Meal', desc: 'Arrive at the restaurant and enjoy your reserved table.' },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="text-4xl font-black text-primary-100 mb-2">{step}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Star, title: 'Verified Reviews', desc: 'Read genuine reviews from real diners to make informed choices.' },
              { icon: Shield, title: 'Secure Booking', desc: 'Your personal data is protected with enterprise-grade security.' },
              { icon: Smartphone, title: 'Mobile Friendly', desc: 'Book from anywhere using our responsive mobile-optimized interface.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Diners Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm mb-4 italic">"{t.comment}"</p>
                <p className="font-semibold text-gray-900">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Book Your Next Dining Experience?</h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of happy diners who use TableEase to discover and book amazing restaurants.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/restaurants')} className="bg-white text-primary-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-lg transition-colors">
              Browse Restaurants
            </button>
            <button onClick={() => navigate('/signup')} className="bg-primary-700 hover:bg-primary-800 text-white font-semibold px-8 py-3 rounded-lg border border-primary-500 transition-colors">
              Create Account
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
