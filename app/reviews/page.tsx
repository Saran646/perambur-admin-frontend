'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdminReply from '@/components/reviews/AdminReply'
import { adminApi } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

interface Branch {
    id: string
    name: string
    area: string
}

interface Review {
    id: string
    branchId: string
    overallRating: number
    tasteRating?: number
    serviceRating?: number
    ambienceRating?: number
    cleanlinessRating?: number
    valueRating?: number
    visitType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'
    tableNumber?: string
    visitDate?: string
    whatLiked?: string
    whatImprove?: string
    wouldRecommend?: string
    guestName?: string
    guestPhone?: string
    guestEmail?: string
    createdAt: string
    staffReply?: string
    staffReplyAt?: string
    user?: {
        name: string
        email: string
        phone?: string
    }
    branch: {
        name: string
        area?: string
    }
}

export default function AdminReviewsPage() {
    const router = useRouter()
    const [reviews, setReviews] = useState<Review[]>([])
    const [branches, setBranches] = useState<Branch[]>([])
    const [loading, setLoading] = useState(true)

    const [selectedArea, setSelectedArea] = useState<string>('All')
    const [selectedBranch, setSelectedBranch] = useState<string>('All')
    const [selectedVisitType, setSelectedVisitType] = useState<string>('All')

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login')
            return
        }
        fetchData()
    }, [router])

    const fetchData = async () => {
        try {
            setLoading(true)

            const params: any = {}
            if (selectedBranch && selectedBranch !== 'All') {
                params.branchId = selectedBranch
            }
            if (selectedVisitType && selectedVisitType !== 'All') {
                params.visitType = selectedVisitType
            }
            params.limit = '100'

            const [reviewsData, branchesData] = await Promise.all([
                adminApi.getReviews(params),
                adminApi.getBranches()
            ])

            if (reviewsData.success) {
                let filteredReviews = reviewsData.data

                if (selectedArea && selectedArea !== 'All') {
                    filteredReviews = filteredReviews.filter((r: Review) =>
                        (r.branch.area || 'Chennai') === selectedArea
                    )
                }

                setReviews(filteredReviews)
            }
            if (branchesData.success) setBranches(branchesData.data)

        } catch (error) {
            console.error('Failed to fetch reviews', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApplyFilters = () => {
        fetchData()
    }

    const handleDeleteReview = async (id: string) => {
        if (!confirm(`Are you sure you want to delete this review? (ID: ${id})`)) return

        try {
            await adminApi.deleteReview(id)
            fetchData()
        } catch (error) {
            console.error('Failed to delete review', error)
            alert('Failed to delete review')
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
        <div className="container-custom py-12 fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="mb-2">Recent Reviews</h1>
                    <p className="text-gray-600">View and respond to customer reviews</p>
                </div>
                <button
                    className="text-gray-600 hover:text-orange-600 font-medium"
                    onClick={() => router.push('/dashboard')}
                >
                    Dashboard
                </button>
            </div>

            <div className="card p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Filters</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Area</label>
                        <select
                            className="input-field py-2"
                            value={selectedArea}
                            onChange={(e) => {
                                setSelectedArea(e.target.value)
                                setSelectedBranch('All')
                            }}
                        >
                            {areas.map(area => (
                                <option key={area} value={area}>{area}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Branch</label>
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
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Review Type</label>
                        <select
                            className="input-field py-2"
                            value={selectedVisitType}
                            onChange={(e) => setSelectedVisitType(e.target.value)}
                        >
                            <option value="All">All Types</option>
                            <option value="DINE_IN">Dine-in</option>
                            <option value="TAKEAWAY">Takeaway</option>
                            <option value="DELIVERY">Delivery</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            className="btn-primary py-2 px-6 w-full"
                            onClick={handleApplyFilters}
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>

                {(selectedArea !== 'All' || selectedBranch !== 'All' || selectedVisitType !== 'All') && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-700">
                            <strong>Active Filters:</strong>
                            {selectedArea !== 'All' && ` Area: ${selectedArea}`}
                            {selectedBranch !== 'All' && ` • Branch: ${branches.find(b => b.id === selectedBranch)?.name}`}
                            {selectedVisitType !== 'All' && ` • Type: ${selectedVisitType}`}
                            <button
                                className="ml-4 text-green-800 underline hover:no-underline"
                                onClick={() => {
                                    setSelectedArea('All')
                                    setSelectedBranch('All')
                                    setSelectedVisitType('All')
                                    setTimeout(handleApplyFilters, 100)
                                }}
                            >
                                Clear All
                            </button>
                        </p>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    Reviews ({reviews.length})
                </h2>

                {reviews.length === 0 ? (
                    <div className="card p-12 text-center">
                        <p className="text-gray-500 text-lg">No reviews found matching your filters.</p>
                    </div>
                ) : (
                    reviews.map(review => (
                        <div key={review.id} className="card p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-lg">
                                            {review.guestName || review.user?.name || 'Anonymous'}
                                        </h3>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${review.visitType === 'DINE_IN' ? 'bg-blue-100 text-blue-800' :
                                            review.visitType === 'TAKEAWAY' ? 'bg-orange-100 text-orange-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                            {review.visitType === 'DINE_IN' ? '🍽️ Dine-in' :
                                                review.visitType === 'TAKEAWAY' ? '🥡 Takeaway' :
                                                    '🛵 Delivery'}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500 space-y-1">
                                        <p>{review.branch.name} • {new Date(review.createdAt).toLocaleDateString()}</p>
                                        {(review.guestPhone || review.user?.phone) && (
                                            <p className="flex items-center gap-1">
                                                📞 {review.guestPhone || review.user?.phone}
                                            </p>
                                        )}
                                        {review.tableNumber && (
                                            <p className="flex items-center gap-1">
                                                🪑 Table: {review.tableNumber}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                                        <span className="text-2xl">
                                            {review.overallRating === 1 ? '😠' :
                                                review.overallRating === 2 ? '☹️' :
                                                    review.overallRating === 3 ? '😐' :
                                                        review.overallRating === 4 ? '🙂' : '😍'}
                                        </span>
                                        <span className="font-bold text-gray-900">{review.overallRating}/5</span>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteReview(review.id)}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4 space-y-3">
                                {review.visitDate && (
                                    <p className="text-sm text-gray-600">📅 Visit Date: {new Date(review.visitDate).toLocaleDateString()}</p>
                                )}
                                {review.whatLiked && (
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <p className="text-sm font-semibold text-green-900 mb-1">What they liked:</p>
                                        <p className="text-gray-700 whitespace-pre-wrap">{review.whatLiked}</p>
                                    </div>
                                )}
                                {review.whatImprove && (
                                    <div className="bg-yellow-50 p-3 rounded-lg">
                                        <p className="text-sm font-semibold text-yellow-900 mb-1">Suggested improvements:</p>
                                        <p className="text-gray-700 whitespace-pre-wrap">{review.whatImprove}</p>
                                    </div>
                                )}
                                {review.wouldRecommend && (
                                    <p className="text-sm text-gray-600">💬 Would recommend: <strong>{review.wouldRecommend}</strong></p>
                                )}
                            </div>

                            {(review.tasteRating || review.serviceRating || review.ambienceRating || review.cleanlinessRating || review.valueRating) && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    {review.tasteRating && <div>Taste: {review.tasteRating}/5</div>}
                                    {review.serviceRating && <div>Service: {review.serviceRating}/5</div>}
                                    {review.ambienceRating && <div>Ambience: {review.ambienceRating}/5</div>}
                                    {review.cleanlinessRating && <div>Cleanliness: {review.cleanlinessRating}/5</div>}
                                    {review.valueRating && <div>Value: {review.valueRating}/5</div>}
                                </div>
                            )}

                            {review.staffReply && (
                                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-4">
                                    <p className="text-sm font-semibold text-orange-900 mb-1">Your Reply:</p>
                                    <p className="text-orange-800">{review.staffReply}</p>
                                    {review.staffReplyAt && (
                                        <p className="text-xs text-orange-600 mt-2">
                                            Replied on {new Date(review.staffReplyAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="border-t pt-4 mt-4">
                                <AdminReply
                                    reviewId={review.id}
                                    branchId={review.branchId}
                                    initialReply={review.staffReply}
                                    isAdmin={true}
                                    onReplyUpdated={fetchData}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
