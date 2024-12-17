import { AxiosInstance } from 'axios';
import { setupRequestInterceptor } from './request';
import { setupResponseInterceptor } from './response';

export function setupInterceptors(client: AxiosInstance) {
  setupRequestInterceptor(client);
  setupResponseInterceptor(client);
}