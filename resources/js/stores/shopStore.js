import { defineStore } from 'pinia';
import axios from '../axios';

export const useShopStore = defineStore('shop', {
    state: () => ({
        products: [],
        product: null,
        categories: [],
        loading: false,
        error: null,
        pagination: {
            current_page: 1,
            total: 0,
            per_page: 12
        }
    }),

    actions: {
        async fetchProducts(params = {}) {
            try {
                this.loading = true;
                const response = await axios.get('/shop', { params });
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

        async fetchCategories() {
            try {
                const response = await axios.get('/shop/categories');
                this.categories = response.data.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Error fetching categories';
            }
        },

        async fetchProduct(slug) {
            try {
                this.loading = true;
                const response = await axios.get(`/shop/product/${slug}`);
                this.product = response.data.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Error fetching product';
            } finally {
                this.loading = false;
            }
        },
    }
});
