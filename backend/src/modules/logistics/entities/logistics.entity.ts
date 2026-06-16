import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Tooth } from '../../tooth/entities/tooth.entity';
import { User } from '../../user/entities/user.entity';

export type LogisticsType = 'ship' | 'deliver' | 'return';

@Entity('logistics')
export class Logistics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  toothId: number;

  @ManyToOne(() => Tooth, tooth => tooth.logistics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'toothId' })
  tooth: Tooth;

  @Column({
    type: 'text',
    default: 'ship',
  })
  type: LogisticsType;

  @Column()
  operatorId: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'operatorId' })
  operator: User;

  @Column({ nullable: true })
  trackingNo: string;

  @Column({ nullable: true })
  carrier: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  receiver: string;

  @Column({ type: 'text', nullable: true })
  receiverPhone: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;
}
