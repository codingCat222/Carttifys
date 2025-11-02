export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const USER_ROLES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin'
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const PRODUCT_CATEGORIES = [
  'electronics',
  'fashion',
  'home',
  'sports',
  'beauty',
  'books',
  'other'
];

export const COMMISSION_RATE = 0.05; // 5%

export const VERIFICATION_FEE = 20.00;