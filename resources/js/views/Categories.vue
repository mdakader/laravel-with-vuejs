<template>
    <div class="container mt-4">
        <div class="d-flex justify-content-between mb-4">
            <h2>Categories</h2>
            <router-link to="/categories/create" class="btn btn-primary">
                Create New Category
            </router-link>
        </div>

        <div v-if="isLoading" class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p>Loading categories...</p>
        </div>
        <div v-else-if="!Array.isArray(categoryStore.categories) || categoryStore.categories.length === 0">
            No categories available.
        </div>
        <div v-else class="row">
            <div v-for="category in categoryStore.categories" :key="category.id" class="col-md-6 mb-4">
                <div class="card">
                    <img :src="`/storage/${category.image}`" class="card-img-top" :alt="category.name">
                    <div class="card-body">
                        <h5 class="card-title">{{ category.name }}</h5>
                        <p class="card-text">{{ category.description.substring(0, 150) }}...</p>
                        <div class="btn-group">
                            <router-link :to="`/categories/${category.id}`" class="btn btn-primary">
                                Read More
                            </router-link>
                            <router-link :to="`/categories/${category.id}/edit`" class="btn btn-secondary">
                                Edit
                            </router-link>
                            <button @click="handleDelete(category.id)" class="btn btn-danger">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCategoryStore } from '../stores/categoryStore';
import Swal from 'sweetalert2';

const categoryStore = useCategoryStore();
const isLoading = ref(true);

onMounted(async () => {
    try {
        await categoryStore.fetchCategories();
        isLoading.value = false;
    } catch (error) {
        console.error('Error fetching categories:', error);
        isLoading.value = false;
    }
});

const handleDelete = async (id) => {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
        try {
            await categoryStore.deleteCategory(id);
            Swal.fire(
                'Deleted!',
                'The category has been deleted.',
                'success'
            );
        } catch (error) {
            console.error('Error deleting category:', error);
            Swal.fire(
                'Error!',
                'There was a problem deleting the post.',
                'error'
            );
        }
    }
};

</script>
