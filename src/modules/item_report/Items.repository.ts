import { Injectable, Inject } from '@nestjs/common';
import { eq, count, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../../db/db.module';
import * as schema from '../../db/schema';
import { items } from '../../db/schema/index';
import { IItemsRepository, CreateItemData, ItemData, ItemCountByType } from './interface/item-repository.interface';

@Injectable()
export class ItemsRepository implements IItemsRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

    async getCountByUserId(userId: string): Promise<ItemCountByType> {
        // const result = await this.db
        //     .select({ count: count(items.id) })
        //     .from(items)
        //     .where(eq(items.submittedBy, userId));
        // return result[0]?.count ?? 0;

        const result = await this.db
            .select({
                lost: sql<number>`COUNT(CASE WHEN type = 'LOST' THEN 1 END)`,
                found: sql<number>`COUNT(CASE WHEN type = 'FOUND' THEN 1 END)`,
            })
            .from(items);
        
        return {
            lost: result[0]?.lost ?? 0,
            found: result[0]?.found ?? 0,
        };
    }

    async delete(id: string): Promise<void> {
        await this.db.delete(items).where(eq(items.id, id));
    }

    async create(data: CreateItemData): Promise<ItemData> {
        const [newItem] = await this.db
        .insert(items)
        .values({
            title: data.title,
            description: data.description,
            category: data.category,
            location: data.location,
            type: data.type,
            imageUrl: data.imageUrl,
            submittedBy: data.submittedBy,
            status: 'PENDING',
        })
        .returning();

        return newItem as ItemData;
    }

    async findAll(): Promise<ItemData[]> {
        const allItems = await this.db
        .select()
        .from(items);

        return allItems as ItemData[];
    }

    async findById(id: string): Promise<ItemData | null> {
        const [item] = await this.db
        .select()
        .from(items)
        .where(eq(items.id, id))
        .limit(1);

        return (item as ItemData) ?? null;
    }

    async findByUserId(userId: string): Promise<ItemData[]> {
        const userItems = await this.db
        .select()
        .from(items)
        .where(eq(items.submittedBy, userId));

        return userItems as ItemData[];
    }

    async updateStatus(
        id: string,
        status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CLAIMED',
    ): Promise<ItemData> {
        const [updatedItem] = await this.db
        .update(items)
        .set({ status })
        .where(eq(items.id, id))
        .returning();

        return updatedItem as ItemData;
    }
}