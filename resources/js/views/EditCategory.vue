<template>
    <div class="container mt-4">
        <h2>Edit Category</h2>
        <form v-if="store.currentCategory" @submit.prevent="handleSubmitForm">
            <div class="mb-3">
                <label for="title" class="form-label">Name</label>
                <input
                    v-model="formData.name"
                    type="text"
                    id="name"
                    class="form-control"
                    required
                />
            </div>

            <div class="mb-3">
                <label for="description" class="form-label">Description</label>
                <textarea
                    v-model="formData.description"
                    id="description"
                    class="form-control"
                    rows="5"
                    required
                ></textarea>
            </div>

            <div class="mb-3">
                <label for="image" class="form-label">Upload Image</label>
                <input
                    type="file"
                    id="image"
                    class="form-control"
                    @change="handleFileChange"
                />
                <small v-if="store.currentCategory.image" class="form-text text-muted">
                    Current Image:
                    <img :src="`/storage/${store.currentCategory.image}`" alt="Current Image" width="100" />
                </small>
            </div>

            <button type="submit" class="btn btn-primary">Update Category</button>
        </form>
        <p v-else>Loading category data...</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCategoryStore } from '../stores/categoryStore';
import { useNotification } from '../app'
const notification = useNotification()

const router = useRouter();
const route = useRoute();
const store = useCategoryStore();
const formData = ref({
    name: '',
    description: '',
    image: null,
});

// Load current post data into form fields
onMounted(async () => {
    console.log(route.params.id); // Debugging: Check if the category ID is correct
    await store.fetchCategory(route.params.id);
    if (store.currentCategory) {
        formData.value.name = store.currentCategory.name;
        formData.value.description = store.currentCategory.description;
    }
});

// Handle file input change
const handleFileChange = (event) => {
    formData.value.image = event.target.files[0];
};

// Handle form submission
const handleSubmitForm = async () => {
    const updatedData = new FormData();
    updatedData.append('name', formData.value.name);
    updatedData.append('description', formData.value.description);
    if (formData.value.image) {
        updatedData.append('image', formData.value.image);
    }

    try {
        const response = await store.updateCategory(route.params.id, updatedData);
        console.log('Server response:', response); // Log the response to check
        // Show success notification
        notification.success('Category updated successfully')
        router.push('/categories'); // Redirect to blog list after successful update
    } catch (error) {
        // Show success notification
        notification.error('Failed to update category. Please try again.')
        console.error('Error updating category:', error);
    }
};

</script>
