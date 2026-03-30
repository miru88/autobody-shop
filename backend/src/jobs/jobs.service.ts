import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IsString, IsOptional, IsUUID, IsDateString, IsIn,
} from 'class-validator';
import { Job, JobStatus } from '../entities';

export class CreateJobDto {
  @IsUUID() customer_id: string;
  @IsOptional() @IsUUID() vehicle_id?: string;
  @IsString() description: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsDateString() date_received?: string;
  @IsOptional() @IsDateString() estimated_completion?: string;
}

export class UpdateJobStatusDto {
  @IsIn(['received', 'assessment', 'in_progress', 'paint', 'quality_check', 'ready', 'collected'])
  status: JobStatus;
}

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job) private jobsRepo: Repository<Job>,
  ) {}

  findAll() {
    return this.jobsRepo.find({
      relations: ['customer', 'vehicle'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    const job = await this.jobsRepo.findOne({
      where: { id },
      relations: ['customer', 'vehicle', 'photos', 'invoices'],
    });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async findByPortalToken(token: string) {
    const job = await this.jobsRepo.findOne({
      where: { portal_token: token },
      relations: [
        'customer',
        'vehicle',
        'photos',
        'invoices',
        'invoices.line_items',
      ],
    });
    if (!job) throw new NotFoundException('Job not found');

    // Filter photos to only customer-visible ones
    job.photos = job.photos.filter((p) => p.visible_to_customer);
    return job;
  }

  async create(dto: CreateJobDto) {
    const job = this.jobsRepo.create(dto);
    return this.jobsRepo.save(job);
  }

  async update(id: string, dto: Partial<CreateJobDto>) {
    const job = await this.findOne(id);
    Object.assign(job, dto);
    return this.jobsRepo.save(job);
  }

  async updateStatus(id: string, status: JobStatus) {
    const job = await this.findOne(id);
    job.status = status;
    return this.jobsRepo.save(job);
  }

  async remove(id: string) {
    const job = await this.findOne(id);
    return this.jobsRepo.remove(job);
  }
}
