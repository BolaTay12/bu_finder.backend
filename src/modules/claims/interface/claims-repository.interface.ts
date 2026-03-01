export interface CreateClaimData {
  itemId: string;
  claimantId: string;
  description: string;
  proofImageUrl?: string;
}

export interface ClaimData {
  id: string;
  itemId: string;
  claimantId: string;
  description: string;
  proofImageUrl: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
  itemTitle?: string;
  claimantName?: string;
  claimantEmail?: string;
}

export interface IClaimsRepository {
  create(data: CreateClaimData): Promise<ClaimData>;
  findById(id: string): Promise<ClaimData | null>;
  findByClaimantId(claimantId: string, limit: number, offset: number): Promise<{ claims: ClaimData[]; total: number }>;
  findAll(limit: number, offset: number): Promise<{ claims: ClaimData[]; total: number }>;
  updateStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<ClaimData>;
  findExistingClaim(itemId: string, claimantId: string): Promise<ClaimData | null>;
}

export const CLAIMS_REPOSITORY = Symbol('CLAIMS_REPOSITORY');
