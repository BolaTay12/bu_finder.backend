import { CreateItemDto } from '../dto/create_item.dto';
import { ItemData } from './item-repository.interface';

export interface IItemsService {
  createItem(userId: string, dto: CreateItemDto): Promise<ItemData>;
  getAllItems(): Promise<ItemData[]>;
  getItemById(id: string): Promise<ItemData>;
  getUserItems(userId: string): Promise<ItemData[]>;
  approveItem(id: string): Promise<ItemData>;
  rejectItem(id: string): Promise<ItemData>;
}

export const ITEMS_SERVICE = Symbol('ITEMS_SERVICE');