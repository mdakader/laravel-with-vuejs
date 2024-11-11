// stripeStore.js
import { defineStore } from 'pinia';
import axios from '../axios';
import { useCartStore } from './cartStore';  // Add this import

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

                if (!response.data?.clientSecret) {
                    throw new Error('Invalid response from server');
                }

                return response.data.clientSecret;
            } catch (error) {
                this.error = error.response?.data?.message || 'Error creating payment intent';
                console.error('Payment intent error:', error);
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

                const cartStore = useCartStore();
                await cartStore.clearCart();

                return response;
            } catch (error) {
                this.error = error.response?.data?.message || 'Error confirming payment';
                console.error('Error confirming payment:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});
