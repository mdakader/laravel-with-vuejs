<template>
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">Login</div>
                <div class="card-body">
                    <form @submit.prevent="handleSubmit">
                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input v-model="email" type="email" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Password</label>
                            <input v-model="password" type="password" class="form-control" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Login</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotification } from '../app'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')

const handleSubmit = async () => {
    try {
        await auth.login({
            email: email.value,
            password: password.value
        });
        const notification = useNotification();
        notification.success('Login successful');
        router.push('/')
    } catch (error) {
        const notification = useNotification();
        notification.error('Login failed: ' + (error.response?.data?.message || 'Please try again'));
        console.error(error)
    }
}

</script>
