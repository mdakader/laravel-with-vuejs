import { defineStore } from 'pinia';
import axios from '../axios';
import router from '../router';

export const useProductStore = defineStore('product', {
    state: () => ({
        products: [],
        product: null,
        categories: [],
        loading: false,
        error: null,
        pagination: {
            current_page: 1,
            total: 0,
            per_page: 10
        }
    }),

    actions: {
        async fetchProducts(params = {}) {
            try {
                this.loading = true;
                const response = await axios.get('/products', { params });
                this.products = response.data.data.data;
                this.pagination = {
                    current_page: response.data.data.current_page,
                    total: response.data.data.total,
                    per_page: response.data.data.per_page
                };
            } catch (error) {
                this.error = error.response?.data?.message || 'Error fetching products';
            } finally {
                this.loading = false;
            }
        },

        // Changed the endpoint from '/categories/select' to '/categories'
        async fetchCategories() {
            try {
                const response = await axios.get('/get-categories');
                this.categories = response.data.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Error fetching categories';
            }
        },

        async createProduct(productData) {
            try {
                const formData = new FormData();
                Object.keys(productData).forEach(key => {
                    if (productData[key] !== null && productData[key] !== undefined) {
                        // Convert boolean to string '1' or '0' for FormData
                        if (key === 'is_active') {
                            formData.append(key, productData[key] ? '1' : '0');
                        } else {
                            formData.append(key, productData[key]);
                        }
                    }
                });

                const response = await axios.post('/products', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                return response.data;
            } catch (error) {
                throw error;
            }
        },

        async updateProduct(id, productData) {
            try {
                const formData = new FormData();
                Object.keys(productData).forEach(key => {
                    if (productData[key] !== null && productData[key] !== undefined) {
                        formData.append(key, productData[key]);
                    }
                });
                formData.append('_method', 'PUT');

                const response = await axios.post(`/products/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Error updating product';
                throw error;
            }
        },

        async deleteProduct(id) {
            try {
                await axios.delete(`/products/${id}`);
                this.products = this.products.filter(product => product.id !== id);
            } catch (error) {
                this.error = error.response?.data?.message || 'Error deleting product';
                throw error;
            }
        },

        async fetchProduct(id) {
            try {
                this.loading = true;
                const response = await axios.get(`/products/${id}`);
                this.product = response.data.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Error fetching product';
            } finally {
                this.loading = false;
            }
        }
    }
});
