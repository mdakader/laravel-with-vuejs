<template>
    <div class="create-category">
        <h2>Create Category</h2>
        <form @submit.prevent="createCategory">
            <div class="form-group">
                <label for="name">Name</label>
                <input type="text" v-model="category.name" id="name" class="form-control" required />
            </div>

            <div class="form-group">
                <label for="description">Description</label>
                <textarea v-model="category.description" id="description" class="form-control" required></textarea>
            </div>

            <div class="form-group">
                <label for="image">Image</label>
                <input type="file" @change="handleFileUpload" id="image" class="form-control" />
            </div>

            <button type="submit" class="btn btn-primary">Create Category</button>
        </form>
    </div>
</template>

<script>
import { useCategoryStore } from '../stores/categoryStore';
import { useNotification } from '../app';

export default {
    data() {
        return {
            category: {
                name: '',
                description: '',
                image: null,
            },
        };
    },
    setup() {
        const categoryStore = useCategoryStore();
        const notification = useNotification();
        return { categoryStore, notification };
    },
    methods: {
        handleFileUpload(event) {
            this.category.image = event.target.files[0];
        },
        async createCategory() {
            try {
                const formData = new FormData();
                formData.append('name', this.category.name);
                formData.append('description', this.category.description);
                if (this.category.image) {
                    formData.append('image', this.category.image);
                }

                // Await the store's createCategory method and handle response
                await this.categoryStore.createCategory(formData);
                this.notification.success('Category created successfully');
                this.$router.push('/categories'); // Navigate to categories page on success
            } catch (error) {
                this.notification.error('An error occurred while creating the category.');
                console.error('Category creation error:', error);
            }
        }
    },
};
</script>
