import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Patient } from '../../patient/entities/patient.entity';
import { User } from '../../user/entities/user.entity';
import { Tooth } from '../../tooth/entities/tooth.entity';

export type OrderStatus = 'pending' | 'processing' | 'partial_completed' | 'completed' | 'returned';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  orderNo: string;

  @Column()
  patientId: number;

  @ManyToOne(() => Patient, patient => patient.orders, { eager: true })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  doctorId: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'doctorId' })
  doctor: User;

  @Column({ type: 'text', nullable: true })
  clinicalNote: string;

  @Column({ type: 'text', nullable: true })
  occlusion: string;

  @Column({ type: 'text', nullable: true })
  designRequirement: string;

  @Column({
    type: 'text',
    default: 'pending',
  })
  status: OrderStatus;

  @OneToMany(() => Tooth, tooth => tooth.order)
  teeth: Tooth[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
