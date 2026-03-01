import { IsUUID, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ClaimData } from '../interface/claims-repository.interface';

export class CreateClaimDto {
  @ApiProperty({
    description: 'UUID of the item being claimed',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'itemId must be a valid UUID' })
  itemId: string;

  @ApiProperty({
    description: 'Detailed proof and reasoning for the claim',
    example: 'I lost this item near the library on March 1st. It has my initials inside.',
  })
  @IsString({ message: 'description must be a string' })
  @IsNotEmpty({ message: 'description is required' })
  description: string;
}

export class ClaimResponseDto implements ClaimData {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  itemId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002' })
  claimantId: string;

  @ApiProperty({ example: 'I lost this item near the library on March 1st.' })
  description: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/...', nullable: true })
  proofImageUrl: string | null;

  @ApiProperty({ enum: ['PENDING', 'APPROVED', 'REJECTED'], example: 'PENDING' })
  status: 'PENDING' | 'APPROVED' | 'REJECTED';

  @ApiProperty({ example: '2026-03-01T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-03-01T10:30:00Z' })
  updatedAt: Date;

  @ApiProperty({ example: 'My Lost Wallet', nullable: true })
  itemTitle?: string;

  @ApiProperty({ example: 'John Doe', nullable: true })
  claimantName?: string;

  @ApiProperty({ example: 'john@example.com', nullable: true })
  claimantEmail?: string;
}

export class PaginatedClaimsResponseDto {
  @ApiProperty({ type: [ClaimResponseDto] })
  claims: ClaimResponseDto[];

  @ApiProperty({ example: 25 })
  total: number;
}
