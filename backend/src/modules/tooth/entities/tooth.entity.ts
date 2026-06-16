import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Order } from '../../order/entities/order.entity';
import { ProcessRecord } from '../../process-record/entities/process-record.entity';
import { Inspection } from '../../inspection/entities/inspection.entity';
import { Repair } from '../../repair/entities/repair.entity';
import { Logistics } from '../../logistics/entities/logistics.entity';

export type ToothStatus = 'pending' | 'processing' | 'inspection' | 'rework' | 'shipped' | 'delivered' | 'completed';
export type ToothStage = 'model_design' | 'wax_pattern' | 'casting' | 'porcelain' | 'glazing' | 'color_adjustment' | 'quality_check' | 'completed';

@Entity('teeth')
export class Tooth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderId: number;

  @ManyToOne(() => Order, order => order.teeth, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  toothNumber: number;

  @Column()
  material: string;

  @Column()
  shade: string;

  @Column()
  restorationType: string;

  @Column({ type: 'text', nullable: true })
  requirement: string;

  @Column({ type: 'text', nullable: true })
  designFileUrl: string;

  @Column({ type: 'text', nullable: true })
  scanFileUrl: string;

  @Column({ type: 'text', nullable: true })
  colorPhotoUrl: string;

  @Column({
    type: 'text',
    default: 'pending',
  })
  status: ToothStatus;

  @Column({
    type: 'text',
    default: 'model_design',
  })
  currentStage: ToothStage;

  @Column({ type: 'text', nullable: true })
  tryFeedback: string;

  @OneToMany(() => ProcessRecord, pr => pr.tooth, { cascade: true })
  processRecords: ProcessRecord[];

  @OneToMany(() => Inspection, ins => ins.tooth, { cascade: true })
  inspections: Inspection[];

  @OneToMany(() => Repair, r => r.tooth, { cascade: true })
  repairs: Repair[];

  @OneToMany(() => Logistics, l => l.tooth, { cascade: true })
  logistics: Logistics[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
