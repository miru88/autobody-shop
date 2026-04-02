import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { JobUpdate } from '../models/models';

@Injectable({ providedIn: 'root' })
export class UpdatesService {
  constructor(private api: ApiService) {}

  getAll(jobId: string) {
    return this.api.get<JobUpdate[]>(`jobs/${jobId}/updates`);
  }

  send(jobId: string, message: string, photoIds: string[] = []) {
    return this.api.post<JobUpdate>(`jobs/${jobId}/updates`, {
      message,
      photo_ids: photoIds,
    });
  }
}
