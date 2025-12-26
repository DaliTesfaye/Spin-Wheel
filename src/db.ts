import Dexie, { type Table } from 'dexie';
import type { Product, SpinLog, Setting } from './types';

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
