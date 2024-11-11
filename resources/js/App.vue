<!--App.vue-->
<template>
    <ul class="container header-section">
        <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4">
            <ul class="container text-center">
                <router-link class="navbar-brand ms-3" to="/">App</router-link>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <ul class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto me-3">
                        <li class="nav-item">
                            <router-link class="nav-link" to="/shop">Shop</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link class="nav-link" to="/cart/checkout">Checkout</router-link>
                        </li>
                            <!-- Cart Icon with Count -->
                        <!-- Cart Icon with Count -->
                        <li class="nav-item position-relative">
                            <router-link class="nav-link" to="/cart">
                                <i class="bi bi-cart-plus"></i>
                                <span v-if="cart.cartCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                   Cart {{ cart.cartCount }}
                                </span>
                            </router-link>
                        </li>

                            <div class="d-inline-flex" v-if="!auth.isAuthenticated">
                                <li class="nav-item">
                                    <router-link class="nav-link" to="/login">Login</router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link class="nav-link" to="/register">Register</router-link>
                                </li>


                            </div>

                            <div class="d-inline-flex" v-if="auth.isAuthenticated">
                                <router-link class="nav-link" to="/posts">Blog Posts</router-link>
                                <router-link class="nav-link" to="/categories">Categories</router-link>
                                <router-link class="nav-link" to="/products">Products</router-link>
                                <router-link class="nav-link" to="/profile">Profile</router-link>
                                <router-link class="nav-link" to="/dashboard">Dashboard</router-link>
                                <a @click.prevent="handleLogout" class="nav-link" href="#">Logout</a>
                            </div>
                        </ul>
                    </ul>
                </ul>
        </nav>

        <router-view></router-view>
    </ul>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useCartStore } from './stores/cartStore'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()

onMounted(async () => {
    try {
        if (!auth.token && localStorage.getItem('token')) {
            auth.token = localStorage.getItem('token')
        }

        if (auth.token) {
            await auth.fetchUser()
            if (!auth.isEmailVerified) {
                router.push('/verify-email')
            }
        }

        // Initialize cart regardless of auth status
        await cart.initializeAndRefresh();

    } catch (error) {
        console.error('Authentication error:', error)
        auth.clearAuthData()
        router.push('/login')
    }
})

const handleLogout = async () => {
    try {
        await auth.logout()
        cart.reset() // Reset cart on logout
    } catch (error) {
        console.error('Logout error:', error)
    } finally {
        router.push('/login')
    }
}
</script>
