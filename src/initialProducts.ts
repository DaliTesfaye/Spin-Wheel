import type { Product } from './types';

// Predefined products that will be automatically added to the database
export const INITIAL_PRODUCTS: Omit<Product, 'id'>[] = [
  {
    name: 'Air Fryer',
    image: '/images/products/air-fryer.jpg',
    remaining: 10,
    active: true
  },
  {
    name: 'Cheese Board Set',
    image: '/images/products/cheese.png',
    remaining: 10,
    active: true
  },
  {
    name: 'AirPods Pro',
    image: '/images/products/airpods.jpg',
    remaining: 15,
    active: true
  },
  {
    name: 'PlayStation 5',
    image: '/images/products/ps5.jpg',
    remaining: 5,
    active: true
  },
  {
    name: 'Nintendo Switch',
    image: '/images/products/switch.jpg',
    remaining: 8,
    active: true
  },
  {
    name: 'MacBook Air',
    image: '/images/products/macbook.jpg',
    remaining: 3,
    active: true
  },
  {
    name: 'iPad Pro',
    image: '/images/products/ipad.jpg',
    remaining: 12,
    active: true
  },
  {
    name: 'Apple Watch',
    image: '/images/products/watch.jpg',
    remaining: 10,
    active: true
  }
];
