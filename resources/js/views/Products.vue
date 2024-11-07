<template>
    <div class="container mt-4">
        <div class="d-flex justify-content-between mb-4">
            <h2>Products</h2>
            <button class="btn btn-primary" @click="showCreateModal = true">
                Add Product
            </button>
        </div>

        <!-- Product List -->
        <div class="row">
            <div v-for="product in products" :key="product.id" class="col-md-4 mb-4">
                <div class="card">
                    <img :src="`/storage/${product.image}`" class="card-img-top" :alt="product.title">
                    <div class="card-body">
                        <h5 class="card-title">{{ product.title }}</h5>
                        <p class="card-text">{{ product.details }}</p>
                        <div class="btn-group">
                            <button class="btn btn-primary" @click="editProduct(product)">Edit</button>
                            <button class="btn btn-danger" @click="deleteProduct(product.id)">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Create/Edit Modal -->
        <div class="modal" tabindex="-1"
             :class="{ 'd-block': showCreateModal || editingProduct }"
             v-if="showCreateModal || editingProduct">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ editingProduct ? 'Edit' : 'Create' }} Product</h5>
                        <button type="button" class="btn-close" @click="closeModal"></button>
                    </div>
                    <div class="modal-body">
                        <ProductForm
                            :initial-data="editingProduct || {}"
                            :editing="!!editingProduct"
                            @submit="handleSubmit"
                        />
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-backdrop fade show"
             v-if="showCreateModal || editingProduct"></div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useProductStore } from '@/stores/productStore';
import ProductForm from '@/components/ProductForm.vue';

const store = useProductStore();
const showCreateModal = ref(false);
const editingProduct = ref(null);

onMounted(() => {
    store.fetchProducts();
});

const handleSubmit = async (formData) => {
    try {
        if (editingProduct.value) {
            await store.updateProduct(editingProduct.value.id, formData);
        } else {
            await store.createProduct(formData);
        }
        closeModal();
    } catch (error) {
        console.error('Error:', error);
    }
};

const editProduct = (product) => {
    editingProduct.value = product;
};

const deleteProduct = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
        await store.deleteProduct(id);
    }
};

const closeModal = () => {
    showCreateModal.value = false;
    editingProduct.value = null;
};
</script>
