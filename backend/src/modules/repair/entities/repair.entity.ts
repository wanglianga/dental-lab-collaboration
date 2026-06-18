import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Tooth } from '../../tooth/entities/tooth.entity';
import { User } from '../../user/entities/user.entity';
import { FileRecord } from '../../file/entities/file.entity';

export type RepairStatus = 'pending' | 'processing' | 'technician_completed' | 'inspecting' | 'completed' | 'returned';
export type RepairType = 'general' | 'try_in';
export type RepairIssue = 'margin_gap' | 'color_gray' | 'occlusion_high' | 'contact_tight' | 'other';
export type TechnicianAction = 'recolor' | 'remake' | 'fine_tune' | 'reimpression';

@Entity('repairs')
export class Repair {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'text',
    default: 'general',
  })
  repairType: RepairType;

  @Column()
  toothId: number;

  @ManyToOne(() => Tooth, tooth => tooth.repairs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'toothId' })
  tooth: Tooth;

  @Column()
  reporterId: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'reporterId' })
  reporter: User;

  @Column({ nullable: true })
  handlerId: number;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'handlerId' })
  handler: User;

  @Column({ nullable: true })
  inspectorId: number;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'inspectorId' })
  inspector: User;

  @Column({ type: 'text', nullable: true })
  issue: RepairIssue;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'text', nullable: true })
  technicianAction: TechnicianAction;

  @Column({ type: 'text', nullable: true })
  repairAction: string;

  @Column({ type: 'boolean', default: false })
  affectsCharging: boolean;

  @Column({ type: 'datetime', nullable: true })
  revisitDate: Date;

  @Column({ type: 'text', nullable: true })
  inspectionRemark: string;

  @Column({ type: 'boolean', nullable: true })
  inspectionPassed: boolean;

  @Column({
    type: 'text',
    default: 'pending',
  })
  status: RepairStatus;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @OneToMany(() => FileRecord, f => f.repair, { cascade: true })
  tryPhotos: FileRecord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
