const API_URL = 'https://perambur-backend-production.up.railway.app';

// Get token from localStorage
const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('adminToken');
    }
    return null;
};

// API client with auth
export const adminApi = {
    // Auth
    login: async (email: string, password: string) => {
        const res = await fetch(`${API_URL}/api/admin/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return res.json();
    },

    getMe: async () => {
        const token = getToken();
        const res = await fetch(`${API_URL}/api/admin/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    updateProfile: async (data: any) => {
        const token = getToken();
        const res = await fetch(`${API_URL}/api/admin/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // Branches
    getBranches: async () => {
        const token = getToken();
        const res = await fetch(`${API_URL}/api/admin/branches`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    getBranch: async (id: string) => {
        const token = getToken();
        const res = await fetch(`${API_URL}/api/admin/branches/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.json();
    },

    createBranch: async (data: any) => {
        const token = getToken();
        const res = await fetch(`${API_URL}/api/admin/branches`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    updateBranch: async (id: string, data: any) => {
        const token = getToken();
        const res = await fetch(`${API_URL}/api/admin/branches/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    deleteBranch: async (id: string) => {
        const token = getToken();
        const res = await fetch(`${API_URL}/api/admin/branches/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    // Reviews
    getReviews: async (filters?: any) => {
        const token = getToken();
        const params = new URLSearchParams(filters || {});
        const res = await fetch(`${API_URL}/api/admin/reviews?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    replyToReview: async (branchId: string, reviewId: string, reply: string) => {
        const token = getToken();
        // Fixed: Use correct endpoint /api/admin/reviews/:id
        const res = await fetch(`${API_URL}/api/admin/reviews/${reviewId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ staffReply: reply })
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
            throw new Error(json.error || 'Failed to reply to review');
        }
        return json.data;
    },

    deleteReview: async (id: string) => {
        const token = getToken();
        const res = await fetch(`${API_URL}/api/admin/reviews/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    // Menus
    getMenus: async () => {
        const token = getToken();
        const res = await fetch(`${API_URL}/api/admin/menus`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    createMenu: async (data: any) => {
        const token = getToken();
        const res = await fetch(`${API_URL}/api/admin/menus`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    updateMenu: async (id: string, data: any) => {
        const token = getToken();
        const res = await fetch(`${API_URL}/api/admin/menus/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    deleteMenu: async (id: string) => {
        const token = getToken();
        const res = await fetch(`${API_URL}/api/admin/menus/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    // Stats
    getStats: async (filters?: any) => {
        const token = getToken();
        const params = new URLSearchParams(filters || {});
        const res = await fetch(`${API_URL}/api/admin/stats?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    }
};
