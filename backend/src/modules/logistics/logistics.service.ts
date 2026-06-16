import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logistics } from './entities/logistics.entity';
import { CreateLogisticsDto } from './dto/create-logistics.dto';
import { Tooth } from '../tooth/entities/tooth.entity';

@Injectable()
export class LogisticsService {
  constructor(
    @InjectRepository(Logistics)
    private logisticsRepository: Repository<Logistics>,
    @InjectRepository(Tooth)
    private teethRepository: Repository<Tooth>,
  ) {}

  async create(dto: CreateLogisticsDto): Promise<Logistics> {
    const logistics = this.logisticsRepository.create(dto);
    const saved = await this.logisticsRepository.save(logistics);

    const tooth = await this.teethRepository.findOne({ where: { id: dto.toothId } });
    if (tooth) {
      if (dto.type === 'ship') {
        tooth.status = 'shipped';
      } else if (dto.type === 'deliver') {
        tooth.status = 'delivered';
      } else if (dto.type === 'return') {
        tooth.status = 'rework';
      }
      await this.teethRepository.save(tooth);
    }

    return this.findOne(saved.id);
  }

  findAll(toothId?: number, type?: string): Promise<Logistics[]> {
    const qb = this.logisticsRepository.createQueryBuilder('logistics')
      .leftJoinAndSelect('logistics.operator', 'operator')
      .orderBy('logistics.createdAt', 'DESC');

    if (toothId) {
      qb.where('logistics.toothId = :toothId', { toothId });
    }
    if (type) {
      qb.andWhere('logistics.type = :type', { type });
    }

    return qb.getMany();
  }

  findOne(id: number): Promise<Logistics> {
    return this.logisticsRepository.findOne({
      where: { id },
      relations: ['operator', 'tooth', 'tooth.order', 'tooth.order.patient'],
    });
  }
}
