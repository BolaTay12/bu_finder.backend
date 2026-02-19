import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateItemDto, CreateItemResponseDto, GetItemsResponseDto, ItemResponseDto } from './dto/create_item.dto';
import { JwtAuthGuard, RolesGuard } from '../../auth/guards';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators';
import { ITEMS_SERVICE, type IItemsService } from './interface/item-service.interface';
import { responseStatus } from 'src/db/schema';

@ApiTags('Items')
@Controller('items')
export class ItemsController {
  constructor(
    @Inject(ITEMS_SERVICE)
    private readonly itemsService: IItemsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Report a lost or found item' })
  @ApiResponse({ status: 201, description: 'Item reported successfully', type: CreateItemResponseDto })
  async createItem(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateItemDto,
  ): Promise<CreateItemResponseDto> {
    const item = await this.itemsService.createItem(userId, dto);
    return {
      status: responseStatus.SUCCESS,
      message: 'Item reported successfully',
      data: item
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all items' })
  @ApiResponse({ status: 200, description: 'Items retrieved successfully', type: GetItemsResponseDto })
  async getAllItems(): Promise<GetItemsResponseDto> {
    const items = await this.itemsService.getAllItems();
    return {
      status: responseStatus.SUCCESS,
      message: 'Items retrieved successfully',
      data: items,
    };
  }

  @Get('my-items')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user items' })
  @ApiResponse({ status: 200, description: 'User items retrieved successfully', type: GetItemsResponseDto })
  async getUserItems(
    @CurrentUser('id') userId: string,
  ): Promise<GetItemsResponseDto> {
    const items = await this.itemsService.getUserItems(userId);
    return {
      status: responseStatus.SUCCESS,
      message: 'User items retrieved successfully',
      data: items,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get item by ID' })
  @ApiResponse({ status: 200, description: 'Item retrieved successfully', type: CreateItemResponseDto })
  async getItemById(
    @Param('id') id: string,
  ): Promise<CreateItemResponseDto> {
    const item = await this.itemsService.getItemById(id);
    return {
      status: responseStatus.SUCCESS,
      message: 'Item retrieved successfully',
      data: item,
    };
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin: Approve an item (ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Item approved successfully', type: CreateItemResponseDto })
  async approveItem(
    @Param('id') id: string,
  ): Promise<CreateItemResponseDto> {
    const item = await this.itemsService.approveItem(id);
    return {
      status: responseStatus.SUCCESS,
      message: 'Item approved successfully',
      data: item,
    };
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin: Reject an item (ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Item rejected successfully', type: CreateItemResponseDto })
  async rejectItem(
    @Param('id') id: string,
  ): Promise<CreateItemResponseDto> {
    const item = await this.itemsService.rejectItem(id);
    return {
      status: responseStatus.SUCCESS,
      message: 'Item rejected successfully',
      data: item,
    };
  }
}