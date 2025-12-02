'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

interface Branch {
    id: string
    name: string
    address: string
    city: string
    state: string
    area: string
    phone: string
    mapLink: string
    workingHours: string | any // Can be string or Json from database
    description: string
    isActive: boolean
    createdAt: string
}

export default function ManageBranchesPage() {
    const router = useRouter()
    const [branches, setBranches] = useState<Branch[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login')
            return
        }
        fetchBranches()
    }, [router])

    const fetchBranches = async () => {
        try {
            const result = await adminApi.getBranches()
            if (result.success) {
                setBranches(result.data)
            }
        } catch (error) {
            console.error('Failed to fetch branches', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const result = await adminApi.deleteBranch(id)

            if (result.success) {
                await fetchBranches()
                setDeleteConfirm(null)
                alert('Branch deleted successfully!')
            } else {
                alert(result.error || 'Failed to delete branch')
            }
        } catch (error) {
            console.error('Error deleting branch:', error)
            alert('An error occurred while deleting the branch')
        }
    }

    // Helper to display working hours (handles both string and Json)
    const formatWorkingHours = (workingHours: any): string => {
        if (typeof workingHours === 'string') return workingHours
        if (typeof workingHours === 'object' && workingHours !== null) {
            return JSON.stringify(workingHours)
        }
        return 'Not specified'
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
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="mb-2">Manage Branches</h1>
                    <p className="text-gray-600">Add, edit, or remove branch locations</p>
                </div>
                <div className="flex gap-2 sm:gap-4">
                    <button
                        className="text-gray-600 hover:text-orange-600 font-medium text-sm sm:text-base"
                        onClick={() => router.push('/dashboard')}
                    >
                        Dashboard
                    </button>
                    <button
                        className="btn-primary text-sm sm:text-base whitespace-nowrap"
                        onClick={() => router.push('/branches/new')}
                    >
                        + Add New Branch
                    </button>
                </div>
            </div>

            {/* Branches List */}
            <div className="grid gap-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <h2 className="text-xl sm:text-2xl font-bold">All Branches ({branches.length})</h2>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            className={`px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'all' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-600 hover:text-gray-900'}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={`px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'active' ? 'bg-white shadow-sm text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
                            onClick={() => setFilter('active')}
                        >
                            Active
                        </button>
                        <button
                            className={`px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'inactive' ? 'bg-white shadow-sm text-red-600' : 'text-gray-600 hover:text-gray-900'}`}
                            onClick={() => setFilter('inactive')}
                        >
                            Inactive
                        </button>
                    </div>
                </div>

                {branches.length === 0 ? (
                    <div className="card p-12 text-center">
                        <p className="text-gray-500 text-lg">No branches found. Create your first branch!</p>
                    </div>
                ) : (
                    branches
                        .filter(branch => {
                            if (filter === 'active') return branch.isActive
                            if (filter === 'inactive') return !branch.isActive
                            return true
                        })
                        .map(branch => (
                            <div key={branch.id} className="card p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">{branch.name}</h3>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${branch.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {branch.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            className="btn-secondary text-sm py-2 px-4"
                                            onClick={() => router.push(`/branches/${branch.id}/edit`)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-4 rounded"
                                            onClick={() => setDeleteConfirm(branch.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">📍 {branch.address}</p>
                                        <p className="text-gray-600">🏙️ {branch.city}, {branch.state}</p>
                                        <p className="text-gray-600">📌 Area: {branch.area}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">📞 {branch.phone}</p>
                                        <p className="text-gray-600">🕒 {formatWorkingHours(branch.workingHours)}</p>
                                        <a href={branch.mapLink} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
                                            🗺️ View on Map
                                        </a>
                                    </div>
                                </div>

                                <p className="mt-4 text-gray-700">{branch.description}</p>

                                {/* Delete Confirmation Modal */}
                                {deleteConfirm === branch.id && (
                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                                            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
                                            <p className="text-gray-700 mb-6">
                                                Are you sure you want to delete <strong>{branch.name}</strong>? This action cannot be undone.
                                            </p>
                                            <div className="flex gap-4">
                                                <button
                                                    className="btn-primary bg-red-600 hover:bg-red-700"
                                                    onClick={() => handleDelete(branch.id)}
                                                >
                                                    Yes, Delete
                                                </button>
                                                <button
                                                    className="btn-secondary"
                                                    onClick={() => setDeleteConfirm(null)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                )}
            </div>
        </div>
    )
}
