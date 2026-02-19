import { CreateItemDto, ItemResponseDto } from '../dto/create_item.dto';

export interface IItemsService {
  createItem(userId: string, dto: CreateItemDto): Promise<ItemResponseDto>;
  getAllItems(): Promise<ItemResponseDto[]>;
  getItemById(id: string): Promise<ItemResponseDto>;
  getUserItems(userId: string): Promise<ItemResponseDto[]>;
  approveItem(id: string): Promise<ItemResponseDto>;
  rejectItem(id: string): Promise<ItemResponseDto>;
}

export const ITEMS_SERVICE = Symbol('ITEMS_SERVICE');