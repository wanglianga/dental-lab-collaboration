import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Repair } from './entities/repair.entity';
import { CreateRepairDto } from './dto/create-repair.dto';
import { Tooth } from '../tooth/entities/tooth.entity';

@Injectable()
export class RepairService {
  constructor(
    @InjectRepository(Repair)
    private repairsRepository: Repository<Repair>,
    @InjectRepository(Tooth)
    private teethRepository: Repository<Tooth>,
  ) {}

  async create(dto: CreateRepairDto): Promise<Repair> {
    const repair = this.repairsRepository.create(dto);
    const saved = await this.repairsRepository.save(repair);

    const tooth = await this.teethRepository.findOne({ where: { id: dto.toothId } });
    if (tooth) {
      tooth.status = 'rework';
      await this.teethRepository.save(tooth);
    }

    return this.findOne(saved.id);
  }

  findAll(status?: string, toothId?: number): Promise<Repair[]> {
    const qb = this.repairsRepository.createQueryBuilder('repair')
      .leftJoinAndSelect('repair.reporter', 'reporter')
      .leftJoinAndSelect('repair.handler', 'handler')
      .leftJoinAndSelect('repair.tooth', 'tooth')
      .orderBy('repair.createdAt', 'DESC');

    if (status) {
      qb.where('repair.status = :status', { status });
    }
    if (toothId) {
      qb.andWhere('repair.toothId = :toothId', { toothId });
    }

    return qb.getMany();
  }

  findOne(id: number): Promise<Repair> {
    const repair = this.repairsRepository.findOne({
      where: { id },
      relations: ['reporter', 'handler', 'tooth', 'tooth.order', 'tooth.order.patient'],
    });
    if (!repair) throw new NotFoundException('返修记录不存在');
    return repair;
  }

  async update(id: number, dto: Partial<CreateRepairDto>): Promise<Repair> {
    await this.repairsRepository.update(id, dto);
    if (dto.status === 'completed') {
      const repair = await this.findOne(id);
      const tooth = await this.teethRepository.findOne({ where: { id: repair.toothId } });
      if (tooth) {
        tooth.status = 'inspection';
        tooth.currentStage = 'quality_check';
        await this.teethRepository.save(tooth);
      }
    }
    return this.findOne(id);
  }
}
