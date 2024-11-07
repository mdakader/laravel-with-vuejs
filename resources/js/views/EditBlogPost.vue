<template>
    <div class="container mt-4">
        <h2>Edit Blog Post</h2>
        <form v-if="store.currentPost" @submit.prevent="handleSubmitForm">
            <div class="mb-3">
                <label for="title" class="form-label">Title</label>
                <input
                    v-model="formData.title"
                    type="text"
                    id="title"
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
                <small v-if="store.currentPost.image" class="form-text text-muted">
                    Current Image:
                    <img :src="`/storage/${store.currentPost.image}`" alt="Current Image" width="100" />
                </small>
            </div>

            <button type="submit" class="btn btn-primary">Update Post</button>
        </form>
        <p v-else>Loading post data...</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useBlogStore } from '../stores/blogStore';
import { useNotification } from '../app'
const notification = useNotification()

const router = useRouter();
const route = useRoute();
const store = useBlogStore();
const formData = ref({
    title: '',
    description: '',
    image: null,
});

// Load current post data into form fields
onMounted(async () => {
    await store.fetchPost(route.params.id);
    if (store.currentPost) {
        formData.value.title = store.currentPost.title;
        formData.value.description = store.currentPost.description;
    }
});

// Handle file input change
const handleFileChange = (event) => {
    formData.value.image = event.target.files[0];
};

// Handle form submission
const handleSubmitForm = async () => {
    const updatedData = new FormData();
    updatedData.append('title', formData.value.title);
    updatedData.append('description', formData.value.description);
    if (formData.value.image) {
        updatedData.append('image', formData.value.image);
    }

    try {
        const response = await store.updatePost(route.params.id, updatedData);
        console.log('Server response:', response); // Log the response to check
        // Show success notification
        notification.success('Post updated successfully')
        router.push('/posts'); // Redirect to blog list after successful update
    } catch (error) {
        // Show success notification
        notification.error('Failed to update post. Please try again.')
        console.error('Error updating post:', error);
    }
};

</script>
