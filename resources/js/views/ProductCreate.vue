<template>
    <div class="container mt-4">
        <div class="card">
            <div class="card-header">
                <h3>Create Product</h3>
            </div>
            <div class="card-body">
                <form @submit.prevent="handleSubmit">
                    <div class="mb-3">
                        <label class="form-label">Category</label>
                        <select v-model="form.category_id" class="form-select" required>
                            <option value="">Select Category</option>
                            <option
                                v-for="category in categories"
                                :key="category.id"
                                :value="category.id"
                            >
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
                        <label class="form-label">Image</label>
                        <input
                            type="file"
                            class="form-control"
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
                        <div class="invalid-feedback" v-if="errors?.is_active">
                            {{ errors.is_active[0] }}
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
import { ref, onMounted } from 'vue';
import { useProductStore } from '../stores/productStore';
import { useRouter } from 'vue-router';
import { useNotification } from '../app'

const notification = useNotification();

const router = useRouter();

const productStore = useProductStore();

// Add errors ref
const errors = ref(null);

// Rest of your existing code...
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
const categories = ref([]);

// Fetch categories on mount
onMounted(async () => {
    try {
        await productStore.fetchCategories();
        categories.value = productStore.categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
});

// Handle image selection
const handleImageChange = (event) => {
    form.value.image = event.target.files[0];
};

// Handle form submission
const handleSubmit = async () => {

    try {
        // Clear any previous errors
        errors.value = null;

        console.log('Form data before submission:', {
            ...form.value,
            is_active: Boolean(form.value.is_active)
        });

        const formData = {
            ...form.value,
            price: Number(form.value.price),
            stock: Number(form.value.stock),
            is_active: Boolean(form.value.is_active)
        };
        await productStore.createProduct(formData);
        notification.success('Product has created successful');
        router.push('/products');
    } catch (error) {
        console.error('Error creating product:', error.response?.data);
        console.error('Submission error:', error.response?.data);
        notification.error('Product created failed');
        if (error.response?.data?.errors) {
            errors.value = error.response.data.errors;
        } else {
            alert('Error creating product: ' + (error.response?.data?.message || 'Unknown error'));
        }
    }
};

</script>
