import { apiClient } from './client';
import type { Category } from '@/types';

// Backend response types
interface BackendCategory {
  _id: string;
  name: string;
  parentId?: string | null;
  productCount: number;
  createdAt: string;
  updatedAt: string;
  children?: BackendCategory[];
}

// Helper to generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Transform backend category to frontend Category type
const transformCategory = (backendCategory: BackendCategory, parentId?: string): Category => {
  const slug = generateSlug(backendCategory.name);
  
  return {
    id: backendCategory._id,
    name: backendCategory.name,
    slug,
    parentId,
    children: backendCategory.children?.map(child => transformCategory(child, backendCategory._id)),
  };
};

/**
 * Get all categories (2-level hierarchy)
 */
export const getAllCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get<BackendCategory[]>('/categories');
  return response.data.map(cat => transformCategory(cat));
};

/**
 * Get category by ID
 */
export const getCategoryById = async (id: string): Promise<Category> => {
  const response = await apiClient.get<BackendCategory>(`/categories/${id}`);
  return transformCategory(response.data);
};

/**
 * Find category by slug from a list of categories
 * This is a client-side helper since backend doesn't support slug lookup
 */
export const findCategoryBySlug = (categories: Category[], slug: string): Category | null => {
  // Check parent categories
  for (const category of categories) {
    if (category.slug === slug) {
      return category;
    }
    // Check children
    if (category.children) {
      const child = category.children.find(c => c.slug === slug);
      if (child) {
        return { ...child, parent: category } as Category & { parent: Category };
      }
    }
  }
  return null;
};

/**
 * Find category ID by slug
 */
export const findCategoryIdBySlug = (categories: Category[], slug: string): string | null => {
  const category = findCategoryBySlug(categories, slug);
  return category?.id || null;
};
