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

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

const email = ref('')
const password = ref('')

// Login.vue
const handleSubmit = async () => {
    try {
        await auth.login({ email: email.value, password: password.value });

        // Remove this line as it's clearing the cart unnecessarily
        // cart.clearCart();

        // Get guest cart items before initializing
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');

        // Initialize cart to get server cart items
        await cart.initialize();

        // If there are guest cart items, merge them with server cart
        if (guestCart.length > 0) {
            for (const item of guestCart) {
                await cart.addToCart({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    product: { name: item.name, price: item.price, image: item.image }
                });
            }
            localStorage.removeItem('guestCart');
        }

        const notification = useNotification();
        notification.success('Login successful');

        const redirect = localStorage.getItem('redirectAfterLogin') || '/dashboard';
        localStorage.removeItem('redirectAfterLogin');
        router.push(redirect);
    } catch (error) {
        const notification = useNotification();
        notification.error('Login failed: ' + (error.response?.data?.message || 'Please try again'));
        console.error(error);
    }
};
</script>
