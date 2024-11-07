<template>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">Update Profile</div>
                    <div class="card-body">
                        <!-- Loading state -->
                        <div v-if="isLoading" class="text-center">
                            <div class="spinner-border" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>

                        <form v-else @submit.prevent="updateProfile" novalidate>
                            <!-- Name field -->
                            <div class="mb-3">
                                <label class="form-label required">Name</label>
                                <input
                                    v-model.trim="formData.name"
                                    type="text"
                                    class="form-control"
                                    :class="{ 'is-invalid': errors.name }"
                                    required
                                >
                                <div class="invalid-feedback" v-if="errors.name">
                                    {{ errors.name[0] }}
                                </div>
                            </div>

                            <!-- Email field -->
                            <div class="mb-3">
                                <label class="form-label required">Email</label>
                                <input
                                    v-model.trim="formData.email"
                                    type="email"
                                    class="form-control"
                                    :class="{ 'is-invalid': errors.email }"
                                    required
                                >
                                <div class="invalid-feedback" v-if="errors.email">
                                    {{ errors.email[0] }}
                                </div>
                            </div>

                            <!-- Username field -->
                            <div class="mb-3">
                                <label class="form-label">Username</label>
                                <input
                                    v-model.trim="formData.username"
                                    type="text"
                                    class="form-control"
                                    :class="{ 'is-invalid': errors.username }"
                                >
                                <div class="invalid-feedback" v-if="errors.username">
                                    {{ errors.username[0] }}
                                </div>
                            </div>

                            <!-- Phone field -->
                            <div class="mb-3">
                                <label class="form-label">Phone</label>
                                <input
                                    v-model.trim="formData.phone"
                                    type="text"
                                    class="form-control"
                                    :class="{ 'is-invalid': errors.phone }"
                                >
                                <div class="invalid-feedback" v-if="errors.phone">
                                    {{ errors.phone[0] }}
                                </div>
                            </div>

                            <!-- Address field -->
                            <div class="mb-3">
                                <label class="form-label">Address</label>
                                <textarea
                                    v-model.trim="formData.address"
                                    class="form-control"
                                    :class="{ 'is-invalid': errors.address }"
                                ></textarea>
                                <div class="invalid-feedback" v-if="errors.address">
                                    {{ errors.address[0] }}
                                </div>
                            </div>

                            <!-- Current photo preview -->
                            <div class="mb-3" v-if="auth.user.photo">
                                <label class="form-label">Current Photo</label>
                                <div>
                                    <img :src="`/storage/${auth.user.photo}`" alt="Current Profile Photo" width="100">
                                </div>
                            </div>

                            <!-- Photo field -->
                            <div class="mb-3">
                                <label class="form-label">Update Photo</label>
                                <input
                                    @change="handleFileUpload"
                                    type="file"
                                    class="form-control"
                                    :class="{ 'is-invalid': errors.photo }"
                                    accept="image/*"
                                >
                                <div class="invalid-feedback" v-if="errors.photo">
                                    {{ errors.photo[0] }}
                                </div>
                            </div>

                            <div class="d-flex gap-2">
                                <button type="submit" class="btn btn-primary">Update Profile</button>
                                <router-link to="/profile" class="btn btn-secondary">Cancel</router-link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '../axios'
import { useAuthStore } from '../stores/auth'

import { useNotification } from '../app'
const notification = useNotification()
const router = useRouter()
const auth = useAuthStore()
const errors = ref({})
const isLoading = ref(true)

const formData = ref({
    name: '',
    email: '',
    username: '',
    phone: '',
    address: '',
    photo: null
})

// Initialize form with current user data
onMounted(async () => {
    try {
        if (!auth.user) {
            await auth.fetchUser()
        }

        formData.value = {
            name: auth.user.name || '',
            email: auth.user.email || '',
            username: auth.user.username || '',
            phone: auth.user.phone || '',
            address: auth.user.address || '',
            photo: null
        }
    } catch (error) {
        console.error('Error loading user data:', error)
    } finally {
        isLoading.value = false
    }
})

const handleFileUpload = (event) => {
    formData.value.photo = event.target.files[0]
}

const updateProfile = async () => {
    try {
        errors.value = {} // Clear previous errors

        console.log('Submitting form data:', formData.value) // Debug log

        // Client-side validation
        if (!formData.value.name?.trim()) {
            errors.value.name = ['Name is required']
            return
        }

        const email = formData.value.email?.trim();
        if (!email) {
            errors.value.email = ['Please enter your email address']
            return
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.value.email = ['Please enter a valid email address']
            return
        }

        // Create FormData to handle file upload and text data
        const profileData = new FormData()

        // Append all fields, even if empty
        profileData.append('name', formData.value.name.trim())
        profileData.append('email', formData.value.email.trim())
        profileData.append('username', formData.value.username?.trim() || '')
        profileData.append('phone', formData.value.phone?.trim() || '')
        profileData.append('address', formData.value.address?.trim() || '')

        if (formData.value.photo) {
            profileData.append('photo', formData.value.photo)
        }

        // Debug log FormData contents
        for (let pair of profileData.entries()) {
            console.log(pair[0] + ': ' + pair[1])
        }

        // Send the data to the backend
        const response = await axios.post('/api/profile-update', profileData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            }
        })

        console.log('Server response:', response.data) // Debug log

        // Update the user info in the store
        auth.setUser(response.data.user)

        // Show success message and redirect
        // alert('Profile updated successfully')

        // Show success notification
        notification.success('Profile updated successfully')
        router.push('/profile')

    } catch (error) {
        console.error('Profile update error:', error) // Debug log
        console.error('Error response:', error.response?.data) // Debug log

        if (error.response?.data?.errors) {
            errors.value = error.response.data.errors
            console.log('Validation errors:', errors.value) // Debug log
        } else {
            // Show success notification
            notification.error('Failed to update profile. Please try again.')
            // alert(error.response?.data?.message || 'Failed to update profile. Please try again.')
        }
    }
}
</script>

<style scoped>
.required::after {
    content: " *";
    color: red;
}

.card {
    margin-top: 2rem;
}

img {
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #eee;
    padding: 2px;
    margin-top: 0.5rem;
}

.form-control {
    margin-top: 0.25rem;
}

.card-body {
    padding: 2rem;
}
</style>
