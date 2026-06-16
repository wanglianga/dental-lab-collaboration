import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessRecord } from './entities/process-record.entity';
import { CreateProcessRecordDto } from './dto/create-process-record.dto';

@Injectable()
export class ProcessRecordService {
  constructor(
    @InjectRepository(ProcessRecord)
    private recordsRepository: Repository<ProcessRecord>,
  ) {}

  create(dto: CreateProcessRecordDto): Promise<ProcessRecord> {
    const record = this.recordsRepository.create(dto);
    return this.recordsRepository.save(record);
  }

  findAll(toothId?: number): Promise<ProcessRecord[]> {
    const where = toothId ? { toothId } : {};
    return this.recordsRepository.find({ where, order: { createdAt: 'DESC' }, relations: ['operator'] });
  }

  findOne(id: number): Promise<ProcessRecord> {
    return this.recordsRepository.findOne({ where: { id }, relations: ['operator'] });
  }
}
