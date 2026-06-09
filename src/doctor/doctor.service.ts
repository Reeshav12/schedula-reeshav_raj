import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Doctor } from './doctor.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { QueryDoctorDto } from './dto/query-doctor.dto';

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

  async findAll(query: QueryDoctorDto) {
    const { specialization, search, page = 1, limit = 10, availability } = query;

    // Validate pagination values
    const safePage = page < 1 ? 1 : page;
    const safeLimit = limit < 1 ? 10 : limit;

    const where: any = {};

    if (specialization) {
      where.specialization = ILike(`%${specialization}%`);
    }

    if (search) {
      where.fullName = ILike(`%${search}%`);
    }

    if (availability !== undefined) {
      where.isAvailable = availability;
    }

    const [doctors, total] = await this.doctorRepository.findAndCount({
      where,
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      select: {
        id: true,
        fullName: true,
        specialization: true,
        experience: true,
        consultationFee: true,
        isAvailable: true,
        consultationHours: true,
      },
    });

    if (doctors.length === 0) {
      return {
        message: 'No doctors found',
        data: [],
        total: 0,
        page: safePage,
        limit: safeLimit,
      };
    }

    return {
      data: doctors,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  async findById(id: number): Promise<Doctor> {
    if (!id || isNaN(id)) throw new NotFoundException('Invalid doctor ID');

    const doctor = await this.doctorRepository.findOne({ where: { id } });
    if (!doctor) throw new NotFoundException(`Doctor with ID ${id} not found`);
    return doctor;
  }
}