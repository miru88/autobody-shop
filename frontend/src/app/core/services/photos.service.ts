import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Photo } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PhotosService {
  constructor(private api: ApiService) {}

  getByJob(jobId: string) {
    return this.api.get<Photo[]>(`jobs/${jobId}/photos`);
  }

  upload(jobId: string, files: File[]) {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    return this.api.postFormData<Photo[]>(`jobs/${jobId}/photos`, formData);
  }

  toggleVisibility(jobId: string, photoId: string) {
    return this.api.patch<Photo>(`jobs/${jobId}/photos/${photoId}/visibility`, {});
  }

  updateCaption(jobId: string, photoId: string, caption: string) {
    return this.api.patch<Photo>(`jobs/${jobId}/photos/${photoId}/caption`, { caption });
  }

  remove(jobId: string, photoId: string) {
    return this.api.delete(`jobs/${jobId}/photos/${photoId}`);
  }
}
