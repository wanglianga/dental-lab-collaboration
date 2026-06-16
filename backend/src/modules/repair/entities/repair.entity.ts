import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Tooth } from '../../tooth/entities/tooth.entity';
import { User } from '../../user/entities/user.entity';

export type RepairStatus = 'pending' | 'processing' | 'completed' | 'returned';

@Entity('repairs')
export class Repair {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'text', nullable: true })
  repairAction: string;

  @Column({
    type: 'text',
    default: 'pending',
  })
  status: RepairStatus;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
