export interface Product {
  id?: number;
  name: string;
  image: string;
  remaining: number;
  active: boolean;
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
