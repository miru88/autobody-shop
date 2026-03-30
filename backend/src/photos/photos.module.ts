import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Photo, Job } from '../entities';
import { PhotosService } from './photos.service';
import { PhotosController } from './photos.controller';
import { S3Service } from './s3.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Photo, Job]),
    MulterModule.register({ storage: memoryStorage() }),
  ],
  providers: [PhotosService, S3Service],
  controllers: [PhotosController],
})
export class PhotosModule {}
