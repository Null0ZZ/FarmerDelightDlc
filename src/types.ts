export type Category = {
  id: string;
  name: string;
  description?: string;
};

export type ModItem = {
  id: string;
  name: string;
  texture?: string;
  currentCategoryId?: string;
  suggestedBy?: string;
};

export type ModMeta = {
  id: string;
  name: string;
  version: string;
  summary: string;
  tags: string[];
  lastUpdated: string;
  hero?: string;
  categories: Category[];
  items: ModItem[];
};

export type Contribution = {
  id: string;
  modId: string;
  itemId: string;
  newCategoryId: string;
  note?: string;
  contributor: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
};
