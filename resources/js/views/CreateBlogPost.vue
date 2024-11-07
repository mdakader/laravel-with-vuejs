<template>
    <div class="create-blog-post">
        <h2>Create Blog Post</h2>
        <form @submit.prevent="createPost">
            <div class="form-group">
                <label for="title">Title</label>
                <input type="text" v-model="post.title" id="title" class="form-control" required>
            </div>

            <div class="form-group">
                <label for="content">Description</label>
                <textarea v-model="post.description" id="content" class="form-control" required></textarea>
            </div>

            <div class="form-group">
                <label for="image">Image</label>
                <input type="file" @change="handleFileUpload" id="image" class="form-control">
            </div>

            <button type="submit" class="btn btn-primary">Create Post</button>
        </form>
    </div>
</template>

<script>
import { useBlogStore } from '../stores/blogStore';
import axios from '../axios';
import { useNotification } from '../app'
const notification = useNotification()
export default {
    data() {
        return {
            post: {
                title: '',
                description: '',
                image: null,
            }
        };
    },
    methods: {
        handleFileUpload(event) {
            const file = event.target.files[0];
            this.post.image = file;
        },
        async createPost() {
            const formData = new FormData();
            formData.append('title', this.post.title);
            formData.append('description', this.post.description);
            formData.append('image', this.post.image);

            const blogStore = useBlogStore();

            if (!blogStore.token) {
                console.error('No token found');
                return;
            }

            try {
                const response = await axios.post('/api/posts', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${blogStore.token}`,  // Include the token here
                    },
                });
                console.log('Post created successfully', response);
                // Show success notification
                notification.success('Post updated successfully')
                this.$router.push('/posts');
            } catch (error) {
                notification.error('Failed to update post. Please try again.')
                console.error('Error creating blog post', error);
            }
        }
    }
};
</script>
