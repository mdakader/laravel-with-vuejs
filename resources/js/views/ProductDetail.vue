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
                <div class="mb-4">
                    <div class="d-flex gap-3 align-items-center">
                        <div class="input-group" style="width: 150px;">
                            <button
                                class="btn btn-outline-secondary"
                                @click="decrementQuantity"
                                :disabled="quantity <= 1"
                            >-</button>
                            <input
                                type="number"
                                class="form-control text-center"
                                v-model="quantity"
                                min="1"
                                :max="product.stock"
                            >
                            <button
                                class="btn btn-outline-secondary"
                                @click="incrementQuantity"
                                :disabled="quantity >= product.stock"
                            >+</button>
                        </div>
                        <button
                            @click="addToCart"
                            class="btn btn-primary"
                            :disabled="product.stock <= 0"
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
    <div v-else class="container mt-4">
        <div class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useProductStore } from '../stores/productStore';
import { useCartStore } from '../stores/cartStore';

const route = useRoute();
const productStore = useProductStore();
const cartStore = useCartStore();
const quantity = ref(1);

const product = computed(() => productStore.product);

onMounted(async () => {
    await productStore.fetchProduct(route.params.slug);
});

const incrementQuantity = () => {
    if (quantity.value < product.value.stock) {
        quantity.value++;
    }
};

const decrementQuantity = () => {
    if (quantity.value > 1) {
        quantity.value--;
    }
};

const addToCart = async () => {
    try {
        await cartStore.addToCart({
            product_id: product.value.id,
            quantity: quantity.value
        });
        alert('Product added to cart successfully!');
    } catch (error) {
        alert('Error adding product to cart');
    }
};
</script>
