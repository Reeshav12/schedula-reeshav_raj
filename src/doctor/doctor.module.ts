import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { Doctor } from './doctor.entity';
import { AvailabilityModule } from '../availability/availability.module';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor]), AvailabilityModule],
  providers: [DoctorService],
  controllers: [DoctorController],
})
export class DoctorModule {}