<template>
    <div class="container">
        <h2>Shopping Cart</h2>

        <div v-if="!cart.cartItems.length" class="text-center">
            <p>Your cart is empty</p>
            <router-link to="/shop" class="btn btn-primary">Continue Shopping</router-link>
        </div>

        <div v-else>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                    <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="item in cart.cartItems" :key="item.product_id">
                        <td>
                            <div class="d-flex align-items-center">
                                <img v-if="item.image"
                                     :src="item.image ? `/storage/${item.image}` : '/placeholder.jpg'"
                                     :alt="item.name"
                                     class="img-thumbnail me-2"
                                     style="width: 50px; height: 50px; object-fit: cover;">
                                {{ item.name }}
                            </div>
                        </td>
                        <td>${{ item.price }}</td>
                        <td>
                            <div class="d-flex align-items-center">
                                <button @click="updateQuantity(item, -1)"
                                        class="btn btn-sm btn-outline-secondary">-
                                </button>
                                <span class="mx-2">{{ item.quantity }}</span>
                                <button @click="updateQuantity(item, 1)"
                                        class="btn btn-sm btn-outline-secondary">+
                                </button>
                            </div>
                        </td>
                        <td>${{ (item.price * item.quantity).toFixed(2) }}</td>
                        <td>
                            <button @click="removeItem(item)"
                                    class="btn btn-sm btn-danger">Remove
                            </button>
                        </td>
                    </tr>
                    </tbody>
                    <tfoot>
                    <tr>
                        <td colspan="3" class="text-end"><strong>Total:</strong></td>
                        <td colspan="2">
                            <strong>${{ cart.totalAmount }}</strong>
                        </td>
                    </tr>
                    </tfoot>
                </table>
            </div>

            <div class="d-flex justify-content-end gap-3">
                <router-link to="/shop" class="btn btn-secondary">
                    Continue Shopping
                </router-link>
                <button @click="proceedToCheckout" class="btn btn-primary">
                    Proceed to Checkout
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const cart = useCartStore()
const auth = useAuthStore()
const router = useRouter()

onMounted(async () => {
    if (auth.isAuthenticated) {
        await cart.getCartCount()
    } else {
        cart.loadGuestCart()
    }
})

const updateQuantity = async (item, change) => {
    const newQuantity = item.quantity + change
    if (newQuantity > 0) {
        if (auth.isAuthenticated) {
            await cart.updateQuantity(item.product_id, newQuantity)
        } else {
            cart.updateGuestQuantity(item.product_id, newQuantity)
        }
    }
}

const removeItem = async (item) => {
    if (auth.isAuthenticated) {
        await cart.removeItem(item.product_id)
    } else {
        cart.removeGuestItem(item.product_id)
    }
}

const proceedToCheckout = () => {
    if (!auth.isAuthenticated) {
        localStorage.setItem('redirectAfterLogin', '/checkout')
        router.push('/login')
    } else {
        router.push('/checkout')
    }
}
</script>
