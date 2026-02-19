import { itemStatuses, itemTypes } from 'src/db/schema/enums';
import { ItemResponseDto } from '../dto/create_item.dto';

export interface CreateItemData {
  title: string;
  description: string;
  category: string;
  location: string;
  type: itemTypes;
  imageUrl?: string;
  submittedBy: string;
}


export interface IItemsRepository {
    create(data: CreateItemData): Promise<ItemResponseDto>;
    findAll(): Promise<ItemResponseDto[]>;
    findById(id: string): Promise<ItemResponseDto | null>;
    findByUserId(userId: string): Promise<ItemResponseDto[]>;
    updateStatus(id: string, status: itemStatuses): Promise<ItemResponseDto>;
    delete(id: string): Promise<void>;
}

export const ITEMS_REPOSITORY = Symbol('ITEMS_REPOSITORY');