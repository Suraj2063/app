import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Lock, Save } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authApi, handleApiError } from '../services/api'
import { getInitials } from '../utils/helpers'
import toast from 'react-hot-toast'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
})

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine(d => d.new_password === d.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile')

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  })

  useEffect(() => {
    if (user) {
      profileForm.reset({
        full_name: user.full_name,
        email: user.email,
        phone: user.phone || '',
      })
    }
  }, [user, profileForm])

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const onSaveProfile = async (data: ProfileFormData) => {
    setIsSavingProfile(true)
    try {
      const updated = await authApi.updateProfile(data)
      updateUser(updated)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(handleApiError(error))
    } finally {
      setIsSavingProfile(false)
    }
  }

  const onChangePassword = async (data: PasswordFormData) => {
    setIsSavingPassword(true)
    try {
      await authApi.changePassword(data.current_password, data.new_password)
      passwordForm.reset()
      toast.success('Password changed successfully')
    } catch (error) {
      toast.error(handleApiError(error))
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile Settings</h1>

      {/* Avatar */}
      <div className="card mb-8 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold">
          {getInitials(user?.full_name || 'U')}
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 text-lg">{user?.full_name}</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full font-medium capitalize">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'profile' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <User className="h-4 w-4" />
          Profile
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'security' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Lock className="h-4 w-4" />
          Security
        </button>
      </div>

      {activeTab === 'profile' ? (
        <div className="card">
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" {...profileForm.register('full_name')} className="input-field" />
              {profileForm.formState.errors.full_name && (
                <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.full_name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" {...profileForm.register('email')} className="input-field" />
              {profileForm.formState.errors.email && (
                <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" {...profileForm.register('phone')} className="input-field" placeholder="+1 (555) 000-0000" />
            </div>
            <button type="submit" disabled={isSavingProfile} className="btn-primary flex items-center gap-2">
              <Save className="h-4 w-4" />
              {isSavingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      ) : (
        <div className="card">
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input type="password" {...passwordForm.register('current_password')} className="input-field" placeholder="••••••••" />
              {passwordForm.formState.errors.current_password && (
                <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.current_password.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" {...passwordForm.register('new_password')} className="input-field" placeholder="Min. 8 characters" />
              {passwordForm.formState.errors.new_password && (
                <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.new_password.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input type="password" {...passwordForm.register('confirm_password')} className="input-field" placeholder="••••••••" />
              {passwordForm.formState.errors.confirm_password && (
                <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.confirm_password.message}</p>
              )}
            </div>
            <button type="submit" disabled={isSavingPassword} className="btn-primary flex items-center gap-2">
              <Lock className="h-4 w-4" />
              {isSavingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
