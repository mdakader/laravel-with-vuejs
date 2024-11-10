import { defineStore } from 'pinia';
import axios from '../axios';
import { useAuthStore } from './auth'; // Make sure this is the correct path

export const useCartStore = defineStore('cart', {
    state: () => ({
        cartItems: [],
        cartCount: 0,
        loading: false,
        error: null
    }),

    getters: {
        totalAmount: (state) => {
            return state.cartItems.reduce((total, item) => {
                return total + (item.price * item.quantity);
            }, 0).toFixed(2);
        }
    },

    actions: {
        async getCartCount() {
            try {
                const response = await axios.get('/cart');
                this.cartItems = response.data.items || [];
                this.cartCount = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
            } catch (error) {
                console.error('Error fetching cart:', error);
            }
        },

        async addToCart({ product_id, quantity, product }) {
            const authStore = useAuthStore(); // Get the authentication store instance
            try {
                this.loading = true;
                this.error = null;

                const response = await axios.post('/cart/add', {
                    product_id,
                    quantity
                });

                if (authStore.isAuthenticated) {
                    await this.getCartCount();
                } else {
                    // For guest users, store complete product info
                    this.addToGuestCart(product_id, quantity, product);
                }

                return response;
            } catch (error) {
                this.error = error.response?.data?.message || 'Error adding to cart';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Guest cart methods with product info
        async addToGuestCart(productId, quantity, product) {
            if (!product) {
                console.error("Product data is missing in guest cart");
                return;
            }
            const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');

            const existingItem = guestCart.find(item => item.product_id === productId);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                guestCart.push({
                    product_id: productId,
                    quantity,
                    name: product.name || "Unnamed Product",
                    price: product.price || 0,
                    image: product.image || '/placeholder.jpg'
                });
            }

            localStorage.setItem('guestCart', JSON.stringify(guestCart));
            this.loadGuestCart();
        },

        loadGuestCart() {
            const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
            this.cartItems = guestCart;
            this.cartCount = guestCart.reduce((sum, item) => sum + item.quantity, 0);
        },

        updateGuestQuantity(productId, quantity) {
            const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
            const item = guestCart.find(item => item.product_id === productId);
            if (item) {
                item.quantity = quantity;
                localStorage.setItem('guestCart', JSON.stringify(guestCart));
                this.loadGuestCart();
            }
        },

        removeGuestItem(productId) {
            let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
            guestCart = guestCart.filter(item => item.product_id !== productId);
            localStorage.setItem('guestCart', JSON.stringify(guestCart));
            this.loadGuestCart();
        },

        // Authenticated cart methods
        async updateQuantity(productId, quantity) {
            try {
                await axios.put('/cart/update-quantity', {
                    product_id: productId,
                    quantity: quantity
                });
                await this.getCartCount();
            } catch (error) {
                console.error('Error updating quantity:', error);
                throw error;
            }
        },

        async removeItem(productId) {
            try {
                await axios.delete(`/cart/remove/${productId}`);
                await this.getCartCount();
            } catch (error) {
                console.error('Error removing item:', error);
                throw error;
            }
        },

        clearCart() {
            this.cartItems = [];
            this.cartCount = 0;
            localStorage.removeItem('guestCart');
        },

        async checkout() {
            const authStore = useAuthStore();

            // Check if user is logged in
            if (!authStore.isAuthenticated) {
                // Store current path for redirect after login
                localStorage.setItem('redirectAfterLogin', '/checkout');
                router.push('/login');
                return;
            }

            try {
                this.loading = true;
                const response = await axios.post('/cart/checkout');
                this.clearCart();
                return response;
            } catch (error) {
                this.error = error.response?.data?.message || 'Error during checkout';
                throw error;
            } finally {
                this.loading = false;
            }
        },
    }
});
