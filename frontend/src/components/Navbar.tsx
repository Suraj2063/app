import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, ChefHat, User, LogOut, LayoutDashboard, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getInitials } from '../utils/helpers'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-primary-600 font-bold text-xl">
              <ChefHat className="h-7 w-7" />
              <span>TableEase</span>
            </Link>
            <div className="hidden md:flex ml-10 gap-6">
              <Link to="/restaurants" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                Browse Restaurants
              </Link>
              {isAuthenticated && (
                <Link to="/dashboard" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                  My Bookings
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary-600 focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-xs">
                    {getInitials(user?.full_name || 'U')}
                  </div>
                  <span className="hidden md:block">{user?.full_name}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Settings className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={() => { setUserMenuOpen(false); logout() }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="text-gray-600 hover:text-primary-600 font-medium text-sm"
                >
                  Log in
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="btn-primary text-sm"
                >
                  Sign up
                </button>
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-500 hover:text-gray-700"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-2">
          <Link
            to="/restaurants"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-gray-600 hover:text-primary-600 font-medium py-2"
          >
            Browse Restaurants
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-600 hover:text-primary-600 font-medium py-2"
            >
              My Bookings
            </Link>
          )}
          {!isAuthenticated && (
            <>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-gray-600 font-medium py-2">Log in</Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="block text-primary-600 font-medium py-2">Sign up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
