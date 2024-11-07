<template>
    <div class="container mt-4">
        <div class="d-flex justify-content-between mb-4">
            <h2>Products</h2>
            <button class="btn btn-primary" @click="showCreateModal = true">
                Add Product
            </button>
        </div>

        <div class="row">
            <div v-for="product in products" :key="product.id" class="col-md-4 mb-4">
                <div class="card">
                    <img :src="'/storage/' + product.image" class="card-img-top" :alt="product.title">
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
        <div class="modal" tabindex="-1" v-if="showCreateModal || editingProduct">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ editingProduct ? 'Edit' : 'Create' }} Product</h5>
                        <button type="button" class="btn-close" @click="closeModal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="handleSubmit">
                            <div class="mb-3">
                                <label class="form-label">Title</label>
                                <input type="text" class="form-control" v-model="form.title" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Details</label>
                                <textarea class="form-control" v-model="form.details" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Image</label>
                                <input type="file" class="form-control" @change="handleImageChange"
                                       :required="!editingProduct">
                            </div>
                            <button type="submit" class="btn btn-primary">
                                {{ editingProduct ? 'Update' : 'Create' }}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/stores/productStore'

const store = useProductStore()
const showCreateModal = ref(false)
const editingProduct = ref(null)
const form = ref({
    title: '',
    details: '',
    image: null
})

onMounted(() => {
    store.fetchProducts()
})

const handleImageChange = (e) => {
    form.value.image = e.target.files[0]
}

const handleSubmit = async () => {
    const formData = new FormData()
    formData.append('title', form.value.title)
    formData.append('details', form.value.details)
    if (form.value.image) {
        formData.append('image', form.value.image)
    }

    try {
        if (editingProduct.value) {
            await store.updateProduct(editingProduct.value.id, formData)
        } else {
            await store.createProduct(formData)
        }
        closeModal()
    } catch (error) {
        console.error('Error:', error)
    }
}

const editProduct = (product) => {
    editingProduct.value = product
    form.value = {
        title: product.title,
        details: product.details,
        image: null
    }
}

const deleteProduct = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
        await store.deleteProduct(id)
    }
}

const closeModal = () => {
    showCreateModal.value = false
    editingProduct.value = null
    form.value = {
        title: '',
        details: '',
        image: null
    }
}
</script>
