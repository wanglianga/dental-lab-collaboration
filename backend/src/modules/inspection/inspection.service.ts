import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inspection } from './entities/inspection.entity';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { Tooth } from '../tooth/entities/tooth.entity';

@Injectable()
export class InspectionService {
  constructor(
    @InjectRepository(Inspection)
    private inspectionsRepository: Repository<Inspection>,
    @InjectRepository(Tooth)
    private teethRepository: Repository<Tooth>,
  ) {}

  async create(dto: CreateInspectionDto): Promise<Inspection> {
    const inspection = this.inspectionsRepository.create(dto);
    const saved = await this.inspectionsRepository.save(inspection);

    const tooth = await this.teethRepository.findOne({ where: { id: dto.toothId } });
    if (tooth) {
      if (dto.result === 'pass') {
        tooth.status = 'inspection';
        tooth.currentStage = 'quality_check';
      } else if (dto.result === 'rework') {
        tooth.status = 'rework';
      }
      await this.teethRepository.save(tooth);
    }

    return this.findOne(saved.id);
  }

  findAll(toothId?: number): Promise<Inspection[]> {
    const where = toothId ? { toothId } : {};
    return this.inspectionsRepository.find({ where, order: { createdAt: 'DESC' }, relations: ['inspector'] });
  }

  findOne(id: number): Promise<Inspection> {
    return this.inspectionsRepository.findOne({ where: { id }, relations: ['inspector', 'tooth'] });
  }
}
