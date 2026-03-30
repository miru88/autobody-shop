import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Job, JobStatus } from '../models/models';

@Injectable({ providedIn: 'root' })
export class JobsService {
  constructor(private api: ApiService) {}

  getAll() {
    return this.api.get<Job[]>('jobs');
  }

  getOne(id: string) {
    return this.api.get<Job>(`jobs/${id}`);
  }

  getByPortalToken(token: string) {
    return this.api.get<Job>(`jobs/portal/${token}`);
  }

  create(data: Partial<Job>) {
    return this.api.post<Job>('jobs', data);
  }

  update(id: string, data: Partial<Job>) {
    return this.api.patch<Job>(`jobs/${id}`, data);
  }

  updateStatus(id: string, status: JobStatus) {
    return this.api.patch<Job>(`jobs/${id}/status`, { status });
  }

  remove(id: string) {
    return this.api.delete(`jobs/${id}`);
  }
}
