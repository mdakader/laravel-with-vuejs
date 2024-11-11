// stripeStore.js
import { defineStore } from 'pinia';
import axios from '../axios';

export const useStripeStore = defineStore('stripe', {
    state: () => ({
        loading: false,
        error: null,
    }),
    actions: {

        async createPaymentIntent() {
            try {
                this.loading = true;
                this.error = null;
                const response = await axios.post('/stripe/payment-intent');
                return {
                    clientSecret: response.data.clientSecret,
                    orderId: response.data.orderId, // Ensure the server sends back an orderId
                };
            } catch (error) {
                this.error = error.response?.data?.message || 'Error creating payment intent';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async confirmPaymentSuccess() {
            try {
                this.loading = true;
                this.error = null;
                const response = await axios.post('/stripe/payment-success');

                // Check for orderId in response
                if (!response.data?.order_id) {
                    throw new Error('No order ID received from server');
                }

                const cartStore = useCartStore();
                cartStore.clearCart();

                return response.data.order_id;
            } catch (error) {
                this.error = error.response?.data?.message || 'Error confirming payment';
                console.error('Error confirming payment:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        }
    },
});
