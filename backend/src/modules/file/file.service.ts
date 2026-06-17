import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileRecord } from './entities/file.entity';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(FileRecord)
    private filesRepository: Repository<FileRecord>,
  ) {
    const uploadDir = path.resolve(__dirname, '../../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File, category?: string, toothId?: number, orderId?: number): Promise<FileRecord> {
    const fileRecord = this.filesRepository.create({
      originalName: file.originalname,
      fileName: file.filename,
      filePath: `/uploads/${file.filename}`,
      mimeType: file.mimetype,
      size: file.size,
      category,
      toothId,
      orderId,
    });
    return this.filesRepository.save(fileRecord);
  }

  findAll(toothId?: number, orderId?: number): Promise<FileRecord[]> {
    const where: any = {};
    if (toothId != null && toothId > 0) where.toothId = toothId;
    if (orderId != null && orderId > 0) where.orderId = orderId;
    return this.filesRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  findOne(id: number): Promise<FileRecord> {
    return this.filesRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    const file = await this.findOne(id);
    if (!file) throw new NotFoundException('文件不存在');
    const filePath = path.resolve(__dirname, '../../..', file.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await this.filesRepository.delete(id);
  }
}
