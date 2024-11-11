<!--Checkout.vue-->
<template>
    <div class="container mt-4">
        <h2>Checkout</h2>

        <div v-if="cartStore.cartItems.length === 0" class="alert alert-info">
            Your cart is empty
        </div>

        <div v-else>
            <!-- Display cart items -->
            <div class="cart-items mb-4">
                <div v-for="item in cartStore.cartItems" :key="item.product_id" class="card mb-2">
                    <div class="card-body">
                        <h5>{{ item.name }}</h5>
                        <p>Quantity: {{ item.quantity }}</p>
                        <p>Price: ${{ item.price }}</p>
                    </div>
                </div>
            </div>

            <div class="card mb-4">
                <div class="card-body">
                    <h4>Order Summary</h4>
                    <p>Total: ${{ cartStore.totalAmount }}</p>
                </div>
            </div>

            <button
                @click="processCheckout"
                class="btn btn-primary"
                :disabled="cartStore.loading"
            >
                {{ cartStore.loading ? 'Processing...' : 'Complete Checkout' }}
            </button>
        </div>
    </div>
</template>

<script setup>
import {onMounted} from 'vue';
import {useCartStore} from '../stores/cartStore';
import {useAuthStore} from '../stores/auth';
import {useRouter} from 'vue-router';

const cartStore = useCartStore();
const authStore = useAuthStore();
const router = useRouter();

onMounted(async () => {
    if (!authStore.isAuthenticated) {
        localStorage.setItem('redirectAfterLogin', '/checkout'); // Set redirect path
        router.push('/login');
        return;
    }
    await cartStore.initialize(); // Ensure cart items are loaded
    if (!cartStore.cartItems.length) {
        router.push('/shop');
    }
});


const processCheckout = async () => {
    try {
        await cartStore.checkout();
        alert('Checkout successful!');
        router.push('/order-confirmation');
    } catch (error) {
        alert(error.message || 'Error during checkout');
    }
}
</script>
