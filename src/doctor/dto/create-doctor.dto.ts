import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDoctorDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  specialization: string;

  @IsNotEmpty()
  @IsNumber()
  experience: number;

  @IsNotEmpty()
  @IsString()
  qualification: string;

  @IsNotEmpty()
  @IsNumber()
  consultationFee: number;

  @IsOptional()
  @IsString()
  consultationHours?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}