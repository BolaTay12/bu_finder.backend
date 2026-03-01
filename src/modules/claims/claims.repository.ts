import { Injectable, Inject } from '@nestjs/common';
import { eq, and, count, desc } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../../db/db.module';
import * as schema from '../../db/schema';
import { claims, items, users } from '../../db/schema';
import { IClaimsRepository, CreateClaimData, ClaimData, CLAIMS_REPOSITORY } from './interface/claims-repository.interface';

@Injectable()
export class ClaimsRepository implements IClaimsRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: CreateClaimData): Promise<ClaimData> {
    const [newClaim] = await this.db
      .insert(claims)
      .values({
        itemId: data.itemId,
        claimantId: data.claimantId,
        description: data.description,
        proofImageUrl: data.proofImageUrl,
        status: 'PENDING',
      })
      .returning();

    // Fetch the claim with joined data
    return this.findById(newClaim.id) as Promise<ClaimData>;
  }

  async findById(id: string): Promise<ClaimData | null> {
    const [claim] = await this.db
      .select({
        id: claims.id,
        itemId: claims.itemId,
        claimantId: claims.claimantId,
        description: claims.description,
        proofImageUrl: claims.proofImageUrl,
        status: claims.status,
        createdAt: claims.createdAt,
        updatedAt: claims.updatedAt,
        itemTitle: items.title,
        claimantName: users.fullName,
        claimantEmail: users.email,
      })
      .from(claims)
      .leftJoin(items, eq(claims.itemId, items.id))
      .leftJoin(users, eq(claims.claimantId, users.id))
      .where(eq(claims.id, id))
      .limit(1);

    return (claim as ClaimData) ?? null;
  }

  async findByClaimantId(
    claimantId: string,
    limit: number,
    offset: number,
  ): Promise<{ claims: ClaimData[]; total: number }> {
    const claimRows = await this.db
      .select({
        id: claims.id,
        itemId: claims.itemId,
        claimantId: claims.claimantId,
        description: claims.description,
        proofImageUrl: claims.proofImageUrl,
        status: claims.status,
        createdAt: claims.createdAt,
        updatedAt: claims.updatedAt,
        itemTitle: items.title,
        claimantName: users.fullName,
        claimantEmail: users.email,
      })
      .from(claims)
      .leftJoin(items, eq(claims.itemId, items.id))
      .leftJoin(users, eq(claims.claimantId, users.id))
      .where(eq(claims.claimantId, claimantId))
      .orderBy(desc(claims.createdAt))
      .limit(limit)
      .offset(offset);

    const [countResult] = await this.db
      .select({ total: count() })
      .from(claims)
      .where(eq(claims.claimantId, claimantId));

    return {
      claims: claimRows as ClaimData[],
      total: countResult?.total ?? 0,
    };
  }

  async findAll(limit: number, offset: number): Promise<{ claims: ClaimData[]; total: number }> {
    const claimRows = await this.db
      .select({
        id: claims.id,
        itemId: claims.itemId,
        claimantId: claims.claimantId,
        description: claims.description,
        proofImageUrl: claims.proofImageUrl,
        status: claims.status,
        createdAt: claims.createdAt,
        updatedAt: claims.updatedAt,
        itemTitle: items.title,
        claimantName: users.fullName,
        claimantEmail: users.email,
      })
      .from(claims)
      .leftJoin(items, eq(claims.itemId, items.id))
      .leftJoin(users, eq(claims.claimantId, users.id))
      .orderBy(desc(claims.createdAt))
      .limit(limit)
      .offset(offset);

    const [countResult] = await this.db
      .select({ total: count() })
      .from(claims);

    return {
      claims: claimRows as ClaimData[],
      total: countResult?.total ?? 0,
    };
  }

  async updateStatus(
    id: string,
    status: 'PENDING' | 'APPROVED' | 'REJECTED',
  ): Promise<ClaimData> {
    const [updatedClaim] = await this.db
      .update(claims)
      .set({ status, updatedAt: new Date() })
      .where(eq(claims.id, id))
      .returning();

    // Fetch the updated claim with joined data
    return this.findById(updatedClaim.id) as Promise<ClaimData>;
  }

  async findExistingClaim(itemId: string, claimantId: string): Promise<ClaimData | null> {
    const [claim] = await this.db
      .select({
        id: claims.id,
        itemId: claims.itemId,
        claimantId: claims.claimantId,
        description: claims.description,
        proofImageUrl: claims.proofImageUrl,
        status: claims.status,
        createdAt: claims.createdAt,
        updatedAt: claims.updatedAt,
        itemTitle: items.title,
        claimantName: users.fullName,
        claimantEmail: users.email,
      })
      .from(claims)
      .leftJoin(items, eq(claims.itemId, items.id))
      .leftJoin(users, eq(claims.claimantId, users.id))
      .where(
        and(
          eq(claims.itemId, itemId),
          eq(claims.claimantId, claimantId),
          eq(claims.status, 'PENDING'),
        ),
      )
      .limit(1);

    return (claim as ClaimData) ?? null;
  }
}
