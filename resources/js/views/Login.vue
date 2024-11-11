<!--Login.vue-->
<template>
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">Login</div>
                <div class="card-body">
                    <form @submit.prevent="handleSubmit">
                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input v-model="email" type="email" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Password</label>
                            <input v-model="password" type="password" class="form-control" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Login</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {useAuthStore} from '../stores/auth'
import {useCartStore} from '../stores/cartStore'
import {useNotification} from '../app'
const notification = useNotification()
const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

const email = ref('')
const password = ref('')

// Login.vue
const handleSubmit = async () => {
    try {
        // Get guest cart before login
        const guestCartItems = JSON.parse(localStorage.getItem('guestCart') || '[]')

        // Login
        await auth.login({ email: email.value, password: password.value })

        // Initialize authenticated cart
        await cart.initialize()

        // If there were items in guest cart, merge them
        if (guestCartItems.length > 0) {
            for (const item of guestCartItems) {
                await cart.addToCart(item)
            }
            localStorage.removeItem('guestCart')

            // Redirect to checkout
            notification.success('Login successful')
            router.push('/cart/checkout')
        } else {
            // Normal redirect
            notification.success('Login successful')
            const redirect = localStorage.getItem('redirectAfterLogin') || '/dashboard'
            localStorage.removeItem('redirectAfterLogin')
            router.push(redirect)
        }
    } catch (error) {
        notification.error('Login failed: ' + (error.response?.data?.message || 'Please try again'))
        console.error(error)
    }
}
</script>
