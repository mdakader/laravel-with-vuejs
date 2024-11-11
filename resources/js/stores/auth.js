import { defineStore } from 'pinia'
import axios from '../axios'
import router from '../router'
import { useCartStore } from './cartStore'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem('token'),
        isLoading: true,
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        isEmailVerified: (state) => !!state.user?.email_verified_at,
    },

    actions: {
        async register(userData) {
            try {
                const response = await axios.post('/register', userData)
                this.setAuthData(response.data)
                return response
            } catch (error) {
                console.error('Registration error:', error.response?.data || error)
                throw error
            }
        },
        async login(credentials) {
            try {
                const response = await axios.post('/login', credentials)
                this.setAuthData(response.data)

                const cartStore = useCartStore()
                const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]')

                // Transfer guest cart items to authenticated user's backend cart
                for (const item of guestCart) {
                    await cartStore.addToCart(item)
                }
                localStorage.removeItem('guestCart')  // Clear guest cart after sync

                const redirect = localStorage.getItem('redirectAfterLogin') || '/dashboard'
                localStorage.removeItem('redirectAfterLogin')
                router.push(redirect)
            } catch (error) {
                console.error('Login error:', error.response?.data || error)
                throw error
            }
        },

        async logout() {
            try {
                await axios.post('/logout')
                this.clearAuthData()

                const cartStore = useCartStore()
                cartStore.clearCart()  // Reset the cart data on logout
                router.push('/login')
            } catch (error) {
                console.warn('Logout error:', error.response?.data || error)
                this.clearAuthData()
                router.push('/login')
            }
        },
        async fetchUser() {
            try {
                this.isLoading = true
                const response = await axios.get('/user')
                this.user = response.data
            } catch (error) {
                console.error('Fetch user error:', error.response?.data || error)
                this.clearAuthData() // Only clear data if fetch fails
                router.push('/login')
            } finally {
                this.isLoading = false
            }
        },
        clearAuthData() {
            this.user = null
            this.token = null
            localStorage.removeItem('token')
            delete axios.defaults.headers.common['Authorization']
        },
        setAuthData({ user, token }) {
            this.user = user
            this.token = token
            localStorage.setItem('token', token)
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        },
        updateEmailVerification(isVerified) {
            if (this.user) {
                this.user.email_verified_at = isVerified ? new Date().toISOString() : null
            }
        },
        setUser(userData) {
            this.user = userData
        },

    },
})
