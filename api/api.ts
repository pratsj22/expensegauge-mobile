// api.ts
import axios from 'axios';
import { API_URL } from '@env'; // loaded from .env file

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
