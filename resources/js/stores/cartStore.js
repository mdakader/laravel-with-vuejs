import { defineStore } from 'pinia';
import axios from '../axios';
import { useAuthStore } from './auth';

export const useCartStore = defineStore('cart', {
    state: () => ({
        cartItems: [],
        cartCount: 0,
        loading: false,
        error: null
    }),

    getters: {
        totalAmount(state) {
            return state.cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
        }
    },

    actions: {
        async initialize() {
            const auth = useAuthStore();
            try {
                if (auth.isAuthenticated) {
                    // Fetch cart data for authenticated user
                    const response = await axios.get('/cart');
                    this.cartItems = response.data.items || [];
                } else {
                    // Load guest cart from localStorage
                    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                    this.cartItems = guestCart;
                }
            } catch (error) {
                console.error('Error initializing cart:', error);
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

        async addToCart({ product_id, quantity, product }) {
            const authStore = useAuthStore();
            try {
                this.loading = true;
                this.error = null;

                if (authStore.isAuthenticated) {
                    // Add item to the backend cart for authenticated user
                    await axios.post('/cart/add', { product_id, quantity });
                    await this.getCartCount();
                } else {
                    // Add item to guest cart for unauthenticated user
                    this.addToGuestCart(product_id, quantity, product);
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error adding to cart';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        addToGuestCart(productId, quantity, product) {
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

        async updateQuantity(productId, quantity) {
            try {
                await axios.put('/cart/update-quantity', { product_id: productId, quantity });
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
        }
    }
});
