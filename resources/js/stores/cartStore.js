// stores/cartStore.js
import { defineStore } from 'pinia';
import axios from '../axios';
import { useAuthStore } from './auth';

export const useCartStore = defineStore('cart', {
    state: () => ({
        cartItems: [],
        cartCount: 0,
        loading: false,
        error: null,
        initialized: false
    }),

    getters: {
        totalAmount(state) {
            return state.cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
        }
    },

    actions: {
        async initialize() {
            if (this.initialized) return;

            const auth = useAuthStore();
            try {
                this.loading = true;
                if (auth.isAuthenticated) {
                    const response = await axios.get('/cart');
                    this.cartItems = response.data.items || [];
                } else {
                    this.loadGuestCart();
                }
                this.updateCartCount();
                this.initialized = true;
            } catch (error) {
                console.error('Cart initialization error:', error);
            } finally {
                this.loading = false;
            }
        },

        async refreshCart() {
            const auth = useAuthStore();
            try {
                if (auth.isAuthenticated) {
                    const response = await axios.get('/cart');
                    if (response.data.items) {
                        this.cartItems = response.data.items;
                        this.updateCartCount();
                    }
                }
            } catch (error) {
                console.error('Error refreshing cart:', error);
            }
        },

        async addToCart({ product_id, quantity, product }) {
            const auth = useAuthStore();
            try {
                this.loading = true;

                if (auth.isAuthenticated) {
                    const response = await axios.post('/cart/add', {
                        product_id,
                        quantity
                    });

                    if (response.data.items) {
                        this.cartItems = response.data.items;
                        this.updateCartCount();
                    }
                } else {
                    this.addToGuestCart(product_id, quantity, product);
                }
            } catch (error) {
                console.error('Error adding to cart:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        addToGuestCart(product_id, quantity, product) {
            const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
            const existingItem = guestCart.find(item => item.product_id === product_id);

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                guestCart.push({
                    product_id,
                    quantity,
                    name: product.name,
                    price: product.price,
                    image: product.image
                });
            }

            localStorage.setItem('guestCart', JSON.stringify(guestCart));
            this.loadGuestCart();
        },

        loadGuestCart() {
            const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
            this.cartItems = guestCart;
            this.updateCartCount();
        },
        // Guest cart methods with product info
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
        updateCartCount() {
            this.cartCount = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
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
        async getCartCount() {
            try {
                const response = await axios.get('/cart');
                this.cartItems = response.data.items || [];
                this.cartCount = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
            } catch (error) {
                console.error('Error fetching cart:', error);
            }
        },

        // Add the initializeAndRefresh method
        async initializeAndRefresh() {
            await this.initialize();
            await this.refreshCart();
        },

        // In cartStore.js
        async checkout() {
            const authStore = useAuthStore();

            if (!authStore.isAuthenticated) {
                localStorage.setItem('redirectAfterLogin', '/checkout');
                router.push('/login');
                return;
            }

            try {
                this.loading = true;
                const response = await axios.post('/cart/checkout');

                // Make sure the response includes the order_id
                if (!response.data?.order_id) {
                    throw new Error('No order ID received from server');
                }

                this.clearCart();
                return response;
            } catch (error) {
                this.error = error.response?.data?.message || 'Error during checkout';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        clearCart() {
            this.cartItems = [];
            this.cartCount = 0;
            localStorage.removeItem('guestCart');
            localStorage.removeItem('redirectAfterLogin');
        },

        reset() {
            this.cartItems = [];
            this.cartCount = 0;
            this.loading = false;
            this.error = null;
            this.initialized = false;
        },

        async getOrderConfirmation(orderId) {
            try {
                const response = await axios.get(`/order/confirmation/${orderId}`);
                return response.data.order;
            } catch (error) {
                console.error('Error fetching order confirmation:', error);
                throw new Error('An error occurred while fetching the order information. Please try again.');
            }
        }

    }
});
