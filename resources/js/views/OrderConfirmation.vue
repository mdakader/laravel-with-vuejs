<template>
    <div class="container mt-4">
        <h2>Order Confirmation</h2>

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

            <!-- Add items list -->
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
import axios from '../axios';

const route = useRoute();
const router = useRouter();
const orderId = ref(route.params.orderId);
const loading = ref(true);
const errorMessage = ref(null);
const orderInfo = ref(null);

const formattedDate = (date) => {
    return new Date(date).toLocaleDateString();
};

const fetchOrderDetails = async () => {
    try {
        const response = await axios.get(`/order/confirmation/${orderId.value}`);
        if (!response.data?.order) {
            throw new Error('Invalid order data received');
        }
        orderInfo.value = response.data.order;
        loading.value = false;
    } catch (error) {
        console.error('Error fetching order details:', error);
        errorMessage.value = "Unable to fetch order details. Please try again later.";
        loading.value = false;
    }
};

onMounted(async () => {
    if (!orderId.value) {
        errorMessage.value = "Order ID is missing. Please check your order details.";
        loading.value = false;
        return;
    }

    await fetchOrderDetails();
});
</script>
