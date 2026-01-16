export interface Product {
  id?: number;
  uniqueKey: string; // Simple identifier for sync (e.g., '1', '2', '3')
  name: string;
  image: string;
  remaining: number;
  active: boolean;
  probability?: number;
}

export interface SpinLog {
  id?: number;
  productId: number;
  productName: string;
  date: Date;
}

export interface Setting {
  key: string;
  value: string;
}
