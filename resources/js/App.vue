<template>
    <div class="container mt-4">
        <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4">
            <div class="container-fluid">
                <!-- Navbar brand -->
                <router-link class="navbar-brand" to="/">App</router-link>

                <!-- Authenticated/Unauthenticated Links -->
                <div class="navbar-nav">
                    <!-- Show login/register if not authenticated -->
                    <template v-if="!auth.isAuthenticated">
                        <router-link class="nav-link" to="/login">Login</router-link>
                        <router-link class="nav-link" to="/register">Register</router-link>
                    </template>
                    <!-- Show logout if authenticated -->
                    <a v-else @click.prevent="handleLogout" class="nav-link" href="#">Logout</a>
                </div>
            </div>
        </nav>

        <!-- Main router view for page content -->
        <router-view></router-view>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

onMounted(async () => {
    if (!auth.token && localStorage.getItem('token')) {
        auth.token = localStorage.getItem('token')
    }
    if (auth.token) {
        try {
            await auth.fetchUser()
            if (!auth.isEmailVerified) {
                router.push('/verify-email')
            }
        } catch (error) {
            auth.token = null
            localStorage.removeItem('token')
            router.push('/login')
        }
    } else {
        router.push('/login')
    }
})

const handleLogout = async () => {
    try {
        await auth.logout()
    } catch (error) {
        console.error('Logout error:', error)
    } finally {
        router.push('/login')
    }
}
</script>
