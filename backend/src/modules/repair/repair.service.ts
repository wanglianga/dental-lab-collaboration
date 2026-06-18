import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Repair } from './entities/repair.entity';
import { CreateRepairDto } from './dto/create-repair.dto';
import { Tooth } from '../tooth/entities/tooth.entity';
import { FileRecord } from '../file/entities/file.entity';

@Injectable()
export class RepairService {
  constructor(
    @InjectRepository(Repair)
    private repairsRepository: Repository<Repair>,
    @InjectRepository(Tooth)
    private teethRepository: Repository<Tooth>,
    @InjectRepository(FileRecord)
    private filesRepository: Repository<FileRecord>,
  ) {}

  async create(dto: CreateRepairDto): Promise<Repair> {
    const { tryPhotoIds, ...repairData } = dto;
    const repair = this.repairsRepository.create({
      ...repairData,
      status: repairData.status || 'pending',
    });
    const saved = await this.repairsRepository.save(repair);

    if (tryPhotoIds && tryPhotoIds.length > 0) {
      await this.filesRepository.update(
        { id: In(tryPhotoIds) },
        { repairId: saved.id },
      );
    }

    const tooth = await this.teethRepository.findOne({ where: { id: dto.toothId } });
    if (tooth) {
      tooth.status = 'rework';
      await this.teethRepository.save(tooth);
    }

    return this.findOne(saved.id);
  }

  findAll(status?: string, toothId?: number, repairType?: string): Promise<Repair[]> {
    const qb = this.repairsRepository.createQueryBuilder('repair')
      .leftJoinAndSelect('repair.reporter', 'reporter')
      .leftJoinAndSelect('repair.handler', 'handler')
      .leftJoinAndSelect('repair.inspector', 'inspector')
      .leftJoinAndSelect('repair.tooth', 'tooth')
      .leftJoinAndSelect('repair.tryPhotos', 'tryPhotos')
      .orderBy('repair.createdAt', 'DESC');

    if (status) {
      qb.where('repair.status = :status', { status });
    }
    if (toothId) {
      qb.andWhere('repair.toothId = :toothId', { toothId });
    }
    if (repairType) {
      qb.andWhere('repair.repairType = :repairType', { repairType });
    }

    return qb.getMany();
  }

  findOne(id: number): Promise<Repair> {
    const repair = this.repairsRepository.findOne({
      where: { id },
      relations: ['reporter', 'handler', 'inspector', 'tooth', 'tooth.order', 'tooth.order.patient', 'tryPhotos'],
    });
    if (!repair) throw new NotFoundException('返修记录不存在');
    return repair;
  }

  async technicianHandle(id: number, dto: Partial<CreateRepairDto>, handlerId: number): Promise<Repair> {
    const repair = await this.findOne(id);
    if (!repair) throw new NotFoundException('返修记录不存在');

    const updateData: any = {
      handlerId,
      technicianAction: dto.technicianAction,
      repairAction: dto.repairAction,
      remark: dto.remark,
    };

    if (dto.status === 'technician_completed') {
      updateData.status = 'technician_completed';
    } else if (dto.status) {
      updateData.status = dto.status;
    } else {
      updateData.status = 'processing';
    }

    await this.repairsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async inspectorReview(id: number, dto: Partial<CreateRepairDto>, inspectorId: number): Promise<Repair> {
    const repair = await this.findOne(id);
    if (!repair) throw new NotFoundException('返修记录不存在');

    const updateData: any = {
      inspectorId,
      inspectionPassed: dto.inspectionPassed,
      inspectionRemark: dto.inspectionRemark,
    };

    if (dto.inspectionPassed) {
      updateData.status = 'completed';
      const tooth = await this.teethRepository.findOne({ where: { id: repair.toothId } });
      if (tooth) {
        tooth.status = 'inspection';
        tooth.currentStage = 'quality_check';
        await this.teethRepository.save(tooth);
      }
    } else {
      updateData.status = 'returned';
    }

    await this.repairsRepository.update(id, updateData);
    return this.findOne(id);
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
