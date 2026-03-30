import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo, Job } from '../entities';
import { S3Service } from './s3.service';

@Injectable()
export class PhotosService {
  constructor(
    @InjectRepository(Photo) private photosRepo: Repository<Photo>,
    @InjectRepository(Job) private jobsRepo: Repository<Job>,
    private s3: S3Service,
  ) {}

  findByJob(jobId: string) {
    return this.photosRepo.find({
      where: { job_id: jobId },
      order: { created_at: 'ASC' },
    });
  }

  async upload(
    jobId: string,
    files: Express.Multer.File[],
    uploadedBy: string,
  ) {
    const job = await this.jobsRepo.findOne({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');

    const uploaded: Photo[] = [];
    for (const file of files) {
      const { key, url } = await this.s3.upload(file, `jobs/${jobId}`);
      const photo = this.photosRepo.create({
        job_id: jobId,
        s3_key: key,
        url,
        uploaded_by: uploadedBy,
        visible_to_customer: false,
      });
      uploaded.push(await this.photosRepo.save(photo));
    }
    return uploaded;
  }

  async toggleVisibility(photoId: string) {
    const photo = await this.photosRepo.findOne({ where: { id: photoId } });
    if (!photo) throw new NotFoundException('Photo not found');
    photo.visible_to_customer = !photo.visible_to_customer;
    return this.photosRepo.save(photo);
  }

  async updateCaption(photoId: string, caption: string) {
    const photo = await this.photosRepo.findOne({ where: { id: photoId } });
    if (!photo) throw new NotFoundException('Photo not found');
    photo.caption = caption;
    return this.photosRepo.save(photo);
  }

  async remove(photoId: string) {
    const photo = await this.photosRepo.findOne({ where: { id: photoId } });
    if (!photo) throw new NotFoundException('Photo not found');
    await this.s3.delete(photo.s3_key);
    return this.photosRepo.remove(photo);
  }
}
