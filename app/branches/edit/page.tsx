'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { adminApi } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

interface BranchFormData {
    name: string
    address: string
    city: string
    state: string
    area: string
    phone: string
    mapLink: string
    workingHours: string
    description: string
    isActive: boolean
}

function EditBranchForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const branchId = searchParams.get('id')

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState<BranchFormData>({
        name: '',
        address: '',
        city: '',
        state: '',
        area: '',
        phone: '',
        mapLink: '',
        workingHours: '',
        description: '',
        isActive: true
    })
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login')
            return
        }
        if (!branchId) {
            router.push('/branches')
            return
        }
        fetchBranch()
    }, [router, branchId])

    const fetchBranch = async () => {
        try {
            if (!branchId) return
            const result = await adminApi.getBranch(branchId)

            if (result.success && result.data) {
                const branch = result.data
                setFormData({
                    name: branch.name || '',
                    address: branch.address || '',
                    city: branch.city || '',
                    state: branch.state || '',
                    area: branch.area || '',
                    phone: branch.phone || '',
                    mapLink: branch.mapLink || '',
                    workingHours: typeof branch.workingHours === 'string' ? branch.workingHours : JSON.stringify(branch.workingHours),
                    description: branch.description || '',
                    isActive: branch.isActive ?? true
                })
            } else {
                alert('Failed to load branch details')
            }
        } catch (error) {
            console.error('Failed to fetch branch', error)
            alert('Failed to load branch details')
        } finally {
            setLoading(false)
        }
    }

    const validateForm = () => {
        const errors: Record<string, string> = {}

        if (!formData.name.trim()) errors.name = 'Name is required'
        if (!formData.address.trim()) errors.address = 'Address is required'
        if (!formData.city.trim()) errors.city = 'City is required'
        if (!formData.state.trim()) errors.state = 'State is required'
        if (!formData.area.trim()) errors.area = 'Area is required'
        if (!formData.phone.trim()) errors.phone = 'Phone is required'
        if (!formData.mapLink.trim()) errors.mapLink = 'Map Link is required'
        if (!formData.workingHours.trim()) errors.workingHours = 'Working Hours is required'
        if (!formData.description.trim()) errors.description = 'Description is required'

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm() || !branchId) {
            return
        }

        setSubmitting(true)
        try {
            const result = await adminApi.updateBranch(branchId, formData)

            if (result.success) {
                alert('Branch updated successfully!')
                router.push('/branches')
            } else {
                alert(result.error || 'Failed to update branch')
            }
        } catch (error) {
            console.error('Error updating branch:', error)
            alert('An error occurred while updating the branch')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="container-custom py-12">
                <div className="spinner w-12 h-12 border-4 border-gray-200 border-t-orange-600 rounded-full mx-auto"></div>
            </div>
        )
    }

    return (
        <div className="container-custom py-12 fade-in">
            <div className="mb-8">
                <h1 className="mb-2">Edit Branch</h1>
                <p className="text-gray-600">Update branch information</p>
            </div>

            <div className="card p-6 max-w-4xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={`input-field ${formErrors.name ? 'border-red-500' : ''}`}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Phone <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={`input-field ${formErrors.phone ? 'border-red-500' : ''}`}
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                            {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">
                                Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={`input-field ${formErrors.address ? 'border-red-500' : ''}`}
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                            {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                City <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={`input-field ${formErrors.city ? 'border-red-500' : ''}`}
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            />
                            {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                State <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={`input-field ${formErrors.state ? 'border-red-500' : ''}`}
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            />
                            {formErrors.state && <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Area <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={`input-field ${formErrors.area ? 'border-red-500' : ''}`}
                                value={formData.area}
                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                            />
                            {formErrors.area && <p className="text-red-500 text-sm mt-1">{formErrors.area}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">
                                Map Link <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="url"
                                className={`input-field ${formErrors.mapLink ? 'border-red-500' : ''}`}
                                value={formData.mapLink}
                                onChange={(e) => setFormData({ ...formData, mapLink: e.target.value })}
                                placeholder="https://maps.google.com/..."
                            />
                            {formErrors.mapLink && <p className="text-red-500 text-sm mt-1">{formErrors.mapLink}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">
                                Working Hours <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={`input-field ${formErrors.workingHours ? 'border-red-500' : ''}`}
                                value={formData.workingHours}
                                onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                                placeholder="Mon-Sun: 10:00 AM - 10:00 PM"
                            />
                            {formErrors.workingHours && <p className="text-red-500 text-sm mt-1">{formErrors.workingHours}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                className={`input-field ${formErrors.description ? 'border-red-500' : ''}`}
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                            {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                                <span className="text-sm font-medium">Active</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={submitting}
                        >
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => router.push('/branches')}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function EditBranchPage() {
    return (
        <Suspense fallback={
            <div className="container-custom py-12">
                <div className="spinner w-12 h-12 border-4 border-gray-200 border-t-orange-600 rounded-full mx-auto"></div>
            </div>
        }>
            <EditBranchForm />
        </Suspense>
    )
}
