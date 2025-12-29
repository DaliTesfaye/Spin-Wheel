import Dexie, { type Table } from 'dexie';
import type { Product, SpinLog, Setting } from './types';
import { INITIAL_PRODUCTS } from './initialProducts';

export class SpinWheelDB extends Dexie {
  products!: Table<Product, number>;
  logs!: Table<SpinLog, number>;
  settings!: Table<Setting, string>;

  constructor() {
    super('SpinWheelDB');
    
    this.version(1).stores({
      products: '++id, name, active, remaining',
      logs: '++id, productId, date',
      settings: 'key'
    });
  }
}

export const db = new SpinWheelDB();

// Initialize database with predefined products (smart sync with auto-update)
export async function initializeProducts() {
  const existingProducts = await db.products.toArray();
  const existingByName = new Map(existingProducts.map(p => [p.name, p]));
  
  const newProducts = [];
  const updatedProducts = [];
  
  for (const codeProduct of INITIAL_PRODUCTS) {
    const existingProduct = existingByName.get(codeProduct.name);
    
    if (!existingProduct) {
      // Product doesn't exist - add it
      newProducts.push(codeProduct);
    } else {
      // Product exists - check if image or active status changed
      const needsUpdate = 
        existingProduct.image !== codeProduct.image ||
        existingProduct.active !== codeProduct.active;
      
      if (needsUpdate) {
        // Update only image and active status (preserve remaining quantity)
        await db.products.update(existingProduct.id!, {
          image: codeProduct.image,
          active: codeProduct.active
        });
        updatedProducts.push(codeProduct.name);
      }
    }
  }
  
  // Add new products
  if (newProducts.length > 0) {
    await db.products.bulkAdd(newProducts);
    console.log('✅ Added', newProducts.length, 'new product(s):', newProducts.map(p => p.name).join(', '));
  }
  
  // Log updates
  if (updatedProducts.length > 0) {
    console.log('🔄 Updated', updatedProducts.length, 'product(s):', updatedProducts.join(', '));
  }
  
  if (newProducts.length === 0 && updatedProducts.length === 0) {
    if (existingProducts.length === 0) {
      // First time - add all products
      await db.products.bulkAdd(INITIAL_PRODUCTS);
      console.log('✅ Database initialized with', INITIAL_PRODUCTS.length, 'products');
    } else {
      console.log('✅ All products synced - no changes needed');
    }
  }
}

// Force reload products from initialProducts.ts (useful for development)
export async function reloadProducts() {
  await db.products.clear();
  await db.products.bulkAdd(INITIAL_PRODUCTS);
  console.log('Products reloaded from initialProducts.ts');
}

// Call initialization when database is ready
initializeProducts();
