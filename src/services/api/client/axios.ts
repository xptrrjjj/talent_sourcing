import axios from 'axios';
import { API_CONFIG } from './config';
import { setupInterceptors } from './interceptors';

// Create axios instance with config
const apiClient = axios.create(API_CONFIG);

// Setup interceptors
setupInterceptors(apiClient);

export { apiClient };