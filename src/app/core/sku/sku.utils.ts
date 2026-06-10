import { ProductCategory } from '../inventory/inventory.models';

export const SKU_PREFIX_BY_CATEGORY: Record<ProductCategory, 'TEC-' | 'HOG-'> = {
  TECNOLOGIA: 'TEC-',
  HOGAR: 'HOG-',
};

export const SKU_PATTERN = /^(TEC|HOG)-[A-Z0-9]+$/;

export function normalizeSku(value: string | null | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

export function expectedSkuPrefix(category: ProductCategory | null | undefined): 'TEC-' | 'HOG-' | null {
  return category ? SKU_PREFIX_BY_CATEGORY[category] : null;
}

export function hasAllowedSkuFormat(value: string | null | undefined): boolean {
  return SKU_PATTERN.test(normalizeSku(value));
}
