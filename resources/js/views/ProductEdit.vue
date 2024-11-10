<template>
    <div class="container mt-4">
        <div class="card">
            <div class="card-header">
                <h3>Edit Product</h3>
            </div>
            <div class="card-body">
                <form @submit.prevent="handleSubmit" v-if="product">
                    <div class="mb-3">
                        <label class="form-label">Category</label>
                        <select v-model="form.category_id" class="form-select" required>
                            <option value="">Select Category</option>
                            <option v-for="category in categories" :key="category.id" :value="category.id">
                                {{ category.name }}
                            </option>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Name</label>
                        <input
                            v-model="form.name"
                            type="text"
                            class="form-control"
                            required
                        >
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Current Image</label>
                        <div v-if="product.image">
                            <img
                                :src="`/storage/${product.image}`"
                                class="img-thumbnail"
                                width="200"
                            >
                        </div>
                        <input
                            type="file"
                            class="form-control mt-2"
                            @change="handleImageChange"
                            accept="image/*"
                        >
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Description</label>
                        <textarea
                            v-model="form.description"
                            class="form-control"
                            rows="3"
                        ></textarea>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Long Description</label>
                        <textarea
                            v-model="form.long_description"
                            class="form-control"
                            rows="5"
                        ></textarea>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Price</label>
                            <input
                                v-model="form.price"
                                type="number"
                                step="0.01"
                                class="form-control"
                                required
                            >
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Stock</label>
                            <input
                                v-model="form.stock"
                                type="number"
                                class="form-control"
                                required
                            >
                        </div>
                    </div>

                    <div class="mb-3">
                        <div class="form-check">
                            <input
                                v-model="form.is_active"
                                type="checkbox"
                                class="form-check-input"
                                id="isActive"
                            >
                            <label class="form-check-label" for="isActive">
                                Active
                            </label>
                        </div>
                    </div>

                    <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-primary">Update Product</button>
                        <router-link to="/products" class="btn btn-secondary">Cancel</router-link>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useProductStore } from '@/stores/productStore';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const { categories, product } = storeToRefs(productStore);

// Form object to store input values
const form = ref({
    category_id: '',
    name: '',
    description: '',
    long_description: '',
    price: '',
    stock: '',
    is_active: true,
    image: null
});

// Fetch categories and product details on component mount
onMounted(async () => {
    const productId = route.params.id; // Get product ID from the route
    await productStore.fetchCategories();
    await productStore.fetchProduct(productId); // Fetch product data using the ID

    if (productStore.product) {
        // Populate form with fetched product data
        form.value = {
            category_id: productStore.product.category_id || '',
            name: productStore.product.name || '',
            description: productStore.product.description || '',
            long_description: productStore.product.long_description || '',
            price: productStore.product.price || '',
            stock: productStore.product.stock || '',
            is_active: productStore.product.is_active || true,
            image: productStore.product.image || null,
        };
    }
});

// Handle file input for image changes
const handleImageChange = (event) => {
    form.value.image = event.target.files[0];
};

// Submit handler to update product
const handleSubmit = async () => {
    try {
        const productId = route.params.id; // Ensure you pass the correct ID
        await productStore.updateProduct(productId, form.value);
        router.push('/products'); // Redirect after successful update
    } catch (error) {
        alert('Error updating product');
    }
};
</script>
