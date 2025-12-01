'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { adminApi } from '@/lib/api'
import { isAuthenticated, removeToken } from '@/lib/auth'

interface DashboardStats {
    totalBranches: number
    totalReviews: number
    averageRating: number
}

interface Branch {
    id: string
    name: string
    area: string
}

export default function AdminDashboard() {
    const router = useRouter()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [branches, setBranches] = useState<Branch[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedArea, setSelectedArea] = useState<string>('All')
    const [selectedBranch, setSelectedBranch] = useState<string>('All')

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login')
            return
        }
        fetchData()
    }, [router])

    const handleLogout = () => {
        removeToken()
        router.push('/login')
    }

    const fetchData = async (area?: string, branch?: string) => {
        try {
            const params: any = {}
            if (area && area !== 'All') params.area = area
            if (branch && branch !== 'All') params.branchId = branch

            const [statsData, branchesData] = await Promise.all([
                adminApi.getStats(params),
                adminApi.getBranches()
            ])

            if (statsData.success) setStats(statsData.data)
            if (branchesData.success) setBranches(branchesData.data)
        } catch (error) {
            console.error('Failed to fetch dashboard data', error)
            if (error instanceof Error && error.message.includes('401')) {
                router.push('/login')
            }
        } finally {
            setLoading(false)
        }
    }

    const areas = ['All', ...Array.from(new Set(branches.map(b => b.area || 'Chennai')))]
    const filteredBranches = selectedArea === 'All'
        ? branches
        : branches.filter(b => (b.area || 'Chennai') === selectedArea)

    if (loading) {
        return (
            <div className="container-custom py-12">
                <div className="spinner w-12 h-12 border-4 border-gray-200 border-t-orange-600 rounded-full mx-auto"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-md mb-8">
                <div className="container-custom">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-2xl font-bold text-orange-900">Admin Dashboard</h1>
                        <button onClick={handleLogout} className="text-red-600 hover:text-red-700 font-medium">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="container-custom pb-12 fade-in">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-xl font-bold mb-2">Overview</h2>
                        <p className="text-gray-600">Manage your restaurant review platform</p>
                    </div>

                    <div className="flex gap-4">
                        <select
                            className="input-field py-2"
                            value={selectedArea}
                            onChange={(e) => {
                                setSelectedArea(e.target.value)
                                setSelectedBranch('All')
                            }}
                        >
                            <option value="All">All Areas</option>
                            {areas.filter(a => a !== 'All').map(area => (
                                <option key={area} value={area}>{area}</option>
                            ))}
                        </select>

                        <select
                            className="input-field py-2"
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                        >
                            <option value="All">All Branches</option>
                            {filteredBranches.map(branch => (
                                <option key={branch.id} value={branch.id}>{branch.name}</option>
                            ))}
                        </select>

                        <button
                            className="btn-primary py-2 px-4"
                            onClick={() => {
                                setLoading(true)
                                fetchData(selectedArea, selectedBranch)
                            }}
                        >
                            Apply Filter
                        </button>
                    </div>
                </div>

                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="card p-6">
                            <p className="text-gray-600 text-sm mb-1">Total Branches</p>
                            <p className="text-4xl font-bold text-orange-600">{stats.totalBranches}</p>
                        </div>
                        <div className="card p-6">
                            <p className="text-gray-600 text-sm mb-1">Total Reviews</p>
                            <p className="text-4xl font-bold text-orange-600">{stats.totalReviews}</p>
                        </div>
                        <div className="card p-6">
                            <p className="text-gray-600 text-sm mb-1">Average Rating</p>
                            <p className="text-4xl font-bold text-orange-600">{stats.averageRating.toFixed(1)}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link href="/branches" className="card p-6 hover:shadow-lg transition-shadow">
                        <h3 className="text-xl font-semibold mb-2">🏪 Manage Branches</h3>
                        <p className="text-gray-600">Add, edit, or remove branch locations</p>
                    </Link>

                    <Link href="/reviews" className="card p-6 hover:shadow-lg transition-shadow">
                        <h3 className="text-xl font-semibold mb-2">⭐ Recent Reviews</h3>
                        <p className="text-gray-600">View and respond to customer reviews</p>
                    </Link>

                    <Link href="/profile" className="card p-6 hover:shadow-lg transition-shadow">
                        <h3 className="text-xl font-semibold mb-2">👤 Profile</h3>
                        <p className="text-gray-600">Update your account details</p>
                    </Link>
                </div>

                {(selectedArea !== 'All' || selectedBranch !== 'All') && (
                    <div className="mt-8 card p-6 bg-green-50">
                        <p className="text-sm text-green-700">
                            <strong>Active Filters:</strong>
                            {selectedArea !== 'All' && ` Area: ${selectedArea}`}
                            {selectedBranch !== 'All' && ` • Branch: ${branches.find(b => b.id === selectedBranch)?.name}`}
                            <button
                                className="ml-4 text-green-800 underline hover:no-underline"
                                onClick={() => {
                                    setSelectedArea('All')
                                    setSelectedBranch('All')
                                    setLoading(true)
                                    fetchData()
                                }}
                            >
                                Clear Filters
                            </button>
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
