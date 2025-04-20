export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
}

export interface ApiResponse {
  responseCode: number;
  message: string;
  content: Record<string, any>;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface FormInfo {
  id: string;
  title: string;
} 