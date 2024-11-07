<template>
    <div class="container mt-4">
        <div class="d-flex justify-content-between mb-4">
            <h2>Blog Posts</h2>
            <router-link to="/blog/create" class="btn btn-primary">
                Create New Post
            </router-link>
        </div>

        <div class="row">
            <div v-for="post in posts" :key="post.id" class="col-md-6 mb-4">
                <div class="card">
                    <img :src="`/storage/${post.image}`" class="card-img-top" :alt="post.title">
                    <div class="card-body">
                        <h5 class="card-title">{{ post.title }}</h5>
                        <p class="card-text">{{ post.details.substring(0, 150) }}...</p>
                        <div class="btn-group">
                            <router-link :to="`/blog/${post.id}`" class="btn btn-primary">
                                Read More
                            </router-link>
                            <router-link :to="`/blog/${post.id}/edit`" class="btn btn-secondary">
                                Edit
                            </router-link>
                            <button class="btn btn-danger" @click="deletePost(post.id)">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useBlogStore } from '@/stores/blogStore';

const store = useBlogStore();

onMounted(() => {
    store.fetchPosts();
});

const deletePost = async (id) => {
    if (confirm('Are you sure you want to delete this post?')) {
        await store.deletePost(id);
    }
};
</script>
