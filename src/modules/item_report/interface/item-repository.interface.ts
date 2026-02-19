import { itemStatuses, itemTypes } from 'src/db/schema/enums';

export interface CreateItemData {
  title: string;
  description: string;
  category: string;
  location: string;
  type: itemTypes;
  imageUrl?: string;
  submittedBy: string;
}

export interface ItemData {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  type: itemTypes;
  status: itemStatuses;
  imageUrl: string | null;
  submittedBy: string;
  dateReported: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IItemsRepository {
    create(data: CreateItemData): Promise<ItemData>;
    findAll(): Promise<ItemData[]>;
    findById(id: string): Promise<ItemData | null>;
    findByUserId(userId: string): Promise<ItemData[]>;
    getCountByUserId(userId: string): Promise<number>;
    updateStatus(id: string, status: itemStatuses): Promise<ItemData>;
    delete(id: string): Promise<void>;
}

export const ITEMS_REPOSITORY = Symbol('ITEMS_REPOSITORY');