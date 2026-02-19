import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { itemStatuses, itemTypeEnum, itemTypes } from 'src/db/schema';

export class CreateItemDto {
  @ApiProperty({ example: 'Lost iPhone 15', description: 'Item title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Black iPhone with cracked screen', description: 'Detailed description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Electronics', description: 'Item category' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'Library', description: 'Location where item was lost/found' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: 'LOST', enum: ['LOST', 'FOUND'], description: 'Item type' })
  @IsEnum(itemTypeEnum)
  type: itemTypes;

  @ApiProperty({ example: 'https://res.cloudinary.com/...', required: false, description: 'Image URL from Cloudinary' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class ItemResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Lost iPhone 15' })
  title: string;

  @ApiProperty({ example: 'Black iPhone with cracked screen' })
  description: string;

  @ApiProperty({ example: 'Electronics' })
  category: string;

  @ApiProperty({ example: 'Library' })
  location: string;

  @ApiProperty({ example: 'LOST', enum: ['LOST', 'FOUND'] })
  type: itemTypes;

  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'APPROVED', 'REJECTED', 'CLAIMED'] })
  status: itemStatuses;

  @ApiProperty({ example: 'https://res.cloudinary.com/...', nullable: true })
  imageUrl: string | null;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174111' })
  submittedBy: string;

  @ApiProperty()
  dateReported: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CreateItemResponseDto {
  @ApiProperty({ example: 'success', enum: ['success', 'error'] })
  status: string;

  @ApiProperty({ example: 'Item reported successfully' })
  message: string;

  @ApiProperty({ type: ItemResponseDto })
  data: ItemResponseDto;
}

export class GetItemsResponseDto {
  @ApiProperty({ example: 'success', enum: ['success', 'error'] })
  status: string;

  @ApiProperty({ example: 'Items retrieved successfully' })
  message: string;

  @ApiProperty({ type: [ItemResponseDto] })
  data: ItemResponseDto[];
}