Checkout.vue
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

// In Checkout.vue
const processCheckout = async () => {
    try {
        const response = await cartStore.checkout();
        if (!response?.data?.order_id) {  // Adjust this based on your API response structure
            throw new Error('No order ID received from checkout');
        }

        // Navigate to confirmation page with order ID
        router.push({
            name: 'OrderConfirmation',
            params: { orderId: response.data.order_id }
        });
    } catch (error) {
        console.error('Checkout error:', error);
        alert(error.message || 'Error during checkout');
    }
};
</script>

<!--<template>-->
<!--    <div class="container mt-4">-->
<!--        <h2>Checkout</h2>-->
<!--        <div v-if="cartStore.cartItems.length === 0" class="alert alert-info">-->
<!--            Your cart is empty.-->
<!--        </div>-->
<!--        <div v-else>-->
<!--            <div class="cart-items mb-4">-->
<!--                <div v-for="item in cartStore.cartItems" :key="item.product_id" class="card mb-2">-->
<!--                    <div class="card-body">-->
<!--                        <h5>{{ item.name }}</h5>-->
<!--                        <p>Quantity: {{ item.quantity }}</p>-->
<!--                        <p>Price: ${{ item.price }}</p>-->
<!--                    </div>-->
<!--                </div>-->
<!--            </div>-->

<!--            <div class="card mb-4">-->
<!--                <div class="card-body">-->
<!--                    <h4>Order Summary</h4>-->
<!--                    <p>Total: ${{ cartStore.totalAmount }}</p>-->
<!--                </div>-->
<!--            </div>-->

<!--            <div id="payment-element"></div>-->

<!--            <button-->
<!--                @click="processPayment"-->
<!--                class="btn btn-primary mt-3"-->
<!--                :disabled="stripeStore.loading || !stripe"-->
<!--            >-->
<!--                {{ stripeStore.loading ? 'Processing...' : 'Pay Now' }}-->
<!--            </button>-->
<!--        </div>-->
<!--    </div>-->
<!--</template>-->

<!--<script setup>-->
<!--import { onMounted, ref } from 'vue';-->
<!--import { loadStripe } from '@stripe/stripe-js';-->
<!--import { useCartStore } from '../stores/cartStore';-->
<!--import { useStripeStore } from '../stores/stripeStore';-->
<!--import { useRouter } from 'vue-router';-->

<!--const cartStore = useCartStore();-->
<!--const stripeStore = useStripeStore();-->
<!--const router = useRouter();-->

<!--const stripe = ref(null);-->
<!--const elements = ref(null);-->

<!--onMounted(async () => {-->
<!--    await cartStore.initialize();-->
<!--    if (!cartStore.cartItems.length) {-->
<!--        router.push('/shop');-->
<!--    }-->
<!--    stripe.value = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);-->
<!--    await initializePaymentElement();-->
<!--});-->

<!--const initializePaymentElement = async () => {-->
<!--    try {-->
<!--        const clientSecret = await stripeStore.createPaymentIntent();-->
<!--        elements.value = stripe.value.elements({ clientSecret });-->
<!--        elements.value.create('payment').mount('#payment-element');-->
<!--    } catch (error) {-->
<!--        console.error('Error initializing payment:', error);-->
<!--    }-->
<!--};-->

<!--const processPayment = async () => {-->
<!--    try {-->
<!--        const { error } = await stripe.value.confirmPayment({-->
<!--            elements: elements.value,-->
<!--            confirmParams: { return_url: `${window.location.origin}/order/confirmation` },-->
<!--        });-->
<!--        if (error) throw new Error(error.message);-->

<!--        await stripeStore.confirmPaymentSuccess();-->
<!--        await cartStore.clearCart();-->
<!--        router.push('/order-confirmation');-->
<!--    } catch (error) {-->
<!--        alert(error.message || 'Payment failed');-->
<!--    }-->
<!--};-->
<!--</script>-->
