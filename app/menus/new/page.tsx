'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

const CATEGORIES = ['SWEETS', 'SNACKS', 'SAVOURIES', 'COOKIES', 'PODI', 'THOKKU', 'PICKLE', 'GIFT_HAMPER']

export default function AddMenuPage() {
    const router = useRouter()
    const [branches, setBranches] = useState<any[]>([])
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'SWEETS',
        branchId: '',
        isAvailable: true
    })
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login')
            return
        }
        loadBranches()
    }, [router])

    const loadBranches = async () => {
        const result = await adminApi.getBranches()
        if (result.success) {
            setBranches(result.data)
            if (result.data.length > 0) {
                setFormData(prev => ({ ...prev, branchId: result.data[0].id }))
            }
        }
    }

    const validateForm = () => {
        const errors: Record<string, string> = {}
        if (!formData.name.trim()) errors.name = 'Name is required'
        if (!formData.price) errors.price = 'Price is required'
        if (!formData.branchId) errors.branchId = 'Branch is required'
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return

        setSubmitting(true)
        try {
            const result = await adminApi.createMenu({
                ...formData,
                price: parseFloat(formData.price)
            })

            if (result.success) {
                alert('Menu item created successfully!')
                router.push('/menus')
            } else {
                alert(result.error || 'Failed to save menu item')
            }
        } catch (error) {
            console.error('Error saving menu:', error)
            alert('An error occurred')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="container-custom py-12 fade-in">
            <div className="mb-8">
                <h1 className="mb-2">Add Menu Item</h1>
                <p className="text-gray-600">Add a new item to the menu</p>
            </div>

            <div className="card p-6 max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Branch</label>
                        <select
                            className="input-field"
                            value={formData.branchId}
                            onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                        >
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Category</label>
                        <select
                            className="input-field"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            {CATEGORIES.map(c => (
                                <option key={c} value={c}>{c.replace('_', ' ')}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Name</label>
                        <input
                            type="text"
                            className={`input-field ${formErrors.name ? 'border-red-500' : ''}`}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Price (₹)</label>
                        <input
                            type="number"
                            step="0.01"
                            className={`input-field ${formErrors.price ? 'border-red-500' : ''}`}
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                        {formErrors.price && <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            className="input-field"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.isAvailable}
                                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                            />
                            <span className="text-sm font-medium">Available</span>
                        </label>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? 'Creating...' : 'Create Item'}
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => router.push('/menus')}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
