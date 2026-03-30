import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UploadedFiles, UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PhotosService } from './photos.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('jobs/:jobId/photos')
export class PhotosController {
  constructor(private photosService: PhotosService) {}

  @Get()
  findAll(@Param('jobId') jobId: string) {
    return this.photosService.findByJob(jobId);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files', 20))
  upload(
    @Param('jobId') jobId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: any,
  ) {
    return this.photosService.upload(jobId, files, user.sub);
  }

  @Patch(':id/visibility')
  toggleVisibility(@Param('id') id: string) {
    return this.photosService.toggleVisibility(id);
  }

  @Patch(':id/caption')
  updateCaption(@Param('id') id: string, @Body('caption') caption: string) {
    return this.photosService.updateCaption(id, caption);
  }

  @Roles('owner')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.photosService.remove(id);
  }
}
