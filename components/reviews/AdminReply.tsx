'use client'

import { useState } from 'react'
import { adminApi } from '@/lib/api'

interface AdminReplyProps {
    reviewId: string
    branchId: string
    initialReply?: string | null
    isAdmin: boolean
    onReplyUpdated?: () => void
}

export default function AdminReply({ reviewId, branchId, initialReply, isAdmin, onReplyUpdated }: AdminReplyProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [reply, setReply] = useState(initialReply || '')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    if (!isAdmin) return null

    const handleSubmit = async () => {
        if (!reply.trim()) return

        setLoading(true)
        setError('')

        try {
            await adminApi.replyToReview(branchId, reviewId, reply)
            setIsEditing(false)
            if (onReplyUpdated) onReplyUpdated()
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    if (isEditing) {
        return (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-sm mb-2 text-gray-700">
                    {initialReply ? 'Edit Reply' : 'Write a Reply'}
                </h4>
                <textarea
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none min-h-[100px]"
                    placeholder="Write your response to this review..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    disabled={loading}
                />
                {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                <div className="flex gap-3 mt-3">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !reply.trim()}
                        className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Reply'}
                    </button>
                    <button
                        onClick={() => {
                            setIsEditing(false)
                            setReply(initialReply || '')
                            setError('')
                        }}
                        disabled={loading}
                        className="text-gray-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="mt-2">
            {!initialReply && (
                <button
                    onClick={() => setIsEditing(true)}
                    className="text-orange-600 text-sm font-medium hover:underline flex items-center gap-1"
                >
                    <span>↩️</span> Reply to review
                </button>
            )}
            {initialReply && (
                <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-500 text-xs hover:text-orange-600 mt-2"
                >
                    Edit your reply
                </button>
            )}
        </div>
    )
}
