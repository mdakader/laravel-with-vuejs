<template>
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">Email Verification</div>
                <div class="card-body">
                    <form @submit.prevent="verifyEmail">
                        <div class="mb-3">
                            <label class="form-label">Enter OTP</label>
                            <input v-model="otp" type="text" class="form-control" required>
                        </div>
                        <button type="submit" class="btn btn-primary me-2">Verify Email</button>
                        <button @click.prevent="resendOTP" class="btn btn-secondary">Resend OTP</button>
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
import axios from '../axios'

const router = useRouter()
const auth = useAuthStore()
const otp = ref('')

const verifyEmail = async () => {
    if (otp.value.length !== 6 || isNaN(otp.value)) {
        alert("OTP should be a 6-digit number.");
        return;
    }
    try {
        const response = await axios.post('/api/verify-email', { otp: otp.value });
        if (response.status === 200) {
            const userResponse = await axios.get('/api/user');
            auth.user = userResponse.data; // Directly update the user in the store
            router.push('/dashboard');
        } else {
            throw new Error('Verification failed');
        }
    } catch (error) {
        console.error('Verification error:', error);
        alert('Failed to verify email. Please check the OTP and try again.');
    }
};

const resendOTP = async () => {
    try {
        await axios.post('/api/resend-otp')
        alert('OTP resent successfully')
    } catch (error) {
        console.error(error)
    }
}

</script>
