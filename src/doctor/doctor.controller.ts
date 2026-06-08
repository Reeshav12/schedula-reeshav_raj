import { Controller, Post, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('doctor')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('DOCTOR')
export class DoctorController {
  constructor(private doctorService: DoctorService) {}

  @Post('profile')
  createProfile(@Request() req, @Body() dto: CreateDoctorDto) {
    return this.doctorService.createProfile(req.user.id, dto);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return this.doctorService.getProfile(req.user.id);
  }

  @Patch('profile')
  updateProfile(@Request() req, @Body() dto: UpdateDoctorDto) {
    return this.doctorService.updateProfile(req.user.id, dto);
  }
}