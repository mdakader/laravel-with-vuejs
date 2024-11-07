<template>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">Verify Email</div>
                    <div class="card-body">
                        <form @submit.prevent="handleSubmit">
                            <div class="mb-3">
                                <label class="form-label">Email</label>
                                <input v-model="form.email" type="email" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">OTP</label>
                                <input v-model="form.otp" type="text" class="form-control" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Verify</button>
                            <button @click="resendOtp" type="button" class="btn btn-secondary ms-2">Resend OTP</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const form = ref({
    email: '',
    otp: '',
});

const handleSubmit = async () => {
    try {
        await authStore.verifyEmail(form.value);
        router.push('/login');
    } catch (error) {
        console.error(error);
        alert(error.response?.data?.message || 'Verification failed'); // Display error to the user
    }
};


const resendOtp = async () => {
    try {
        await axios.post('/api/resend-otp', { email: form.value.email });
        alert('OTP has been resent to your email');
    } catch (error) {
        console.error(error);
    }
};
</script>
