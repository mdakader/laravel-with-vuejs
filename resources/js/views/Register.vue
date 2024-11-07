<template>
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">Register</div>
                <div class="card-body">
                    <div v-if="error" class="alert alert-danger">{{ error }}</div>
                    <form @submit.prevent="handleSubmit">
                        <div class="mb-3">
                            <label class="form-label">Name</label>
                            <input v-model="name" type="text" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input v-model="email" type="email" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Password</label>
                            <input v-model="password" type="password" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Confirm Password</label>
                            <input v-model="password_confirmation" type="password" class="form-control" required>
                        </div>
                        <button type="submit" class="btn btn-primary" :disabled="loading">
                            {{ loading ? 'Registering...' : 'Register' }}
                        </button>
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

const router = useRouter()
const auth = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const password_confirmation = ref('')
const error = ref('')
const loading = ref(false)

const handleSubmit = async () => {
    try {
        loading.value = true
        error.value = ''

        await auth.register({
            name: name.value,
            email: email.value,
            password: password.value,
            password_confirmation: password_confirmation.value
        })

        router.push('/verify-email')
    } catch (err) {
        console.error('Registration error:', err)
        error.value = err.response?.data?.message || 'Registration failed. Please try again.'
    } finally {
        loading.value = false
    }
}
</script>
