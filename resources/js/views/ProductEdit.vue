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
                <div v-else>Loading...</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useProductStore } from '../stores/productStore';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const productStore = useProductStore();
const errors = ref(null);
const categories = ref([]);
const product = ref(null);

const isEditing = computed(() => !!route.params.id);

const form = ref({
    category_id: '',
    name: '',
    description: '',
    long_description: '',
    price: '',
    stock: '',
    is_active: false,
    image: null
});

const handleImageChange = (event) => {
    form.value.image = event.target.files[0];
};

onMounted(async () => {
    try {
        await productStore.fetchCategories();
        categories.value = productStore.categories;

        if (route.params.id) {
            await productStore.fetchProduct(route.params.id);
            product.value = productStore.product;

            form.value = {
                category_id: productStore.product.category_id,
                name: productStore.product.name,
                description: productStore.product.description,
                long_description: productStore.product.long_description,
                price: productStore.product.price,
                stock: productStore.product.stock,
                is_active: Boolean(productStore.product.is_active),
                image: null
            };
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});

const handleSubmit = async () => {
    try {
        errors.value = null;

        const formData = {
            ...form.value,
            price: Number(form.value.price),
            stock: Number(form.value.stock),
            is_active: Boolean(form.value.is_active)
        };

        if (isEditing.value) {
            await productStore.updateProduct(route.params.id, formData);
        } else {
            await productStore.createProduct(formData);
        }

        router.push('/products');
    } catch (error) {
        console.error('Error:', error.response?.data);
        if (error.response?.data?.errors) {
            errors.value = error.response.data.errors;
        } else {
            alert('Error: ' + (error.response?.data?.message || 'Unknown error'));
        }
    }
};
</script>

