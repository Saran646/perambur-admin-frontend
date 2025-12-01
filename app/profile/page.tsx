'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { adminApi } from '@/lib/api'
import { removeToken } from '@/lib/auth'

export default function ProfilePage() {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match')
            return
        }

        setSubmitting(true)
        try {
            const updateData: any = {}
            if (formData.name) updateData.name = formData.name
            if (formData.phone) updateData.phone = formData.phone
            if (formData.newPassword) {
                updateData.currentPassword = formData.currentPassword
                updateData.newPassword = formData.newPassword
            }

            const result = await adminApi.updateProfile(updateData)

            if (result.success) {
                setSuccess('Profile updated successfully!')
                setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' })
            } else {
                setError(result.error || 'Update failed')
            }
        } catch (error) {
            setError('An error occurred')
        } finally {
            setSubmitting(false)
        }
    }

    const handleLogout = () => {
        removeToken()
        router.push('/login')
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-md">
                <div className="container-custom">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-2xl font-bold">Profile</h1>
                        <div className="flex gap-4">
                            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-orange-600">
                                Dashboard
                            </button>
                            <button onClick={handleLogout} className="text-red-600 hover:text-red-700">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-custom py-12">
                <div className="max-w-2xl mx-auto">
                    <div className="card p-6">
                        <h2 className="text-xl font-bold mb-6">Update Profile</h2>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    placeholder="Your name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="input-field"
                                    placeholder="Your phone number"
                                />
                            </div>

                            <hr className="my-6" />

                            <h3 className="font-semibold mb-4">Change Password</h3>

                            <div>
                                <label className="block text-sm font-medium mb-2">Current Password</label>
                                <input
                                    type="password"
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                    className="input-field"
                                    placeholder="Enter current password"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    className="input-field"
                                    placeholder="Enter new password"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="input-field"
                                    placeholder="Confirm new password"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary w-full"
                            >
                                {submitting ? 'Updating...' : 'Update Profile'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
