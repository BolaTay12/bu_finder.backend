import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ClaimData, IClaimsRepository, CLAIMS_REPOSITORY } from './interface/claims-repository.interface';
import { IClaimsService } from './interface/claims-service.interface';
import { CreateClaimDto } from './dto/claims.dto';
import { ITEMS_SERVICE, IItemsService } from '../item_report/interface/item-service.interface';
import { NOTIFICATIONS_SERVICE, INotificationsService } from '../notifications/interface/notifications-service.interface';

@Injectable()
export class ClaimsService implements IClaimsService {
  private readonly logger = new Logger(ClaimsService.name);

  constructor(
    @Inject(CLAIMS_REPOSITORY)
    private readonly claimsRepository: IClaimsRepository,
    @Inject(ITEMS_SERVICE)
    private readonly itemsService: IItemsService,
    @Inject(NOTIFICATIONS_SERVICE)
    private readonly notificationsService: INotificationsService,
  ) {}

  async submitClaim(
    userId: string,
    dto: CreateClaimDto,
    proofImageUrl?: string,
  ): Promise<ClaimData> {
    // Fetch item
    const item = await this.itemsService.getItemById(dto.itemId).catch(() => null);
    if (!item) {
      throw new NotFoundException('Item not found');
    }

    // Verify item status is APPROVED
    if (item.status !== 'APPROVED') {
      throw new BadRequestException('Item must be in APPROVED status to claim');
    }

    // Block self-claims
    if (item.submittedBy === userId) {
      throw new ForbiddenException('Cannot claim your own item');
    }

    // Check for existing PENDING claim
    const existingClaim = await this.claimsRepository.findExistingClaim(dto.itemId, userId);
    if (existingClaim) {
      throw new BadRequestException('You already have a pending claim for this item');
    }

    // Create claim
    const claim = await this.claimsRepository.create({
      itemId: dto.itemId,
      claimantId: userId,
      description: dto.description,
      proofImageUrl,
    });

    return claim;
  }

  async approveClaim(claimId: string): Promise<ClaimData> {
    // Fetch claim
    const claim = await this.claimsRepository.findById(claimId);
    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    // Verify status is PENDING
    if (claim.status !== 'PENDING') {
      throw new BadRequestException('Only PENDING claims can be approved');
    }

    // Update claim status to APPROVED
    const updatedClaim = await this.claimsRepository.updateStatus(claimId, 'APPROVED');

    // Update item status to CLAIMED
    try {
      await this.itemsService.updateStatus(claim.itemId, 'CLAIMED' as any);
    } catch (error) {
      this.logger.error(
        `Error updating item status to CLAIMED for item ${claim.itemId}:`,
        error,
      );
    }

    // Send notification to claimant
    try {
      await this.notificationsService.createNotification(
        claim.claimantId,
        'Claim Approved',
        `Your claim for "${claim.itemTitle}" has been approved!`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending approval notification to claimant ${claim.claimantId}:`,
        error,
      );
    }

    return updatedClaim;
  }

  async rejectClaim(claimId: string): Promise<ClaimData> {
    // Fetch claim
    const claim = await this.claimsRepository.findById(claimId);
    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    // Verify status is PENDING
    if (claim.status !== 'PENDING') {
      throw new BadRequestException('Only PENDING claims can be rejected');
    }

    // Update claim status to REJECTED
    const updatedClaim = await this.claimsRepository.updateStatus(claimId, 'REJECTED');

    // Send notification to claimant
    try {
      await this.notificationsService.createNotification(
        claim.claimantId,
        'Claim Rejected',
        `Your claim for "${claim.itemTitle}" has been rejected.`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending rejection notification to claimant ${claim.claimantId}:`,
        error,
      );
    }

    return updatedClaim;
  }

  async getClaimById(id: string): Promise<ClaimData> {
    const claim = await this.claimsRepository.findById(id);
    if (!claim) {
      throw new NotFoundException('Claim not found');
    }
    return claim;
  }

  async getMyClaims(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<{ claims: ClaimData[]; total: number }> {
    return this.claimsRepository.findByClaimantId(userId, limit, offset);
  }

  async getAllClaims(limit: number, offset: number): Promise<{ claims: ClaimData[]; total: number }> {
    return this.claimsRepository.findAll(limit, offset);
  }
}
