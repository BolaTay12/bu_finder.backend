import { ClaimData } from './claims-repository.interface';
import { CreateClaimDto } from '../dto/claims.dto';

export interface IClaimsService {
  submitClaim(userId: string, dto: CreateClaimDto, proofImageUrl?: string): Promise<ClaimData>;
  getClaimById(id: string): Promise<ClaimData>;
  getMyClaims(userId: string, limit: number, offset: number): Promise<{ claims: ClaimData[]; total: number }>;
  getAllClaims(limit: number, offset: number): Promise<{ claims: ClaimData[]; total: number }>;
  approveClaim(claimId: string): Promise<ClaimData>;
  rejectClaim(claimId: string): Promise<ClaimData>;
}

export const CLAIMS_SERVICE = Symbol('CLAIMS_SERVICE');
