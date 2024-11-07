import {defineStore} from 'pinia'
import axios from '../axios'
import router from '../router'

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
                this.user = response.data.user
                this.token = response.data.token
                localStorage.setItem('token', this.token)
                return response
            } catch (error) {
                console.error('Registration error:', error.response?.data || error)
                throw error
            }
        },
        async login(credentials) {
            try {
                const response = await axios.post('/login', credentials)
                this.user = response.data.user
                this.token = response.data.token
                localStorage.setItem('token', this.token)

                // Redirect based on email verification status
                if (!this.user.email_verified_at) {
                    router.push('/verify-email')
                } else {
                    router.push('/dashboard')
                }

                return response
            } catch (error) {
                console.error('Login error:', error)
                throw error
            }
        },
        async logout() {
            try {
                await axios.post('/logout')
                this.clearAuthData() // This will clear the token and user data
                router.push('/login')
            } catch (error) {
                this.clearAuthData() // Also call it here in case of an error
                router.push('/login')
            }
        },
        async fetchUser() {
            try {
                this.isLoading = true
                const response = await axios.get('/user')
                this.user = response.data
            } catch (error) {
                console.error('Fetch user error:', error) // Debug log
                this.clearAuthData()
                router.push('/login')
            } finally {
                this.isLoading = false
            }
        },
        clearAuthData() {
            this.user = null
            this.token = null
            localStorage.removeItem('token')
        },
        updateEmailVerification(isVerified) {
            if (this.user) {
                this.user.email_verified_at = isVerified ? new Date().toISOString() : null;
            }
        },
        setUser(userData) {
            this.user = userData;
        },
    },
})
