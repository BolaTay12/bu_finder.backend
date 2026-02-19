import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { ItemsRepository } from './Items.repository';
import { ITEMS_REPOSITORY, ITEMS_SERVICE } from './interface';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [ItemsController],
  providers: [
    ItemsService,
    {
      provide: ITEMS_REPOSITORY,
      useClass: ItemsRepository,
    },
    {
      provide: ITEMS_SERVICE,
      useClass: ItemsService,
    },
  ],
  exports: [ITEMS_SERVICE],
})
export class ItemsModule {}