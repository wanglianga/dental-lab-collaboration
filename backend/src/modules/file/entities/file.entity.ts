import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Tooth } from '../../tooth/entities/tooth.entity';
import { Repair } from '../../repair/entities/repair.entity';
import { ModelException } from '../../model-exception/entities/model-exception.entity';

@Entity('files')
export class FileRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  originalName: string;

  @Column()
  fileName: string;

  @Column()
  filePath: string;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @Column({ type: 'text', nullable: true })
  category: string;

  @Column({ nullable: true })
  toothId: number;

  @ManyToOne(() => Tooth, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'toothId' })
  tooth: Tooth;

  @Column({ nullable: true })
  repairId: number;

  @ManyToOne(() => Repair, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'repairId' })
  repair: Repair;

  @Column({ nullable: true })
  modelExceptionId: number;

  @ManyToOne(() => ModelException, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'modelExceptionId' })
  modelException: ModelException;

  @Column({ nullable: true })
  orderId: number;

  @CreateDateColumn()
  createdAt: Date;
}
