<template>
    <div class="container mt-4">
        <h2>Create New Blog Post</h2>
        <BlogPostForm @submit="handleSubmit" />
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useBlogStore } from '@/stores/blogStore';
import BlogPostForm from '@/components/BlogPostForm.vue';

const router = useRouter();
const store = useBlogStore();

const handleSubmit = async (formData) => {
    try {
        await store.createPost(formData);
        router.push('/blog');
    } catch (error) {
        console.error('Error creating post:', error);
    }
};
</script>
