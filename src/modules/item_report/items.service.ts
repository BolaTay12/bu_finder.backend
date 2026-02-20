import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateItemData, ItemCountByType, ItemData, ITEMS_REPOSITORY, type IItemsRepository, } from './interface/item-repository.interface';
import { IItemsService } from './interface/item-service.interface';
import { itemStatuses } from 'src/db/schema';

@Injectable()
export class ItemsService implements IItemsService {
  constructor(
    @Inject(ITEMS_REPOSITORY)
    private readonly itemsRepository: IItemsRepository,
  ) {}

    async getUserItemCount(userId: string): Promise<ItemCountByType> {
        return this.itemsRepository.getCountByUserId(userId);
    }

    async createItem( dto: CreateItemData): Promise<ItemData> {
        return this.itemsRepository.create({
        title: dto.title,
        description: dto.description,
        category: dto.category,
        location: dto.location,
        type: dto.type,
        imageUrl: dto.imageUrl,
        submittedBy: dto.submittedBy,
        });
    }

    async getAllItems(): Promise<ItemData[]> {
        return this.itemsRepository.findAll();
    }

    async getItemById(id: string): Promise<ItemData> {
        const item = await this.itemsRepository.findById(id);
        if (!item) {
        throw new NotFoundException(`Item with ID ${id} not found`);
        }
        return item;
    }

    async getUserItems(userId: string): Promise<ItemData[]> {
        return this.itemsRepository.findByUserId(userId);
    }

    async approveItem(id: string): Promise<ItemData> {
        const item = await this.getItemById(id);
        if (item.status !== 'PENDING') {
        throw new ForbiddenException('Only PENDING items can be approved');
        }
        return this.itemsRepository.updateStatus(id, itemStatuses.APPROVED);
    }

    async rejectItem(id: string): Promise<ItemData> {
        const item = await this.getItemById(id);
        if (item.status !== 'PENDING') {
        throw new ForbiddenException('Only PENDING items can be rejected');
        }
        return this.itemsRepository.updateStatus(id, itemStatuses.REJECTED);
    }
}