import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Order } from '../../order/entities/order.entity';
import { Tooth } from '../../tooth/entities/tooth.entity';
import { User } from '../../user/entities/user.entity';
import { FileRecord } from '../../file/entities/file.entity';

export type ModelExceptionStatus = 'reported' | 'notifying_patient' | 'doctor_confirming' | 'recording_loss' | 'rescheduling' | 'resolved' | 'closed';
export type ModelExceptionType = 'scan_file_corrupted' | 'plaster_model_damaged' | 'shade_photo_missing' | 'other';
export type PatientAction = 'retake_photo' | 'reimpression' | 'reschedule';
export type DoctorDecision = 'no_change' | 'adjust_plan' | 'cancel_tooth';

@Entity('model_exceptions')
export class ModelException {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'text',
  })
  exceptionType: ModelExceptionType;

  @Column({ nullable: true })
  orderId: number;

  @ManyToOne(() => Order, order => order.modelExceptions, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ nullable: true })
  toothId: number;

  @ManyToOne(() => Tooth, tooth => tooth.modelExceptions, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'toothId' })
  tooth: Tooth;

  @Column()
  reporterId: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'reporterId' })
  reporter: User;

  @Column({ nullable: true })
  receptionistId: number;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'receptionistId' })
  receptionist: User;

  @Column({ nullable: true })
  doctorId: number;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'doctorId' })
  doctor: User;

  @Column({ nullable: true })
  technicianId: number;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'technicianId' })
  technician: User;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  patientAction: PatientAction;

  @Column({ type: 'text', nullable: true })
  patientNotification: string;

  @Column({ type: 'boolean', nullable: true })
  affectsOriginalPlan: boolean;

  @Column({ type: 'text', nullable: true })
  doctorDecision: DoctorDecision;

  @Column({ type: 'text', nullable: true })
  doctorRemark: string;

  @Column({ type: 'text', nullable: true })
  completedStages: string;

  @Column({ type: 'text', nullable: true })
  materialLoss: string;

  @Column({ type: 'datetime', nullable: true })
  originalDeliveryDate: Date;

  @Column({ type: 'datetime', nullable: true })
  newDeliveryDate: Date;

  @Column({ type: 'text', nullable: true })
  deliveryDateNote: string;

  @Column({
    type: 'text',
    default: 'reported',
  })
  status: ModelExceptionStatus;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @OneToMany(() => FileRecord, f => f.modelException, { cascade: true })
  attachments: FileRecord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
