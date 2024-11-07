<template>
    <div class="container mt-4" v-if="category">
        <h2>{{ category.name }}</h2>
        <p class="text-muted">Published on {{ formattedDate }}</p>

        <div v-if="category.image" class="mb-3">
            <img :src="`/storage/${category.image}`" alt="Category Image" class="img-fluid" />
        </div>

        <p>{{ category.description }}</p>

        <div class="d-flex justify-content-end mt-4">
            <button @click="confirmDelete" class="btn btn-danger me-2">Delete category</button>
            <button @click="goBack" class="btn btn-secondary">Back to category</button>
        </div>
    </div>

    <!-- Show a loading message while the post is being fetched -->
    <div v-else>
        <p>Loading...</p>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCategoryStore } from '../stores/categoryStore';
import Swal from 'sweetalert2';

const router = useRouter();
const route = useRoute();
const store = useCategoryStore();

const category = ref(null);

// Fetch post data on component mount
onMounted(async () => {
    try {
        await store.fetchCategory(route.params.id);
        category.value = store.currentCategory;
    } catch (error) {
        console.error('Error fetching category:', error);
    }
});

// Format the date
const formattedDate = computed(() => {
    if (!category.value) return '';
    const date = new Date(category.value.created_at);
    return date.toLocaleDateString();
});

// Navigate back to blog list
const goBack = () => {
    router.push('/categories');
};

// Confirm delete action
const confirmDelete = async () => {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
        try {
            await store.deleteCategory(route.params.id);
            Swal.fire('Deleted!', 'The category has been deleted.', 'success');
            router.push('/categories');
        } catch (error) {
            Swal.fire('Error!', 'Failed to delete the category.', 'error');
            console.error(error);
        }
    }
};
</script>

<style scoped>
img {
    max-width: 100%;
    height: auto;
}
</style>
