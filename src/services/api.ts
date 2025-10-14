
import products from '../data/products.json';
import coas from '../data/mock_coas.json';
import retailers from '../data/retailers.json';
import { CONFIG } from '../config';

export type TerpMap = Record<string, number>;

export type Coa = {
  productId: string;
  thc: number;
  cbd: number;
  terpenes: TerpMap;
  harvestDate?: string;
  packDate?: string;
  coaUrl: string;
};

export type Product = {
  id: string;
  line: 'Signature' | 'PhytoLogic';
  name: string;
  size: string;
  form: string;
  batchPrefix: string;
  image?: string;
};

export type Retailer = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone?: string;
};

export async function fetchProduct(productId: string): Promise<Product | undefined> {
  if (CONFIG.USE_REMOTE_API) {
    const r = await fetch(`${CONFIG.REMOTE_BASE_URL}/api/products/${productId}`);
    if (r.ok) return r.json();
    return undefined;
  }
  return (products as Product[]).find(p => p.id === productId);
}

export async function fetchCoaByBatch(batchId: string): Promise<Coa | undefined> {
  if (CONFIG.USE_REMOTE_API) {
    const r = await fetch(`${CONFIG.REMOTE_BASE_URL}/api/batch/${batchId}`);
    if (r.ok) return r.json();
    return undefined;
  }
  const c = (coas as Record<string, Coa>)[batchId];
  return c;
}

export async function fetchRetailers(): Promise<Retailer[]> {
  if (CONFIG.USE_REMOTE_API) {
    const r = await fetch(`${CONFIG.REMOTE_BASE_URL}/api/retailers`);
    if (r.ok) return r.json();
    return [];
  }
  return retailers as Retailer[];
}
