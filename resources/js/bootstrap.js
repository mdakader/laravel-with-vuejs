import axios from 'axios';

window.axios = axios;

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://127.0.0.1:8000';  // Make sure this matches your Laravel URL
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
