<template>
    <div class="container mt-4" v-if="currentPost">
        <div class="blog-post">
            <img :src="`/storage/${currentPost.image}`"
                 class="img-fluid mb-4 w-100"
                 :alt="currentPost.title">
            <h1>{{ currentPost.title }}</h1>
            <div class="my-4">
                {{ currentPost.details }}
            </div>
            <div class="btn-group">
                <router-link :to="`/blog/${currentPost.id}/edit`"
                             class="btn btn-primary">
                    Edit Post
                </router-link>
                <button class="btn btn-danger" @click="deletePost">
                    Delete Post
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBlogStore } from '@/stores/blogStore';

const route = useRoute();
const router = useRouter();
const store = useBlogStore();

onMounted(() => {
    store.fetchPost(route.params.id);
});

const deletePost = async () => {
    if (confirm('Are you sure you want to delete this post?')) {
        await store.deletePost(route.params.id);
        router.push('/blog');
    }
};
</script>
