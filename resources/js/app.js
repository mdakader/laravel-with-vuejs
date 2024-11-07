import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'

// Configure toastr globally
toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: 'toast-bottom-right',
    preventDuplicates: true,
    timeOut: 3000,
    extendedTimeOut: 1000,
    showEasing: 'swing',
    hideEasing: 'linear',
    showMethod: 'fadeIn',
    hideMethod: 'fadeOut'
}

// Create a global notification utility
const notification = {
    success(message) {
        toastr.success(message)
    },
    error(message) {
        toastr.error(message)
    },
    warning(message) {
        toastr.warning(message)
    },
    info(message) {
        toastr.info(message)
    }
}

const app = createApp(App)

// Add notification as a global property
app.config.globalProperties.$notification = notification

// Create a composable for using notifications in setup scripts
export const useNotification = () => notification

app.use(createPinia())
app.use(router)
app.mount('#app')

export default app
