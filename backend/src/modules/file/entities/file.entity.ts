import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Tooth } from '../../tooth/entities/tooth.entity';

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
  orderId: number;

  @CreateDateColumn()
  createdAt: Date;
}
