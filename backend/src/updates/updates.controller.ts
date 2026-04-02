import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { UpdatesService, CreateUpdateDto } from './updates.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('jobs/:jobId/updates')
export class UpdatesController {
  constructor(private updatesService: UpdatesService) {}

  @Get()
  findAll(@Param('jobId') jobId: string) {
    return this.updatesService.findAllForJob(jobId);
  }

  @Post()
  create(
    @Param('jobId') jobId: string,
    @Body() dto: CreateUpdateDto,
    @CurrentUser() user: { sub: string; name: string },
  ) {
    return this.updatesService.create(jobId, dto, user.sub);
  }
}
