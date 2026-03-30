import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query,
} from '@nestjs/common';
import { CustomersService, CreateCustomerDto, CreateVehicleDto } from './customers.service';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Get()
  findAll(@Query('search') search?: string) {
    return this.customersService.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateCustomerDto>) {
    return this.customersService.update(id, dto);
  }

  @Roles('owner')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }

  @Post(':id/vehicles')
  addVehicle(@Param('id') customerId: string, @Body() dto: CreateVehicleDto) {
    return this.customersService.addVehicle(customerId, dto);
  }

  @Patch('vehicles/:vehicleId')
  updateVehicle(@Param('vehicleId') vehicleId: string, @Body() dto: Partial<CreateVehicleDto>) {
    return this.customersService.updateVehicle(vehicleId, dto);
  }

  @Delete('vehicles/:vehicleId')
  removeVehicle(@Param('vehicleId') vehicleId: string) {
    return this.customersService.removeVehicle(vehicleId);
  }
}
