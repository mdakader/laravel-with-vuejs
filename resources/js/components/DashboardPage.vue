<template>
    <div class="container mt-4">
        <div class="row">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        Dashboard
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">Welcome {{ authStore.user?.name }}</h5>
                        <div class="mt-3">
                            <router-link to="/profile" class="btn btn-primary me-2">Profile</router-link>
                            <button @click="logout" class="btn btn-danger">Logout</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const logout = async () => {
    try {
        await authStore.logout();
        router.push('/login');
    } catch (error) {
        console.error(error);
    }
};
</script>
