import { defineStore } from 'pinia';
import axios from '../axios';
import router from '../router';

export const useCategoryStore = defineStore('category', {
    state: () => ({
        categories: [],
        currentCategory: null,
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

        // Fetch list of categories
        async fetchCategories() {
            try {
                const response = await axios.get('/categories', {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                });
                this.categories = response.data;
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        },

        // Fetch single category by ID
        async fetchCategory(id) {
            try {
                const response = await axios.get(`/categories/${id}`, {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                });
                this.currentCategory = response.data;
            } catch (error) {
                console.error('Error fetching category:', error);
            }
        },

        // Create a new category
        async createCategory(categoryData) {
            try {
                const response = await axios.post('/categories', categoryData, {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });
                this.categories.push(response.data);
                return response.data; // Return response data to confirm success in component
            } catch (error) {
                console.error('Error creating category:', error);
                throw error; // Rethrow the error for handling in the component
            }
        },

        // Update an existing category by ID
        async updateCategory(id, categoryData) {
            try {
                categoryData.append('_method', 'PUT');
                const response = await axios.post(`/categories/${id}`, categoryData, {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });

                // Update the current post and posts list
                this.currentCategory = response.data.category;
                this.categories = this.categories.map(category =>
                    category.id === id ? { ...category, ...response.data.category } : category
                );

                console.log('Category updated in store:', this.currentCategory);
                return response;
            } catch (error) {
                if (error.response && error.response.data && error.response.data.message) {
                    throw new Error(`Error updating category: ${error.response.data.message}`);
                } else {
                    throw new Error('An unexpected error occurred while updating the category.');
                }
            }
        },

        // Delete category by ID
        async deleteCategory(id) {
            try {
                await axios.delete(`/categories/${id}`, {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                });
                this.categories = this.categories.filter(category => category.id !== id);
            } catch (error) {
                console.error('Error deleting category:', error);
            }
        },
    },
});
