<!--App.vue-->
<template>
    <ul class="container header-section">
        <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4">
            <ul class="container text-center">
                <router-link class="navbar-brand ms-3" to="/">App</router-link>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <ul class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto me-3">
                        <li class="nav-item">
                            <router-link class="nav-link" to="/shop">Shop</router-link>
                        </li>
                        <li class="has-submenu submenu-option">
                            <a>Categories <i class="bi bi-arrow-down-short"></i></a>
                            <ul class="submenu">
                                <li><router-link to="/category/electronics">Electronics</router-link></li>
                                <li><router-link to="/category/clothing">Clothing</router-link></li>
                                <li><router-link to="/category/books">Books</router-link></li>
                            </ul>
                        </li>
                        <li class="nav-item">
                            <router-link class="nav-link" to="/cart/checkout">Checkout</router-link>
                        </li>
                        <!-- Cart Icon with Count -->
                        <li class="nav-item position-relative">
                            <router-link class="nav-link" to="/cart">
                                <i class="bi bi-cart-plus"></i>
                                <span v-if="cart.cartCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                   Cart {{ cart.cartCount }}
                                </span>
                            </router-link>
                        </li>

                        <div class="d-inline-flex" v-if="!auth.isAuthenticated">
                            <li class="nav-item">
                                <router-link class="nav-link" to="/login">Login</router-link>
                            </li>
                            <li class="nav-item">
                                <router-link class="nav-link" to="/register">Register</router-link>
                            </li>


                        </div>

                        <div class="d-inline-flex" v-if="auth.isAuthenticated">
                            <router-link class="nav-link" to="/posts">Blog</router-link>
                            <router-link class="nav-link" to="/categories">Categories</router-link>
                            <router-link class="nav-link" to="/products">Products</router-link>
                            <router-link class="nav-link" to="/profile">Profile</router-link>
                            <router-link class="nav-link" to="/dashboard">Dashboard</router-link>
                            <a @click.prevent="handleLogout" class="nav-link" href="#">Logout</a>
                        </div>
                    </ul>
                </ul>
            </ul>
        </nav>

        <router-view></router-view>
    </ul>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useCartStore } from './stores/cartStore'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()

onMounted(async () => {
    try {
        // Check for stored token and authenticate
        if (!auth.token && localStorage.getItem('token')) {
            auth.token = localStorage.getItem('token')
        }

        // If authenticated, fetch user data
        if (auth.token) {
            await auth.fetchUser()
            if (!auth.isEmailVerified) {
                router.push('/verify-email')
                return
            }
        }

        // Initialize cart
        if (auth.isAuthenticated) {
            // For authenticated users, initialize server cart
            await cart.initialize()
        } else {
            // For guest users, load cart from localStorage
            const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
            cart.setGuestCart(guestCart)
        }

    } catch (error) {
        console.error('Authentication error:', error)
        auth.clearAuthData()
        router.push('/login')
    }
})

const handleLogout = async () => {
    try {
        await auth.logout()
        cart.reset() // Reset cart on logout
        localStorage.removeItem('guestCart') // Clear guest cart as well
    } catch (error) {
        console.error('Logout error:', error)
    } finally {
        router.push('/login')
    }
}
</script>
<style>
/* Submenu Styling */
.submenu {
    position: absolute;
    top: 100%;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    opacity: 0;
    visibility: hidden;
    min-width: 200px;
    transition: all 0.3s ease;
    list-style: none;
    padding: 0;
    z-index: 1000;
}
li.has-submenu.submenu-option {
    display: flex;
    align-items: center;
    justify-content: center;
}
.has-submenu:hover > .submenu {
    opacity: 1;
    visibility: visible;
}

.submenu li {
    position: relative;
}

.submenu a {
    display: block;
    padding: 0.75rem 1.5rem;
    color: #333;
    text-decoration: none;
    transition: all 0.3s ease;
}

.submenu a:hover {
    background: #f8f9fa;
    color: #007bff;
}

/* Nested Submenu */
.submenu .submenu {
    top: 0;
    left: 100%;
}

/* Cart Styling */
.cart-link {
    position: relative;
}

.cart-count {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: #dc3545;
    color: white;
    border-radius: 50%;
    padding: 0.2rem 0.5rem;
    font-size: 0.75rem;
}
/* Optional: Animation for submenu */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.submenu {
    animation: fadeIn 0.3s ease-in-out;
}
/* Mobile Responsive Styles */
@media (max-width: 768px) {
    .nav-list {
        flex-direction: column;
        align-items: stretch;
    }

    .submenu {
        position: static;
        display: none;
        box-shadow: none;
        padding-left: 1rem;
    }

    .has-submenu:hover > .submenu {
        display: block;
    }

    .submenu .submenu {
        left: 0;
        top: 100%;
    }

    .nav-link {
        padding: 0.75rem 1rem;
    }

}

</style>
