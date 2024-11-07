import { defineStore } from 'pinia';
import axios from 'axios';

export const useProductStore = defineStore('product', {
    state: () => ({
        products: [],
        loading: false,
        error: null
    }),

    actions: {
        async fetchProducts() {
            this.loading = true;
            try {
                const response = await axios.get('/api/products');
                this.products = response.data;
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },

        async createProduct(formData) {
            try {
                const response = await axios.post('/api/products', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                this.products.push(response.data);
                return response.data;
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },

        async updateProduct(id, formData) {
            try {
                const response = await axios.post(`/api/products/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                const index = this.products.findIndex(p => p.id === id);
                if (index !== -1) {
                    this.products[index] = response.data;
                }
                return response.data;
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },

        async deleteProduct(id) {
            try {
                await axios.delete(`/api/products/${id}`);
                this.products = this.products.filter(p => p.id !== id);
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        }
    }
});
