<template>
    <div class="container mt-4">
        <div class="d-flex justify-content-between mb-4">
            <h2>Blog Posts</h2>
            <router-link to="/blog/create" class="btn btn-primary">
                Create New Post
            </router-link>
        </div>

        <div v-if="isLoading" class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p>Loading posts...</p>
        </div>
        <div v-else-if="!Array.isArray(blogStore.posts) || blogStore.posts.length === 0">
            No posts available.
        </div>
        <div v-else class="row">
            <div v-for="post in blogStore.posts" :key="post.id" class="col-md-6 mb-4">
                <div class="card">
                    <img :src="`/storage/${post.image}`" class="card-img-top" :alt="post.title">
                    <div class="card-body">
                        <h5 class="card-title">{{ post.title }}</h5>
                        <p class="card-text">{{ post.description.substring(0, 150) }}...</p>
                        <div class="btn-group">
                            <router-link :to="`/posts/${post.id}`" class="btn btn-primary">
                                Read More
                            </router-link>
                            <router-link :to="`/posts/${post.id}/edit`" class="btn btn-secondary">
                                Edit
                            </router-link>
                            <button @click="handleDelete(post.id)" class="btn btn-danger">
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
import { useBlogStore } from '../stores/blogStore';
import Swal from 'sweetalert2';

const blogStore = useBlogStore();
const isLoading = ref(true);

onMounted(async () => {
    try {
        await blogStore.fetchPosts();
        isLoading.value = false;
    } catch (error) {
        console.error('Error fetching posts:', error);
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
            await blogStore.deletePost(id); // Call the deletePost action in the store
            Swal.fire(
                'Deleted!',
                'The post has been deleted.',
                'success'
            );
        } catch (error) {
            console.error('Error deleting post:', error);
            Swal.fire(
                'Error!',
                'There was a problem deleting the post.',
                'error'
            );
        }
    }
};

</script>
