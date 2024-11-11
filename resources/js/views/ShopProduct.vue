<template>
    <div class="container mt-4" v-if="product">
        <div class="row">
            <!-- Product Image -->
            <div class="col-md-6">
                <img
                    :src="product.image ? `/storage/${product.image}` : '/placeholder.jpg'"
                    :alt="product.name"
                    class="img-fluid rounded"
                >
            </div>

            <!-- Product Info -->
            <div class="col-md-6">
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><router-link to="/shop">Shop</router-link></li>
                        <li class="breadcrumb-item active" aria-current="page">{{ product.name }}</li>
                    </ol>
                </nav>

                <h1 class="mb-3">{{ product.name }}</h1>
                <p class="text-muted mb-3">
                    Category: {{ product.category?.name }}
                </p>

                <div class="mb-3">
                    <h3 class="text-primary mb-0">${{ product.price }}</h3>
                    <span :class="['badge', product.stock > 0 ? 'bg-success' : 'bg-danger']">
                        {{ product.stock > 0 ? `${product.stock} in Stock` : 'Out of Stock' }}
                    </span>
                </div>

                <div class="mb-4">
                    <p>{{ product.description }}</p>
                </div>

                <!-- Add to Cart Section -->
                <div class="mb-4" v-if="product.stock > 0">
                    <div class="d-flex gap-3 align-items-center">
                        <div class="input-group" style="width: 150px;">
                            <button @click="decrementQuantity">-</button>
                            <input type="text" v-model="quantity" readonly class="form-control text-center">
                            <button @click="incrementQuantity">+</button>
                        </div>
                        <button
                            @click="addToCart"
                            class="btn btn-primary"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>

                <!-- Long Description -->
                <div class="mt-4">
                    <h4>Product Details</h4>
                    <p class="text-muted">{{ product.long_description }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useShopStore } from '../stores/shopStore';
import { useCartStore } from '../stores/cartStore';
import { useNotification } from '../app'
const route = useRoute();
const shopStore = useShopStore();
const cartStore = useCartStore();
const quantity = ref(1); // Initial quantity set to 1

const product = computed(() => shopStore.product);

onMounted(async () => {
    await shopStore.fetchProduct(route.params.slug);
});

const incrementQuantity = () => {
    if (quantity.value < product.value.stock) { // Limit to stock availability
        quantity.value += 1;
    }
};

const decrementQuantity = () => {
    if (quantity.value > 1) { // Prevent quantity from going below 1
        quantity.value -= 1;
    }
};


const addToCart = async () => {
    try {
        await cartStore.addToCart({
            product_id: product.value.id,
            quantity: quantity.value,
            product: product.value
        });
        // Add success notification
        const notification = useNotification();
        notification.success('Product added to cart successfully');
    } catch (error) {
        console.error('Error adding product to cart:', error);
        const notification = useNotification();
        notification.error('Failed to add product to cart');
    }
};

</script>
