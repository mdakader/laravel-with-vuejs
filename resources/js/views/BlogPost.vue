<template>
    <div class="container mt-4" v-if="post">
        <h2>{{ post.title }}</h2>
        <p class="text-muted">Published on {{ formattedDate }}</p>

        <div v-if="post.image" class="mb-3">
            <img :src="`/storage/${post.image}`" alt="Post Image" class="img-fluid" />
        </div>

        <p>{{ post.description }}</p>

        <div class="d-flex justify-content-end mt-4">
            <button @click="confirmDelete" class="btn btn-danger me-2">Delete Post</button>
            <button @click="goBack" class="btn btn-secondary">Back to Blog</button>
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
import { useBlogStore } from '../stores/blogStore';
import Swal from 'sweetalert2';

const router = useRouter();
const route = useRoute();
const store = useBlogStore();

const post = ref(null);

// Fetch post data on component mount
onMounted(async () => {
    try {
        await store.fetchPost(route.params.id);
        post.value = store.currentPost;
    } catch (error) {
        console.error('Error fetching post:', error);
    }
});

// Format the date
const formattedDate = computed(() => {
    if (!post.value) return '';
    const date = new Date(post.value.created_at);
    return date.toLocaleDateString();
});

// Navigate back to blog list
const goBack = () => {
    router.push('/posts');
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
            await store.deletePost(route.params.id);
            Swal.fire('Deleted!', 'The post has been deleted.', 'success');
            router.push('/posts');
        } catch (error) {
            Swal.fire('Error!', 'Failed to delete the post.', 'error');
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
