import { CreateItemDto } from '../dto/create_item.dto';
import { CreateItemData, ItemData } from './item-repository.interface';

export interface IItemsService {
  createItem(dto: CreateItemData): Promise<ItemData>;
  getAllItems(): Promise<ItemData[]>;
  getItemById(id: string): Promise<ItemData>;
  getUserItems(userId: string): Promise<ItemData[]>;
  getUserItemCount(userId: string): Promise<number>;
  approveItem(id: string): Promise<ItemData>;
  rejectItem(id: string): Promise<ItemData>;
}

export const ITEMS_SERVICE = Symbol('ITEMS_SERVICE');