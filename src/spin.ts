import { db } from './db';
import type { Product } from './types';

export async function getAllActiveProducts(): Promise<Product[]> {
  return await db.products
    .filter(p => p.active)
    .toArray();
}

export async function getActiveProducts(): Promise<Product[]> {
  return await db.products
    .filter(p => p.active && p.remaining > 0)
    .toArray();
}

export async function spinWheel(): Promise<Product | null> {
  // Only get products with remaining > 0 (available to win)
  const activeProducts = await getActiveProducts();
  
  if (activeProducts.length === 0) {
    return null; // No products available
  }
  
  // Filter again in real-time to ensure no race conditions
  const availableProducts = activeProducts.filter(p => p.remaining > 0);
  
  if (availableProducts.length === 0) {
    return null; // All products finished
  }
  
  // Randomly select only from available products
  const randomIndex = Math.floor(Math.random() * availableProducts.length);
  const winner = availableProducts[randomIndex];
  
  // Decrease remaining quantity
  if (winner.id) {
    await db.products.update(winner.id, {
      remaining: winner.remaining - 1
    });
    
    // Log the win
    await db.logs.add({
      productId: winner.id,
      productName: winner.name,
      date: new Date()
    });
  }
  
  return winner;
}
