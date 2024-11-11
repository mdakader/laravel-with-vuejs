<template>
    <div class="container mt-4">
        <div class="checkout-card-title d-flex justify-content-between align-content-center">
            <h2>Checkout</h2>
            <button class="btn btn-success btn-sm m-2"><router-link class="nav-link" to="/shop">Back to shop</router-link></button>
        </div>

        <div v-if="error" class="alert alert-danger">
            {{ error }}
        </div>

        <div v-if="cartStore.cartItems.length === 0" class="alert alert-info">
            Your cart is empty.
        </div>

        <div v-else>
            <!-- Cart items display -->
            <div class="cart-items mb-4">
                <div v-for="item in cartStore.cartItems" :key="item.product_id" class="card mb-2">
                    <div class="card-body">
                        <h5>{{ item.name }}</h5>
                        <p>Quantity: {{ item.quantity }}</p>
                        <p>Price: ${{ item.price }}</p>
                    </div>
                </div>
            </div>

            <!-- Order summary -->
            <div class="card mb-4">
                <div class="card-body">
                    <h4>Order Summary</h4>
                    <p>Total: ${{ cartStore.totalAmount }}</p>
                </div>
            </div>

            <!-- Payment element -->
            <div id="payment-element" class="mb-3"></div>

            <button
                @click="processPayment"
                class="btn btn-primary"
                :disabled="isProcessing || !stripe"
            >
                {{ isProcessing ? 'Processing...' : 'Pay Now' }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { loadStripe } from '@stripe/stripe-js';
import { useCartStore } from '../stores/cartStore';
import { useStripeStore } from '../stores/stripeStore';
import { useRouter } from 'vue-router';

const cartStore = useCartStore();
const stripeStore = useStripeStore();
const router = useRouter();

const stripe = ref(null);
const elements = ref(null);
const error = ref(null);
const isProcessing = ref(false);

onMounted(async () => {
    try {
        await cartStore.initialize();

        if (!cartStore.cartItems.length) {
            router.push('/shop');
            return;
        }

        stripe.value = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
        await initializePaymentElement();
    } catch (err) {
        error.value = err.message || 'Failed to initialize checkout';
    }
});

const initializePaymentElement = async () => {
    try {
        error.value = null;
        const clientSecret = await stripeStore.createPaymentIntent();

        elements.value = stripe.value.elements({
            clientSecret,
            appearance: {
                theme: 'stripe',
            },
        });

        const paymentElement = elements.value.create('payment');
        paymentElement.mount('#payment-element');
    } catch (err) {
        error.value = err.message || 'Failed to initialize payment form';
        console.error('Payment initialization error:', err);
    }
};

const processPayment = async () => {
    if (isProcessing.value) return;

    try {
        isProcessing.value = true;
        error.value = null;

        const { error: paymentError } = await stripe.value.confirmPayment({
            elements: elements.value,
            confirmParams: {
                return_url: `${window.location.origin}/order/confirmation`,
            },
        });

        if (paymentError) {
            throw new Error(paymentError.message);
        }

        await stripeStore.confirmPaymentSuccess();
        await cartStore.clearCart();

        // Success - redirect handled by Stripe return_url
    } catch (err) {
        error.value = err.message || 'Payment failed';
        console.error('Payment error:', err);
    } finally {
        isProcessing.value = false;
    }
};
</script>
