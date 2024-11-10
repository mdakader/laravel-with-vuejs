<script setup>
import { ref, onMounted, computed } from 'vue';
import { useProductStore } from '../stores/productStore';
import { storeToRefs } from 'pinia';

const productStore = useProductStore();
// Use storeToRefs to maintain reactivity
const { products, categories, pagination, loading } = storeToRefs(productStore);

const filters = ref({
    category_id: '',
    search: '',
    page: 1
});

const totalPages = computed(() => {
    if (!pagination.value) return 0;
    return Math.ceil(pagination.value.total / pagination.value.per_page);
});

onMounted(async () => {
    try {
        // Load initial data
        await Promise.all([
            productStore.fetchProducts(),
            productStore.fetchCategories()
        ]);
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
});

const filterProducts = async () => {
    try {
        filters.value.page = 1;
        await productStore.fetchProducts(filters.value);
    } catch (error) {
        console.error('Error filtering products:', error);
    }
};

const changePage = async (page) => {
    try {
        filters.value.page = page;
        await productStore.fetchProducts(filters.value);
    } catch (error) {
        console.error('Error changing page:', error);
    }
};

const deleteProduct = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            await productStore.deleteProduct(id);
            await productStore.fetchProducts(filters.value);
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product');
        }
    }
};
</script>

<template>
    <div class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Products</h2>
            <router-link to="/products/create" class="btn btn-primary">
                Add Product
            </router-link>
        </div>

        <!-- Filters -->
        <div class="card mb-4">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-3">
                        <select
                            v-model="filters.category_id"
                            class="form-select"
                            @change="filterProducts"
                        >
                            <option value="">All Categories</option>
                            <option
                                v-for="category in categories"
                                :key="category.id"
                                :value="category.id"
                            >
                                {{ category.name }}
                            </option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <input
                            v-model="filters.search"
                            type="text"
                            class="form-control"
                            placeholder="Search products..."
                            @input="filterProducts"
                        >
                    </div>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center my-4">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>

        <!-- Products Table -->
        <div v-else-if="products.length" class="card">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="product in products" :key="product.id">
                            <td>
                                <img
                                    :src="product.image ? `/storage/${product.image}` : '/placeholder.png'"
                                    class="img-thumbnail"
                                    width="50"
                                    alt="Product image"
                                >
                            </td>
                            <td>{{ product.name }}</td>
                            <td>{{ product.category?.name }}</td>
                            <td>${{ product.price }}</td>
                            <td>{{ product.stock }}</td>
                            <td>
                                    <span
                                        class="badge"
                                        :class="product.is_active ? 'bg-success' : 'bg-danger'"
                                    >
                                        {{ product.is_active ? 'Active' : 'Inactive' }}
                                    </span>
                            </td>
                            <td>
                                <div class="btn-group">
                                    <router-link
                                        :to="`/products/${product.id}/edit`"
                                        class="btn btn-sm btn-outline-primary"
                                    >
                                        Edit
                                    </router-link>
                                    <button
                                        @click="deleteProduct(product.id)"
                                        class="btn btn-sm btn-outline-danger"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <nav v-if="totalPages > 1">
                    <ul class="pagination justify-content-center">
                        <li
                            v-for="page in totalPages"
                            :key="page"
                            class="page-item"
                            :class="{ active: page === pagination.current_page }"
                        > <a

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

        <!-- No Products Message -->
        <div v-else class="alert alert-info">
            No products found.
        </div>
    </div>
</template>
