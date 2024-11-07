<template>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">Profile</div>
                    <div class="card-body">
                        <!-- Loading state -->
                        <div v-if="isLoading" class="text-center">
                            <div class="spinner-border" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>

                        <!-- Profile content -->
                        <div v-else-if="auth.user">
                            <p v-if="auth.user.photo">
                                <img :src="`/storage/${auth.user.photo}`" alt="Profile Photo" width="100">
                            </p>
                            <p><strong>Name:</strong> {{ auth.user.name }}</p>
                            <p><strong>Email:</strong> {{ auth.user.email }}</p>
                            <p><strong>Username:</strong> {{ auth.user.username || 'Not set' }}</p>
                            <p><strong>Phone:</strong> {{ auth.user.phone || 'Not set' }}</p>
                            <p><strong>Address:</strong> {{ auth.user.address || 'Not set' }}</p>

                            <router-link to="/update-profile" class="btn btn-primary">
                                Edit Profile
                            </router-link>
                        </div>

                        <!-- Error state -->
                        <div v-else class="alert alert-danger">
                            Unable to load profile information
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const isLoading = ref(true)

onMounted(async () => {
    try {
        if (!auth.user) {
            await auth.fetchUser()
        }
    } catch (error) {
        console.error('Error loading profile:', error)
    } finally {
        isLoading.value = false
    }
})
</script>

<style scoped>
.btn-primary {
    color: white !important;
    text-decoration: none;
}

.card {
    margin-top: 2rem;
}

img {
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #eee;
    padding: 2px;
}
</style>
