import { CreateItemDto } from '../dto/items.dto';
import { CreateItemData, ItemCountByType, ItemData } from './item-repository.interface';

export interface IItemsService {
  createItem(dto: CreateItemData): Promise<ItemData>;
  getAllItems(): Promise<ItemData[]>;
  getItemById(id: string): Promise<ItemData>;
  getUserItems(userId: string): Promise<ItemData[]>;
  getUserItemCount(userId: string): Promise<ItemCountByType>;
  approveItem(id: string): Promise<ItemData>;
  rejectItem(id: string): Promise<ItemData>;
}

export const ITEMS_SERVICE = Symbol('ITEMS_SERVICE');