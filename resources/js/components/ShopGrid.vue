<template>
    <div class="container mt-4">
        <!-- Categories Filter -->
        <div class="mb-4">
            <select v-model="selectedCategory" class="form-select" @change="filterProducts">
                <option value="">All Categories</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                </option>
            </select>
        </div>

        <!-- Products Grid -->
        <div class="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
            <div v-for="product in products" :key="product.id" class="col">
                <div class="card h-100">
                    <img
                        :src="product.image ? `/storage/${product.image}` : '/placeholder.jpg'"
                        class="card-img-top"
                        :alt="product.name"
                        style="height: 200px; object-fit: cover;"
                    >
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">{{ product.name }}</h5>
                        <p class="card-text text-truncate">{{ product.description }}</p>
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="h5 mb-0">${{ product.price }}</span>
                                <span :class="['badge', product.stock > 0 ? 'bg-success' : 'bg-danger']">
                                    {{ product.stock > 0 ? 'In Stock' : 'Out of Stock' }}
                                </span>
                            </div>
                            <div class="d-flex gap-2">
                                <router-link
                                    :to="{ name: 'shop-product', params: { slug: product.slug }}"
                                    class="btn btn-outline-primary flex-grow-1"
                                >
                                    View Details
                                </router-link>
                                <button
                                    @click="addToCart(product)"
                                    class="btn btn-primary"
                                    :disabled="product.stock <= 0"
                                >
                                    <i class="bi bi-cart-plus"></i> Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Pagination -->
        <div class="d-flex justify-content-center mt-4">
            <nav v-if="pagination.total > pagination.per_page">
                <ul class="pagination">
                    <li
                        v-for="page in totalPages"
                        :key="page"
                        :class="['page-item', page === pagination.current_page ? 'active' : '']"
                    >
                        <a
                            class="page-link"
                            href="#"
                            @click.prevent="changePage(page)"
                        >
                            {{ page }}
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useShopStore } from '../stores/shopStore';
import { useCartStore } from '../stores/cartStore';
import { useNotification } from '@/app'

const shopStore = useShopStore();
const cartStore = useCartStore();
const selectedCategory = ref('');

const notification = useNotification();

const products = computed(() => shopStore.products);
const categories = computed(() => shopStore.categories);
const pagination = computed(() => shopStore.pagination);

const totalPages = computed(() => {
    return Math.ceil(pagination.value.total / pagination.value.per_page);
});

onMounted(async () => {
    await Promise.all([
        shopStore.fetchProducts(),
        shopStore.fetchCategories()
    ]);
});

const filterProducts = async () => {
    await shopStore.fetchProducts({
        category_id: selectedCategory.value
    });
};

const changePage = async (page) => {
    await shopStore.fetchProducts({
        page,
        category_id: selectedCategory.value
    });
};

const addToCart = async (product) => {  // Add product parameter here
    try {
        await cartStore.addToCart({
            product_id: product.id,      // Use product parameter directly
            quantity: 1,                 // Set default quantity to 1 for grid view
            product: product             // Pass the whole product
        });
        notification.success('Product added to cart successfully');
    } catch (error) {
        console.error('Error adding product to cart:', error);
        notification.error('Failed to add product to cart');
    }
};

</script>
