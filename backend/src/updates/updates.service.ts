import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';
import { Job, Customer, JobUpdate } from '../entities';
import { NotificationService } from './notification.service';

export class CreateUpdateDto {
  @IsString() message: string;
  @IsOptional() @IsArray() @IsUUID('4', { each: true }) photo_ids?: string[];
}

@Injectable()
export class UpdatesService {
  private readonly logger = new Logger(UpdatesService.name);

  constructor(
    @InjectRepository(JobUpdate) private updatesRepo: Repository<JobUpdate>,
    @InjectRepository(Job) private jobsRepo: Repository<Job>,
    @InjectRepository(Customer) private customersRepo: Repository<Customer>,
    private notificationSvc: NotificationService,
  ) {}

  async findAllForJob(jobId: string): Promise<JobUpdate[]> {
    return this.updatesRepo.find({
      where: { job_id: jobId },
      order: { sent_at: 'DESC' },
    });
  }

  async create(jobId: string, dto: CreateUpdateDto, sentBy: string): Promise<JobUpdate> {
    const job = await this.jobsRepo.findOne({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');

    const customer = await this.customersRepo.findOne({ where: { id: job.customer_id } });
    if (!customer) throw new NotFoundException('Customer not found');

    const update = this.updatesRepo.create({
      job_id: jobId,
      customer_id: customer.id,
      message: dto.message,
      photo_ids: dto.photo_ids ?? [],
      channel_used: customer.preferred_channel,
      sent_by: sentBy,
    });

    const saved = await this.updatesRepo.save(update);

    try {
      await this.notificationSvc.send({
        channel: customer.preferred_channel,
        to_email: customer.email,
        to_phone: customer.phone,
        customer_name: customer.name,
        message: dto.message,
      });
    } catch (err) {
      this.logger.error(
        `Notification failed for update ${saved.id} via ${customer.preferred_channel}: ${err.message}`,
      );
    }

    return saved;
  }
}
