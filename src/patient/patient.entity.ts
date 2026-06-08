import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  userId: number;

  @Column()
  fullName: string;

  @Column()
  age: number;

  @Column()
  gender: string;

  @Column()
  contactNumber: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  healthInfo: string;

  @CreateDateColumn()
  createdAt: Date;
}