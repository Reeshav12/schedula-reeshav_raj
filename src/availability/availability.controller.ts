import {
    Controller, Post, Get, Patch, Delete, Body, Param, Query,
    UseGuards, Request, ParseIntPipe,
  } from '@nestjs/common';
  import { AvailabilityService } from './availability.service';
  import { CreateRecurringDto } from './dto/create-recurring.dto';
  import { UpdateRecurringDto } from './dto/update-recurring.dto';
  import { CreateOverrideDto } from './dto/create-override.dto';
  import { AuthGuard } from '@nestjs/passport';
  import { RolesGuard } from '../auth/roles.guard';
  import { Roles } from '../auth/roles.decorator';
  
  @Controller('doctor/availability')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('DOCTOR')
  export class AvailabilityController {
    constructor(private availabilityService: AvailabilityService) {}
  
    @Post()
    createRecurring(@Request() req, @Body() dto: CreateRecurringDto) {
      return this.availabilityService.createRecurring(req.user.doctorId, dto);
    }
  
    @Get()
    getRecurring(@Request() req) {
      return this.availabilityService.getRecurring(req.user.doctorId);
    }
  
    @Patch(':id')
    updateRecurring(
      @Request() req,
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateRecurringDto,
    ) {
      return this.availabilityService.updateRecurring(req.user.doctorId, id, dto);
    }
  
    @Delete(':id')
    deleteRecurring(@Request() req, @Param('id', ParseIntPipe) id: number) {
      return this.availabilityService.deleteRecurring(req.user.doctorId, id);
    }
  
    @Post('override')
    createOverride(@Request() req, @Body() dto: CreateOverrideDto) {
      return this.availabilityService.createOverride(req.user.doctorId, dto);
    }
  
    @Get('date')
    getByDate(@Request() req, @Query('date') date: string) {
      return this.availabilityService.getAvailabilityByDate(req.user.doctorId, date);
    }
  }