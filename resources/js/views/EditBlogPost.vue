<template>
    <div class="container mt-4">
        <h2>Edit Blog Post</h2>
        <BlogPostForm
            v-if="currentPost"
            :initial-data="currentPost"
            :editing="true"
            @submit="handleSubmit"
        />
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useBlogStore } from '@/stores/blogStore';
import BlogPostForm from '@/components/BlogPostForm.vue';

const router = useRouter();
const route = useRoute();
const store = useBlogStore();

onMounted(async () => {
    await store.fetchPost(route.params.id);
});

const handleSubmit = async (formData) => {
    try {
        await store.updatePost(route.params.id, formData);
        router.push('/blog');
    } catch (error) {
        console.error('Error updating post:', error);
    }
};
</script>
