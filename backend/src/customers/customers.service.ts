import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { IsString, IsEmail, IsOptional } from 'class-validator';
import { Customer, Vehicle } from '../entities';

export class CreateCustomerDto {
  @IsString() name: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() address?: string;
}

export class CreateVehicleDto {
  @IsString() make: string;
  @IsString() model: string;
  @IsString() year: number;
  @IsOptional() @IsString() colour?: string;
  @IsOptional() @IsString() registration?: string;
  @IsOptional() @IsString() vin?: string;
}

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer) private customersRepo: Repository<Customer>,
    @InjectRepository(Vehicle) private vehiclesRepo: Repository<Vehicle>,
  ) {}

  findAll(search?: string) {
    if (search) {
      return this.customersRepo.find({
        where: [
          { name: ILike(`%${search}%`) },
          { email: ILike(`%${search}%`) },
          { phone: ILike(`%${search}%`) },
        ],
        order: { name: 'ASC' },
      });
    }
    return this.customersRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const customer = await this.customersRepo.findOne({
      where: { id },
      relations: ['vehicles', 'jobs', 'jobs.vehicle'],
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async create(dto: CreateCustomerDto) {
    const customer = this.customersRepo.create(dto);
    return this.customersRepo.save(customer);
  }

  async update(id: string, dto: Partial<CreateCustomerDto>) {
    const customer = await this.findOne(id);
    Object.assign(customer, dto);
    return this.customersRepo.save(customer);
  }

  async remove(id: string) {
    const customer = await this.findOne(id);
    return this.customersRepo.remove(customer);
  }

  async addVehicle(customerId: string, dto: CreateVehicleDto) {
    await this.findOne(customerId);
    const vehicle = this.vehiclesRepo.create({ ...dto, customer_id: customerId });
    return this.vehiclesRepo.save(vehicle);
  }

  async updateVehicle(vehicleId: string, dto: Partial<CreateVehicleDto>) {
    const vehicle = await this.vehiclesRepo.findOne({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    Object.assign(vehicle, dto);
    return this.vehiclesRepo.save(vehicle);
  }

  async removeVehicle(vehicleId: string) {
    const vehicle = await this.vehiclesRepo.findOne({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return this.vehiclesRepo.remove(vehicle);
  }
}
