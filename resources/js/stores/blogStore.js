import { defineStore } from 'pinia';
import axios from '../axios'; // Adjust the path based on your project structure
import router from '../router';

export const useBlogStore = defineStore('blog', {
    state: () => ({
        posts: [],
        currentPost: null,
        token: localStorage.getItem('token') || null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
    },

    actions: {
        // Set token
        setToken(token) {
            this.token = token;
            localStorage.setItem('token', token);
        },

        // Clear token
        clearToken() {
            this.token = null;
            localStorage.removeItem('token');
        },

        // Fetch list of posts
        async fetchPosts() {
            console.log('Fetching posts...');
            try {
                const response = await axios.get('/api/posts', {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                });
                console.log('Fetched posts:', response.data);
                this.posts = response.data;
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        },

        // Fetch single post by ID
        async fetchPost(id) {
            try {
                const response = await axios.get(`/api/posts/${id}`, {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                });
                this.currentPost = response.data;
            } catch (error) {
                console.error('Error fetching post:', error);
            }
        },

        // Create new post
        async createPost(postData) {
            try {
                const response = await axios.post('/api/posts', postData, {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });
                this.posts.push(response.data);
                router.push('/posts');
            } catch (error) {
                console.error('Error creating post:', error);
            }
        },

        // Update an existing post by ID
        async updatePost(id, postData) {
            try {
                postData.append('_method', 'PUT'); // Add override for PUT
                const response = await axios.post(`/api/posts/${id}`, postData, {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });

                // Update the current post and posts list
                this.currentPost = response.data.post;
                this.posts = this.posts.map(post =>
                    post.id === id ? { ...post, ...response.data.post } : post
                );

                console.log('Post updated in store:', this.currentPost);
                return response;
            } catch (error) {
                console.error('Error updating post:', error);
                throw error;
            }
        },

        // Delete post by ID
        async deletePost(id) {
            try {
                await axios.delete(`/api/posts/${id}`, {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                });
                this.posts = this.posts.filter(post => post.id !== id);
            } catch (error) {
                console.error('Error deleting post:', error);
            }
        },
    },
});
