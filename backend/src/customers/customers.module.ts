import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer, Vehicle } from '../entities';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Vehicle])],
  providers: [CustomersService],
  controllers: [CustomersController],
})
export class CustomersModule {}
