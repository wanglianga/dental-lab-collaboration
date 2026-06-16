import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Tooth } from '../../tooth/entities/tooth.entity';
import { User } from '../../user/entities/user.entity';

export type InspectionResult = 'pass' | 'fail' | 'rework';

@Entity('inspections')
export class Inspection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  toothId: number;

  @ManyToOne(() => Tooth, tooth => tooth.inspections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'toothId' })
  tooth: Tooth;

  @Column()
  inspectorId: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'inspectorId' })
  inspector: User;

  @Column({ type: 'boolean', default: false })
  marginPass: boolean;

  @Column({ type: 'boolean', default: false })
  colorPass: boolean;

  @Column({ type: 'boolean', default: false })
  strengthPass: boolean;

  @Column({ type: 'boolean', default: false })
  occlusionPass: boolean;

  @Column({
    type: 'text',
    default: 'pass',
  })
  result: InspectionResult;

  @Column({ type: 'text', nullable: true })
  marginNote: string;

  @Column({ type: 'text', nullable: true })
  colorNote: string;

  @Column({ type: 'text', nullable: true })
  strengthNote: string;

  @Column({ type: 'text', nullable: true })
  occlusionNote: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;
}
