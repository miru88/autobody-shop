import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Customer, Vehicle } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CustomersService {
  constructor(private api: ApiService) {}

  getAll(search?: string) {
    return this.api.get<Customer[]>('customers', search ? { search } : undefined);
  }

  getOne(id: string) {
    return this.api.get<Customer>(`customers/${id}`);
  }

  create(data: Partial<Customer>) {
    return this.api.post<Customer>('customers', data);
  }

  update(id: string, data: Partial<Customer>) {
    return this.api.patch<Customer>(`customers/${id}`, data);
  }

  remove(id: string) {
    return this.api.delete(`customers/${id}`);
  }

  addVehicle(customerId: string, data: Partial<Vehicle>) {
    return this.api.post<Vehicle>(`customers/${customerId}/vehicles`, data);
  }

  updateVehicle(vehicleId: string, data: Partial<Vehicle>) {
    return this.api.patch<Vehicle>(`customers/vehicles/${vehicleId}`, data);
  }

  removeVehicle(vehicleId: string) {
    return this.api.delete(`customers/vehicles/${vehicleId}`);
  }
}
