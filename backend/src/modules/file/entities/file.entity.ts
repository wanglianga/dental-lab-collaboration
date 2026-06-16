import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

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

  @Column({ nullable: true })
  orderId: number;

  @CreateDateColumn()
  createdAt: Date;
}
