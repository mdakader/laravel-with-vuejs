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
                        <button type="submit" class="btn btn-primary">Create Product</button>
                        <router-link to="/products" class="btn btn-secondary">Cancel</router-link>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {useProductStore} from '@/stores/productStore';
import {storeToRefs} from 'pinia';
import {useRouter} from 'vue-router';

const router = useRouter();
const productStore = useProductStore();
const {categories} = storeToRefs(productStore);

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

onMounted(() => {
    productStore.fetchCategories();
});

const handleImageChange = (event) => {
    form.value.image = event.target.files[0];
};

const handleSubmit = async () => {
    try {
        await productStore.createProduct(form.value);
        router.push('/products');
    } catch (error) {
        alert('Error creating product');
    }
};
</script>
