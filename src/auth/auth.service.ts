import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { Role } from '../users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from '../doctor/doctor.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  async signup(name: string, email: string, password: string, role: Role) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new BadRequestException('Email already registered');

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.usersService.create(name, email, hashed, role);

    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    return { message: 'Signup successful', token };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    let doctorId: number | null = null;
    if (user.role === Role.DOCTOR) {
      const doctor = await this.doctorRepository.findOne({ where: { userId: user.id } });
      doctorId = doctor ? doctor.id : null;
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      doctorId,
    });
    return { message: 'Login successful', token };
  }
}