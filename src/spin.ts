import { db } from './db';
import type { Product } from './types';

export async function getAllActiveProducts(): Promise<Product[]> {
  const products = await db.products
    .filter(p => p.active)
    .toArray();
  
  // Sort by uniqueKey to ensure consistent order (1, 2, 3, 4, 5, 6, 7, 8)
  return products.sort((a, b) => {
    const numA = parseInt(a.uniqueKey);
    const numB = parseInt(b.uniqueKey);
    return numA - numB;
  });
}

export async function getActiveProducts(): Promise<Product[]> {
  return await db.products
    .filter(p => p.active && p.remaining > 0)
    .toArray();
}

export async function spinWheel(): Promise<Product | null> {
  // Get all active products (including empty slots)
  const activeProducts = await getAllActiveProducts();
  
  if (activeProducts.length === 0) {
    return null; // No products available
  }
  
  // Filter products with remaining > 0
  const availableProducts = activeProducts.filter(p => p.remaining > 0);
  
  if (availableProducts.length === 0) {
    return null; // All products finished
  }
  
  // TEMPORARY: Simple random selection (no probability weighting)
  const randomIndex = Math.floor(Math.random() * availableProducts.length);
  const winner: Product = availableProducts[randomIndex];
  
  // Check if it's an empty slot (Try Again)
  const isEmptySlot = winner.name.includes('Prochaine');
  
  // Decrease remaining quantity only for real prizes (not empty slots)
  if (winner.id && !isEmptySlot) {
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
  
  // Return null for empty slots to trigger "Try Again" modal
  return isEmptySlot ? null : winner;
}
