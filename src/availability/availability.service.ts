import {
    Injectable, BadRequestException, NotFoundException, ConflictException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { RecurringAvailability, DayOfWeek } from './recurring-availability.entity';
  import { CustomAvailability } from './custom-availability.entity';
  import { CreateRecurringDto } from './dto/create-recurring.dto';
  import { UpdateRecurringDto } from './dto/update-recurring.dto';
  import { CreateOverrideDto } from './dto/create-override.dto';
  import { Doctor } from '../doctor/doctor.entity';
  
  @Injectable()
  export class AvailabilityService {
    constructor(
      @InjectRepository(RecurringAvailability)
      private recurringRepo: Repository<RecurringAvailability>,
      @InjectRepository(CustomAvailability)
      private customRepo: Repository<CustomAvailability>,
      @InjectRepository(Doctor)
      private doctorRepo: Repository<Doctor>,
    ) {}
  
    private ensureDoctorProfile(doctorId: number | null): number {
      if (!doctorId) {
        throw new BadRequestException('Please create your doctor profile first before setting availability');
      }
      return doctorId;
    }
  
    private validateTimeRange(startTime: string, endTime: string) {
      if (startTime >= endTime) {
        throw new BadRequestException('startTime must be before endTime');
      }
    }
  
    private isOverlapping(
      existingSlots: { startTime: string; endTime: string }[],
      newStart: string,
      newEnd: string,
    ): boolean {
      return existingSlots.some(
        (slot) => newStart < slot.endTime && newEnd > slot.startTime,
      );
    }
  
    // ---------- Recurring Availability ----------
  
    async createRecurring(doctorId: number | null, dto: CreateRecurringDto) {
      doctorId = this.ensureDoctorProfile(doctorId);
      this.validateTimeRange(dto.startTime, dto.endTime);
  
      const existingSlots = await this.recurringRepo.find({
        where: { doctorId, dayOfWeek: dto.dayOfWeek },
      });
  
      const duplicate = existingSlots.find(
        (slot) => slot.startTime === dto.startTime && slot.endTime === dto.endTime,
      );
      if (duplicate) {
        throw new ConflictException('This availability slot already exists');
      }
  
      if (this.isOverlapping(existingSlots, dto.startTime, dto.endTime)) {
        throw new ConflictException('This time slot overlaps with an existing slot');
      }
  
      const availability = this.recurringRepo.create({ doctorId, ...dto });
      return this.recurringRepo.save(availability);
    }
  
    async getRecurring(doctorId: number | null) {
      doctorId = this.ensureDoctorProfile(doctorId);
      return this.recurringRepo.find({
        where: { doctorId },
        order: { dayOfWeek: 'ASC', startTime: 'ASC' },
      });
    }
  
    async updateRecurring(doctorId: number | null, id: number, dto: UpdateRecurringDto) {
      doctorId = this.ensureDoctorProfile(doctorId);
  
      const availability = await this.recurringRepo.findOne({ where: { id, doctorId } });
      if (!availability) throw new NotFoundException('Availability not found');
  
      const newStart = dto.startTime ?? availability.startTime;
      const newEnd = dto.endTime ?? availability.endTime;
      const newDay = dto.dayOfWeek ?? availability.dayOfWeek;
  
      this.validateTimeRange(newStart, newEnd);
  
      const existingSlots = await this.recurringRepo.find({
        where: { doctorId, dayOfWeek: newDay },
      });
      const otherSlots = existingSlots.filter((slot) => slot.id !== id);
  
      if (this.isOverlapping(otherSlots, newStart, newEnd)) {
        throw new ConflictException('This time slot overlaps with an existing slot');
      }
  
      Object.assign(availability, dto);
      return this.recurringRepo.save(availability);
    }
  
    async deleteRecurring(doctorId: number | null, id: number) {
      doctorId = this.ensureDoctorProfile(doctorId);
  
      const availability = await this.recurringRepo.findOne({ where: { id, doctorId } });
      if (!availability) throw new NotFoundException('Availability not found');
  
      await this.recurringRepo.remove(availability);
      return { message: 'Availability deleted successfully' };
    }
  
    // ---------- Custom Override Availability ----------
  
    async createOverride(doctorId: number | null, dto: CreateOverrideDto) {
      doctorId = this.ensureDoctorProfile(doctorId);
      this.validateTimeRange(dto.startTime, dto.endTime);
  
      const today = new Date().toISOString().split('T')[0];
      if (dto.date < today) {
        throw new BadRequestException('Cannot set availability for a past date');
      }
  
      const existingSlots = await this.customRepo.find({
        where: { doctorId, date: dto.date },
      });
  
      const duplicate = existingSlots.find(
        (slot) => slot.startTime === dto.startTime && slot.endTime === dto.endTime,
      );
      if (duplicate) {
        throw new ConflictException('This override slot already exists for this date');
      }
  
      if (this.isOverlapping(existingSlots, dto.startTime, dto.endTime)) {
        throw new ConflictException('This time slot overlaps with an existing override on this date');
      }
  
      const override = this.customRepo.create({ doctorId, ...dto });
      return this.customRepo.save(override);
    }
  
    async getAvailabilityByDate(doctorId: number | null, date: string) {
      doctorId = this.ensureDoctorProfile(doctorId);
  
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
      }
  
      const overrides = await this.customRepo.find({ where: { doctorId, date } });
  
      if (overrides.length > 0) {
        return {
          date,
          type: 'custom',
          slots: overrides.map((o) => ({ startTime: o.startTime, endTime: o.endTime })),
        };
      }
  
      const dayOfWeek = this.getDayOfWeek(date);
      const recurring = await this.recurringRepo.find({
        where: { doctorId, dayOfWeek },
        order: { startTime: 'ASC' },
      });
  
      if (recurring.length === 0) {
        return {
          date,
          type: 'none',
          message: 'Doctor not available on this date',
          slots: [],
        };
      }
  
      return {
        date,
        type: 'recurring',
        dayOfWeek,
        slots: recurring.map((r) => ({ startTime: r.startTime, endTime: r.endTime })),
      };
    }
  
    private getDayOfWeek(date: string): DayOfWeek {
      const days = [
        DayOfWeek.SUNDAY, DayOfWeek.MONDAY, DayOfWeek.TUESDAY,
        DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY,
      ];
      const dayIndex = new Date(date + 'T00:00:00').getDay();
      return days[dayIndex];
    }
  
    // ---------- Slot Generation for Patients ----------
  
    async getDoctorSlots(doctorId: number, date: string, duration: number = 15) {
      const doctor = await this.doctorRepo.findOne({ where: { id: doctorId } });
      if (!doctor) throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
  
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
      }
  
      const today = new Date().toISOString().split('T')[0];
      if (date < today) {
        throw new BadRequestException('Cannot fetch slots for a past date');
      }
  
      if (!duration || duration <= 0 || duration > 240) {
        throw new BadRequestException('Invalid slot duration. Must be between 5 and 240 minutes');
      }
  
      const overrides = await this.customRepo.find({ where: { doctorId, date } });
  
      let timeRanges: { startTime: string; endTime: string }[] = [];
  
      if (overrides.length > 0) {
        timeRanges = overrides.map((o) => ({ startTime: o.startTime, endTime: o.endTime }));
      } else {
        const dayOfWeek = this.getDayOfWeek(date);
        const recurring = await this.recurringRepo.find({
          where: { doctorId, dayOfWeek },
          order: { startTime: 'ASC' },
        });
        timeRanges = recurring.map((r) => ({ startTime: r.startTime, endTime: r.endTime }));
      }
  
      if (timeRanges.length === 0) {
        return {
          doctorId,
          date,
          duration,
          message: 'No availability found for this date',
          slots: [],
        };
      }
  
      let allSlots: { startTime: string; endTime: string }[] = [];
  
      for (const range of timeRanges) {
        const slots = this.generateSlots(range.startTime, range.endTime, duration);
        allSlots = [...allSlots, ...slots];
      }
  
      const now = new Date();
      const isToday = date === today;
  
      if (isToday) {
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        allSlots = allSlots.filter((slot) => slot.startTime > currentTime);
      }
  
      if (allSlots.length === 0) {
        return {
          doctorId,
          date,
          duration,
          message: 'No slots available for this date',
          slots: [],
        };
      }
  
      return {
        doctorId,
        date,
        duration,
        totalSlots: allSlots.length,
        slots: allSlots,
      };
    }
  
    private generateSlots(
      startTime: string,
      endTime: string,
      duration: number,
    ): { startTime: string; endTime: string }[] {
      const slots: { startTime: string; endTime: string }[] = [];
  
      let [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
  
      let startTotalMinutes = startH * 60 + startM;
      const endTotalMinutes = endH * 60 + endM;
  
      while (startTotalMinutes + duration <= endTotalMinutes) {
        const slotStart = this.minutesToTime(startTotalMinutes);
        const slotEnd = this.minutesToTime(startTotalMinutes + duration);
  
        slots.push({ startTime: slotStart, endTime: slotEnd });
        startTotalMinutes += duration;
      }
  
      return slots;
    }
  
    private minutesToTime(totalMinutes: number): string {
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
  }