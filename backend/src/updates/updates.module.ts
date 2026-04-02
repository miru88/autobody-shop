import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobUpdate, Job, Customer } from '../entities';
import { UpdatesService } from './updates.service';
import { UpdatesController } from './updates.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([JobUpdate, Job, Customer])],
  providers: [UpdatesService, NotificationService],
  controllers: [UpdatesController],
})
export class UpdatesModule {}
