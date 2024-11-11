<template>
    <div class="container mt-4">
        <div class="order-confirmation-card-title d-flex justify-content-between align-content-center">
            <h2>Order Confirmation</h2>
            <button class="btn btn-success btn-sm m-2"><router-link class="nav-link" to="/shop">Back to shop</router-link></button>
        </div>
        <div v-if="loading" class="alert alert-info">
            Loading order details...
        </div>

        <div v-else-if="errorMessage" class="alert alert-danger">
            {{ errorMessage }}
        </div>

        <div v-else class="alert alert-success">
            Your payment was successful! Thank you for your order.
        </div>

        <div v-if="orderInfo && !loading && !errorMessage">
            <h4>Order Details</h4>

            <p><strong>Order ID:</strong> {{ orderInfo.id }}</p>
            <p><strong>Total:</strong> ${{ orderInfo.total }}</p>
            <p><strong>Date:</strong> {{ formattedDate(orderInfo.date) }}</p>

            <div class="order-items mt-4">
                <h5>Order Items</h5>
                <div v-for="item in orderInfo.items" :key="item.name" class="card mb-2">
                    <div class="card-body">
                        <h6>{{ item.name }}</h6>
                        <p>Quantity: {{ item.quantity }}</p>
                        <p>Price: ${{ item.price }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStripeStore } from '../stores/stripeStore';
import { useCartStore } from '../stores/cartStore';  // Add this import
import axios from '../axios';

const props = defineProps({
    paymentIntent: String,
    paymentIntentClientSecret: String,
    redirectStatus: String
});

const route = useRoute();
const router = useRouter();
const stripeStore = useStripeStore();
const cartStore = useCartStore();  // Initialize cartStore
const loading = ref(true);
const errorMessage = ref(null);
const orderInfo = ref(null);

const formattedDate = (date) => {
    return new Date(date).toLocaleDateString();
};

const handlePaymentSuccess = async () => {
    try {
        // Confirm payment success with backend
        const response = await stripeStore.confirmPaymentSuccess();
        if (response?.data?.order_id) {
            await fetchOrderDetails(response.data.order_id);
        } else {
            throw new Error('No order ID received');
        }
    } catch (error) {
        console.error('Error handling payment success:', error);
        errorMessage.value = "Error processing payment confirmation.";
        loading.value = false;
    }
};

const fetchOrderDetails = async (orderId) => {
    try {
        const response = await axios.get(`/order/confirmation/${orderId}`);
        if (!response.data?.order) {
            throw new Error('Invalid order data received');
        }
        orderInfo.value = response.data.order;
    } catch (error) {
        console.error('Error fetching order details:', error);
        errorMessage.value = "Unable to fetch order details. Please try again later.";
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    if (props.redirectStatus === 'succeeded' && props.paymentIntent) {
        await handlePaymentSuccess();
    } else {
        errorMessage.value = "Invalid payment status";
        loading.value = false;
    }
});
</script>
