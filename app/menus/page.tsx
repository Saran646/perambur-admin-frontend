'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

const CATEGORIES = ['SWEETS', 'SNACKS', 'SAVOURIES', 'COOKIES', 'PODI', 'THOKKU', 'PICKLE', 'GIFT_HAMPER']

export default function MenusPage() {
    const router = useRouter()
    const [menus, setMenus] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login')
            return
        }
        loadMenus()
    }, [router])

    const loadMenus = async () => {
        const result = await adminApi.getMenus()
        if (result.success) {
            setMenus(result.data)
        }
        setLoading(false)
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete menu item "${name}" (ID: ${id})?`)) return

        const result = await adminApi.deleteMenu(id)
        if (result.success) {
            alert('Menu item deleted')
            loadMenus()
        } else {
            alert(result.error || 'Delete failed')
        }
    }

    const grouped = menus.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = []
        acc[item.category].push(item)
        return acc
    }, {} as Record<string, any[]>)

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner w-12 h-12 border-4 border-gray-200 border-t-orange-600 rounded-full"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-md">
                <div className="container-custom">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-2xl font-bold">Manage Menus</h1>
                        <div className="flex gap-4">
                            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-orange-600">
                                Dashboard
                            </button>
                            <button onClick={() => router.push('/menus/new')} className="btn-primary">
                                + Add Menu Item
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-custom py-8 space-y-8">
                {Object.entries(grouped).map(([category, items]) => (
                    <div key={category}>
                        <h2 className="text-2xl font-bold mb-4">{category.replace('_', ' ')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(items as any[]).map((item: any) => (
                                <div key={item.id} className="card p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold">{item.name}</h3>
                                        <span className="text-orange-600 font-bold">₹{item.price}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                                    {item.branch && (
                                        <p className="text-xs text-gray-500 mb-3">📍 {item.branch.name}</p>
                                    )}
                                    <span className={`inline-block px-2 py-1 rounded text-xs mb-3 ${item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {item.isAvailable ? 'Available' : 'Unavailable'}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => router.push(`/menus/edit?id=${item.id}`)}
                                            className="btn-secondary text-sm flex-1"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id, item.name)}
                                            className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
