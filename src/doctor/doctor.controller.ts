import {
  Controller, Post, Get, Patch, Body,
  UseGuards, Request, Param, Query, ParseIntPipe
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { QueryDoctorDto } from './dto/query-doctor.dto';
import { SlotQueryDto } from '../availability/dto/slot-query.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AvailabilityService } from '../availability/availability.service';

@Controller('doctor')
export class DoctorController {
  constructor(
    private doctorService: DoctorService,
    private availabilityService: AvailabilityService,
  ) {}

  // ---------- Specific / Protected Routes (must come BEFORE :id routes) ----------

  @Post('profile')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('DOCTOR')
  createProfile(@Request() req, @Body() dto: CreateDoctorDto) {
    return this.doctorService.createProfile(req.user.id, dto);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('DOCTOR')
  getProfile(@Request() req) {
    return this.doctorService.getProfile(req.user.id);
  }

  @Patch('profile')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('DOCTOR')
  updateProfile(@Request() req, @Body() dto: UpdateDoctorDto) {
    return this.doctorService.updateProfile(req.user.id, dto);
  }

  // ---------- Public Routes ----------

  @Get()
  findAll(@Query() query: QueryDoctorDto) {
    return this.doctorService.findAll(query);
  }

  @Get(':id/slots')
  getSlots(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: SlotQueryDto,
  ) {
    return this.availabilityService.getDoctorSlots(id, query.date, query.duration);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.doctorService.findById(id);
  }
}