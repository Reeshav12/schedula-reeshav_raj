import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './doctor.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  async createProfile(userId: number, dto: CreateDoctorDto): Promise<Doctor> {
    const existing = await this.doctorRepository.findOne({ where: { userId } });
    if (existing) throw new ConflictException('Doctor profile already exists');

    const doctor = this.doctorRepository.create({ userId, ...dto });
    return this.doctorRepository.save(doctor);
  }

  async getProfile(userId: number): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({ where: { userId } });
    if (!doctor) throw new NotFoundException('Doctor profile not found');
    return doctor;
  }

  async updateProfile(userId: number, dto: UpdateDoctorDto): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({ where: { userId } });
    if (!doctor) throw new NotFoundException('Doctor profile not found');

    Object.assign(doctor, dto);
    return this.doctorRepository.save(doctor);
  }
}