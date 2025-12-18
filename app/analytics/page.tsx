'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

interface Review {
    id: string
    overallRating: number
    tasteRating?: number
    serviceRating?: number
    ambienceRating?: number
    cleanlinessRating?: number
    valueRating?: number
    visitType: string
    tableNumber?: string
    visitDate?: string
    whatLiked?: string
    whatImprove?: string
    wouldRecommend?: string
    guestName?: string
    guestPhone?: string
    guestEmail?: string
    staffReply?: string
    staffReplyAt?: string
    createdAt: string
    branch: {
        id: string
        name: string
        city: string
        area: string
    }
    complaintStatus?: 'open' | 'closed'
    adminRemarks?: string
    complaintResolvedAt?: string
    complaintResolvedBy?: string
}

interface Branch {
    id: string
    name: string
}

export default function AnalyticsPage() {
    const router = useRouter()
    const [branches, setBranches] = useState<Branch[]>([])
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedBranch, setSelectedBranch] = useState<string>('all')
    const [selectedMonth, setSelectedMonth] = useState<string>('')
    const [currentPage, setCurrentPage] = useState(1)
    const reviewsPerPage = 20

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login')
            return
        }

        // Set default month to current month
        const now = new Date()
        const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        setSelectedMonth(defaultMonth)

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
        }
    }

    const fetchReviews = async () => {
        if (!selectedMonth) {
            alert('Please select a month')
            return
        }

        setLoading(true)
        try {
            const result = await adminApi.analytics.getReviews(selectedMonth, selectedBranch)
            if (result.success) {
                setReviews(result.data)
                setCurrentPage(1)
            } else {
                alert(result.error || 'Failed to fetch reviews')
            }
        } catch (error) {
            console.error('Failed to fetch analytics', error)
            alert('Failed to fetch analytics data')
        } finally {
            setLoading(false)
        }
    }

    const handleExport = () => {
        if (!selectedMonth) {
            alert('Please select a month first')
            return
        }
        adminApi.analytics.exportExcel(selectedMonth, selectedBranch)
    }

    const handleStatusChange = async (reviewId: string, newStatus: 'open' | 'closed') => {
        try {
            const review = reviews.find(r => r.id === reviewId)
            if (!review) return

            const result = await adminApi.analytics.updateComplaintStatus(reviewId, {
                status: newStatus,
                remarks: review.adminRemarks
            })

            if (result.success) {
                setReviews(reviews.map(r =>
                    r.id === reviewId ? { ...r, complaintStatus: newStatus } : r
                ))
            } else {
                alert('Failed to update status')
            }
        } catch (error) {
            console.error('Failed to update status', error)
            alert('Failed to update status')
        }
    }

    const handleRemarksSave = async (reviewId: string, remarks: string) => {
        try {
            const review = reviews.find(r => r.id === reviewId)
            if (!review) return

            const result = await adminApi.analytics.updateComplaintStatus(reviewId, {
                status: review.complaintStatus || 'open',
                remarks: remarks
            })

            if (result.success) {
                alert('Remarks saved successfully')
            } else {
                alert('Failed to save remarks')
            }
        } catch (error) {
            console.error('Failed to save remarks', error)
            alert('Failed to save remarks')
        }
    }

    // Generate list of months (last 12 months)
    const generateMonths = () => {
        const months = []
        const now = new Date()
        for (let i = 0; i < 12; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            months.push({ value, label })
        }
        return months
    }

    // Pagination
    const indexOfLastReview = currentPage * reviewsPerPage
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage
    const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview)
    const totalPages = Math.ceil(reviews.length / reviewsPerPage)

    return (
        <div className="container-custom py-12 fade-in">
            <div className="mb-8">
                <h1 className="mb-2">Analytics & Reports</h1>
                <p className="text-gray-600">Download review data and customer information for analysis</p>
            </div>

            {/* Filters */}
            <div className="card p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Filters</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Month</label>
                        <select
                            className="input-field"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            <option value="">Select Month</option>
                            {generateMonths().map(month => (
                                <option key={month.value} value={month.value}>{month.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Branch</label>
                        <select
                            className="input-field"
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                        >
                            <option value="all">All Branches</option>
                            {branches.map(branch => (
                                <option key={branch.id} value={branch.id}>{branch.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end gap-2">
                        <button
                            onClick={fetchReviews}
                            disabled={loading || !selectedMonth}
                            className="btn-primary flex-1 disabled:opacity-50"
                        >
                            {loading ? 'Loading...' : 'Apply Filters'}
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={!selectedMonth}
                            className="btn-secondary flex-1 disabled:opacity-50"
                        >
                            📥 Download Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Summary */}
            {reviews.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <p className="text-orange-900">
                        <strong>{reviews.length}</strong> reviews found for{' '}
                        <strong>{generateMonths().find(m => m.value === selectedMonth)?.label}</strong>
                        {selectedBranch !== 'all' && (
                            <> at <strong>{branches.find(b => b.id === selectedBranch)?.name}</strong></>
                        )}
                    </p>
                </div>
            )}

            {/* Reviews Table */}
            {reviews.length > 0 && (
                <>
                    <div className="card overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Review</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentReviews.map(review => (
                                    <tr key={review.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                                            {new Date(review.createdAt).toLocaleDateString('en-IN')}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="font-medium">{review.branch.name}</div>
                                            <div className="text-gray-500 text-xs">{review.branch.area}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="font-medium">{review.guestName || 'Anonymous'}</div>
                                            {review.guestEmail && (
                                                <div className="text-gray-500 text-xs">{review.guestEmail}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                                            {review.guestPhone || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${review.overallRating >= 4 ? 'bg-green-100 text-green-800' :
                                                review.overallRating === 3 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {review.overallRating}/5
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                                            {review.visitType.replace('_', ' ')}
                                        </td>
                                        <td className="px-4 py-3 text-sm max-w-xs">
                                            <div className="truncate">
                                                {review.whatLiked && `✅ ${review.whatLiked.substring(0, 50)}...`}
                                                {review.whatImprove && ` ⚠️ ${review.whatImprove.substring(0, 50)}...`}
                                                {review.wouldRecommend && ` (${review.wouldRecommend})`}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {review.overallRating <= 3 ? (
                                                <select
                                                    className={`text-xs font-medium rounded px-2 py-1 border ${(review.complaintStatus || 'open') === 'open'
                                                        ? 'bg-red-50 text-red-700 border-red-200'
                                                        : 'bg-green-50 text-green-700 border-green-200'
                                                        }`}
                                                    value={review.complaintStatus || 'open'}
                                                    onChange={(e) => handleStatusChange(review.id, e.target.value as 'open' | 'closed')}
                                                >
                                                    <option value="open">Open</option>
                                                    <option value="closed">Closed</option>
                                                </select>
                                            ) : (
                                                <span className="text-gray-400 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm min-w-[200px]">
                                            {review.overallRating <= 3 ? (
                                                <div className="flex gap-2">
                                                    <textarea
                                                        className="w-full text-xs p-1 border rounded resize-none focus:ring-1 focus:ring-orange-500 outline-none"
                                                        rows={2}
                                                        placeholder="Add remarks..."
                                                        defaultValue={review.adminRemarks || ''}
                                                        onBlur={(e) => {
                                                            if (e.target.value !== review.adminRemarks) {
                                                                // Update local state first to avoid jumping
                                                                const newReviews = reviews.map(r =>
                                                                    r.id === review.id ? { ...r, adminRemarks: e.target.value } : r
                                                                )
                                                                setReviews(newReviews)
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => handleRemarksSave(review.id, review.adminRemarks || '')}
                                                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-xs h-fit"
                                                        title="Save Remarks"
                                                    >
                                                        💾
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-6">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="btn-secondary disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="text-gray-600">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="btn-secondary disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )
            }

            {/* No Results */}
            {
                !loading && reviews.length === 0 && selectedMonth && (
                    <div className="card p-12 text-center">
                        <p className="text-gray-500 text-lg">No reviews found for the selected filters</p>
                        <p className="text-gray-400 text-sm mt-2">Try selecting a different month or branch</p>
                    </div>
                )
            }
        </div >
    )
}
