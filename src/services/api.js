// /src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3017',  // Base URL de la API
  headers: {
    'Content-Type': 'application/json',
  },
});

export const loginUser = async (username, password) => {
  try {
    const response = await api.post('/login', {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchProducts = async () => {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchOrders = async () => {
  try {
    const response = await api.get('/orders');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/create_order', orderData);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createPayment = async (paymentData) => {
  try {
    const response = await api.post('/create_payment', paymentData);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
