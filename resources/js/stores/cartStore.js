//stores/cart.js
import {defineStore} from 'pinia';
import axios from '../axios';
import {useAuthStore} from './auth';
import router from '../router';

export const useCartStore = defineStore('cart', {
    state: () => ({
        cartItems: JSON.parse(localStorage.getItem('cartItems')) || [],
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
                    const response = await axios.get('/api/cart');
                    this.cartItems = response.data.items || [];
                    this.updateCartCount();
                } else {
                    this.loadGuestCart();
                }
                this.initialized = true;
            } catch (error) {
                console.error('Cart initialization error:', error);
                this.cartItems = [];
                this.cartCount = 0;
            } finally {
                this.loading = false;
            }
        },

        async addToCart({product_id, quantity, product}) {
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

        updateCartCount() {
            this.cartCount = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
        },

        async checkout() {
            const authStore = useAuthStore();
            if (!authStore.isAuthenticated) {
                const redirect = localStorage.getItem('redirectAfterLogin') || '/checkout';
                localStorage.removeItem('redirectAfterLogin');
                router.push(redirect);
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

        async getCartCount() {
            try {
                const response = await axios.get('/cart');
                this.cartItems = response.data.items || [];
                this.cartCount = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
            } catch (error) {
                console.error('Error fetching cart:', error);
            }
        },

        addToGuestCart(productId, quantity, product) {
            const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
            const existingItem = guestCart.find(item => item.product_id === productId)

            if (existingItem) {
                existingItem.quantity += quantity
            } else {
                guestCart.push({
                    product_id: productId,
                    quantity,
                    name: product.name || "Unnamed Product",
                    price: product.price || 0,
                    image: product.image || '/placeholder.jpg'
                })
            }

            localStorage.setItem('guestCart', JSON.stringify(guestCart))
            this.loadGuestCart()
        },

        loadGuestCart() {
            const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
            this.cartItems = guestCart
            this.cartCount = guestCart.reduce((sum, item) => sum + item.quantity, 0)
            console.log('Loaded guest cart items:', this.cartItems)
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

        async updateQuantity(productId, quantity) {
            try {
                await axios.put('/cart/update-quantity', {product_id: productId, quantity});
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
        // Reset store state
        reset() {
            this.cartItems = [];
            this.cartCount = 0;
            this.loading = false;
            this.error = null;
            this.initialized = false;
        }
    }
});
