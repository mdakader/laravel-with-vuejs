import { defineStore } from 'pinia';

// Set up an Axios interceptor to include the auth token in every request
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // Adjust to wherever you store the token
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const useBlogStore = defineStore('blog', {
    state: () => ({
        posts: [],
        currentPost: null,
        loading: false,
        error: null
    }),

    actions: {
        async fetchPosts() {
            this.loading = true;
            try {
                const response = await axios.get('/api/blog-posts');
                this.posts = response.data;
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },

        async fetchPost(id) {
            this.loading = true;
            try {
                const response = await axios.get(`/api/blog-posts/${id}`);
                this.currentPost = response.data;
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },

        async createPost(formData) {
            try {
                const response = await axios.post('/api/blog-posts', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                this.posts.unshift(response.data);
                return response.data;
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },

        async updatePost(id, formData) {
            try {
                const response = await axios.post(`/api/blog-posts/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                const index = this.posts.findIndex(p => p.id === id);
                if (index !== -1) {
                    this.posts[index] = response.data;
                }
                return response.data;
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },

        async deletePost(id) {
            try {
                await axios.delete(`/api/blog-posts/${id}`);
                this.posts = this.posts.filter(p => p.id !== id);
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        }
    }
});
