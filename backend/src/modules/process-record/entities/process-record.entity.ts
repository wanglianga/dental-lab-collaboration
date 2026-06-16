import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Tooth } from '../../tooth/entities/tooth.entity';
import { User } from '../../user/entities/user.entity';

@Entity('process_records')
export class ProcessRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  toothId: number;

  @ManyToOne(() => Tooth, tooth => tooth.processRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'toothId' })
  tooth: Tooth;

  @Column()
  stage: string;

  @Column()
  status: string;

  @Column()
  operatorId: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'operatorId' })
  operator: User;

  @Column({ type: 'text', nullable: true })
  note: string;

  @CreateDateColumn()
  createdAt: Date;
}
