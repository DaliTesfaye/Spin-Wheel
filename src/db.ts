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
    
    // Upgrade to version 2 to add probability field
    this.version(2).stores({
      products: '++id, name, active, remaining, probability',
      logs: '++id, productId, date',
      settings: 'key'
    }).upgrade(tx => {
      // Set default probability to existing products
      return tx.table('products').toCollection().modify(product => {
        if (!product.probability) {
          product.probability = 12.5; // Default equal probability for 8 slots
        }
      });
    });
    
    // Upgrade to version 3 to add uniqueKey field
    this.version(3).stores({
      products: '++id, uniqueKey, name, active, remaining, probability',
      logs: '++id, productId, date',
      settings: 'key'
    }).upgrade(tx => {
      // Generate uniqueKey for existing products based on name and index
      return tx.table('products').toCollection().modify((product, cursor) => {
        if (!product.uniqueKey) {
          const index = cursor.key;
          product.uniqueKey = `product-${index}`;
        }
      });
    });
    
    // Upgrade to version 4 to add displayCount field
    this.version(4).stores({
      products: '++id, uniqueKey, name, active, remaining, probability, displayCount',
      logs: '++id, productId, date',
      settings: 'key'
    }).upgrade(tx => {
      // Set default displayCount to 1 for existing products
      return tx.table('products').toCollection().modify(product => {
        if (!product.displayCount) {
          product.displayCount = 1;
        }
      });
    });

    // Upgrade to version 5 to add 'remaining' to logs
    this.version(5).stores({
      products: '++id, uniqueKey, name, active, remaining, probability, displayCount',
      logs: '++id, productId, date, remaining',
      settings: 'key'
    });
  }
}

export const db = new SpinWheelDB();

// Initialize database with predefined products (smart sync with auto-update)
export async function initializeProducts() {
  const existingProducts = await db.products.toArray();
  
  // Filter out products without uniqueKey (old schema) and create map
  const existingByKey = new Map(
    existingProducts
      .filter(p => p.uniqueKey) // Only include products with uniqueKey
      .map(p => [p.uniqueKey, p])
  );
  
  const newProducts = [];
  const updatedProducts = [];
  
  for (const codeProduct of INITIAL_PRODUCTS) {
    const existingProduct = existingByKey.get(codeProduct.uniqueKey);
    
    if (!existingProduct) {
      // Product doesn't exist - add it
      newProducts.push(codeProduct);
    } else {
      // Product exists - check if any field changed
      const needsUpdate = 
        existingProduct.name !== codeProduct.name ||
        existingProduct.image !== codeProduct.image ||
        existingProduct.active !== codeProduct.active ||
        existingProduct.probability !== codeProduct.probability;
      
      if (needsUpdate) {
        // Update fields (preserve remaining quantity)
        await db.products.update(existingProduct.id!, {
          name: codeProduct.name,
          image: codeProduct.image,
          active: codeProduct.active,
          probability: codeProduct.probability
        });
        updatedProducts.push(codeProduct.uniqueKey);
      }
    }
  }
  
  // Delete old products without uniqueKey (from old schema)
  const productsToDelete = existingProducts.filter(p => !p.uniqueKey);
  if (productsToDelete.length > 0) {
    for (const product of productsToDelete) {
      await db.products.delete(product.id!);
    }
    console.log('🗑️ Removed', productsToDelete.length, 'old product(s) without uniqueKey');
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
  
  if (newProducts.length === 0 && updatedProducts.length === 0 && productsToDelete.length === 0) {
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
