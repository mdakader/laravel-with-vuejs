//router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cartStore'

const routes = [
    {
        path: '/login',
        name: 'login',
        component: () => import('@/views/Login.vue')
    },
    {
        path: '/register',
        name: 'register',
        component: () => import('@/views/Register.vue')
    },
    {
        path: '/verify-email',
        name: 'verify-email',
        component: () => import('@/views/EmailVerification.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { requiresAuth: true, requiresVerification: true }
    },
    {
        path: '/',
        redirect: '/dashboard'
    },
    {
        path: '/profile',
        component: () => import('@/views/Profile.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/update-profile',
        name: 'update-profile',
        component: () => import('@/views/ProfileUpdate.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/posts',
        name: 'posts',
        component: () => import('@/views/BlogPosts.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/blog/create',
        name: 'create-post',
        component: () => import('@/views/CreateBlogPost.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/posts/:id/edit',
        name: 'edit-post',
        component: () => import('@/views/EditBlogPost.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/posts/:id',
        name: 'blog-post',
        component: () => import('@/views/BlogPost.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/categories',
        name: 'categories',
        component: () => import('@/views/Categories.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/categories/create',
        name: 'create-category',
        component: () => import('@/views/CreateCategory.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/categories/:id/edit',
        name: 'edit-category',
        component: () => import('@/views/EditCategory.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/categories/:id',
        name: 'view-categories',
        component: () => import('@/views/Category.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/products',
        name: 'products',
        component: () => import('@/views/ProductList.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/products/create',
        name: 'product-create',
        component: () => import('@/views/ProductCreate.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/products/:id/edit',
        name: 'product-edit',
        component: () => import('@/views/ProductEdit.vue'),
        meta: { requiresAuth: true },
        props: true
    },

    {
        path: '/shop',
        name: 'shop',
        component: () => import('@/components/ShopGrid.vue')
    },
    {
        path: '/shop/product/:slug',
        name: 'shop-product',
        component: () => import('@/views/ShopProduct.vue')
    },
    {
        path: '/cart',
        name: 'cart',
        component: () => import('@/views/Cart.vue')
    },

    {
        path: '/cart/checkout',
        name: 'checkout',
        component: () => import('@/views/Checkout.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/order/confirmation',
        name: 'OrderConfirmation',
        component: () => import('@/views/OrderConfirmation.vue'),
        props: route => ({
            paymentIntent: route.query.payment_intent,
            paymentIntentClientSecret: route.query.payment_intent_client_secret,
            redirectStatus: route.query.redirect_status
        })
    },
    {
        path: '/orders',
        name: 'orders',
        component: () => import('@/views/Orders.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/orders/:id',
        name: 'order-details',
        component: () => import('@/views/OrderDetails.vue'),
        meta: { requiresAuth: true }
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(async (to, from, next) => {
    const auth = useAuthStore();
    const cart = useCartStore();

    try {
        if (to.meta.requiresAuth && !auth.isAuthenticated) {
            // If trying to access checkout, store that as redirect
            if (to.path === '/cart/checkout') {
                localStorage.setItem('redirectAfterLogin', '/cart/checkout');
            } else {
                localStorage.setItem('redirectAfterLogin', to.fullPath);
            }
            next('/login');
            return;
        }

        if (!cart.initialized) {
            await cart.initialize();
        }

        if (['/cart', '/checkout'].includes(to.path)) {
            await cart.refreshCart();
        }

        next();
    } catch (error) {
        console.error('Navigation error:', error);
        next('/login');
    }
});

export default router;
