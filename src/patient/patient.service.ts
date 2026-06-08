import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  async createProfile(userId: number, dto: CreatePatientDto): Promise<Patient> {
    const existing = await this.patientRepository.findOne({ where: { userId } });
    if (existing) throw new ConflictException('Patient profile already exists');

    const patient = this.patientRepository.create({ userId, ...dto });
    return this.patientRepository.save(patient);
  }

  async getProfile(userId: number): Promise<Patient> {
    const patient = await this.patientRepository.findOne({ where: { userId } });
    if (!patient) throw new NotFoundException('Patient profile not found');
    return patient;
  }

  async updateProfile(userId: number, dto: UpdatePatientDto): Promise<Patient> {
    const patient = await this.patientRepository.findOne({ where: { userId } });
    if (!patient) throw new NotFoundException('Patient profile not found');

    Object.assign(patient, dto);
    return this.patientRepository.save(patient);
  }
}